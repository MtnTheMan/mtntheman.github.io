const DEFAULT_PUBLIC_DELAY_MINUTES = 600;
const DEFAULT_COORDINATE_DECIMALS = 3;
const DEFAULT_MAX_PUBLIC_POINTS = 20000;
const DEFAULT_STALE_MINUTES = 180;
const DEFAULT_MAX_SPIKE_DISTANCE_KM = 75;
const DEFAULT_MAX_SPIKE_POINT_COUNT = 5;
const TRIP_START_DATE = "2026-05-17";
const TRIP_END_DATE = "2026-06-22";
const PUBLIC_WINDOW_START = "2026-05-17T08:00:00-04:00";
const PUBLIC_WINDOW_END = "2026-06-22T19:00:00-04:00";
const STATIC_ROUTE_CUTOFF = "2026-06-09T15:39:56Z";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }), request, env);
    }

    try {
      if (url.pathname === "/api/tracker/ingest" && request.method === "POST") {
        return withCors(await ingestOwnTracks(request, env), request, env);
      }

      if (url.pathname === "/api/tracker/geojson" && request.method === "GET") {
        return withCors(await publicGeoJson(env), request, env);
      }

      if (url.pathname === "/api/tracker/health" && request.method === "GET") {
        return withCors(await health(env), request, env);
      }

      if (url.pathname === "/api/tracker/export.csv" && request.method === "GET") {
        return withCors(await exportCsv(request, env), request, env);
      }

      return withCors(json({ ok: false, error: "not_found" }, 404), request, env);
    } catch (error) {
      return withCors(json({ ok: false, error: "server_error", message: error.message }, 500), request, env);
    }
  }
};

async function ingestOwnTracks(request, env) {
  if (!isAuthorized(request, env)) {
    return json({ ok: false, error: "unauthorized" }, 401, {
      "WWW-Authenticate": 'Basic realm="Trip Tracker"'
    });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  if (!payload || typeof payload !== "object") {
    return json({ ok: false, error: "invalid_payload" }, 400);
  }

  const rawType = stringOrNull(payload._type);
  if (rawType !== "location") {
    return json({ ok: true, stored: false, reason: "ignored_non_location_payload" });
  }

  const lat = numberOrNull(payload.lat);
  const lon = numberOrNull(payload.lon);
  const validationError = validateCoordinates(lat, lon, env);
  if (validationError) {
    return json({ ok: false, error: validationError }, 400);
  }

  const nowEpoch = epochSeconds();
  const recordedAt = integerOrNull(payload.tst) ?? nowEpoch;
  const receivedAt = nowEpoch;
  const velocity = numberOrNull(payload.vel) ?? numberOrNull(payload.velocity);

  const result = await env.DB.prepare(
    `INSERT INTO location_points
      (recorded_at, received_at, lat, lon, acc, alt, batt, velocity, raw_type, source)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      recordedAt,
      receivedAt,
      lat,
      lon,
      numberOrNull(payload.acc),
      numberOrNull(payload.alt),
      recognizedBattery(payload),
      velocity,
      rawType,
      "owntracks"
    )
    .run();

  return json({ ok: true, stored: true, id: result.meta.last_row_id });
}

async function publicGeoJson(env) {
  const config = publicConfig(env);
  const cutoff = epochSeconds() - config.publicDelayMinutes * 60;
  const windowStart = epochFromIso(PUBLIC_WINDOW_START);
  const windowEnd = epochFromIso(PUBLIC_WINDOW_END);
  const publicEnd = Math.min(cutoff, windowEnd);
  const recentWindowStart = Math.max(windowStart, epochFromIso(STATIC_ROUTE_CUTOFF));

  if (publicEnd < windowStart) {
    return json(buildFeatureCollection([], config));
  }

  const rows = await env.DB.prepare(
    `SELECT id, recorded_at, received_at, lat, lon, acc, alt, batt, velocity, raw_type, source
     FROM location_points
     WHERE recorded_at >= ?
       AND recorded_at <= ?
     ORDER BY recorded_at DESC
     LIMIT ?`
  ).bind(recentWindowStart, publicEnd, config.maxPublicPoints).all();

  return json(buildFeatureCollection((rows.results || []).reverse(), config));
}

async function health(env) {
  const countResult = await env.DB.prepare(
    "SELECT COUNT(*) AS point_count, MAX(received_at) AS latest_received_at FROM location_points"
  ).first();

  const config = publicConfig(env);
  const windowStart = epochFromIso(PUBLIC_WINDOW_START);
  const windowEnd = epochFromIso(PUBLIC_WINDOW_END);
  const liveEnd = Math.min(epochSeconds(), windowEnd);
  const statsRows = await env.DB.prepare(
    `SELECT recorded_at, lat, lon
     FROM location_points
     WHERE recorded_at >= ?
       AND recorded_at <= ?
     ORDER BY recorded_at ASC`
  ).bind(windowStart, liveEnd).all();
  const liveStats = routeStats(statsRows.results || []);

  return json({
    ok: true,
    service: "trip-tracker",
    point_count: countResult?.point_count ?? 0,
    latest_received_at: countResult?.latest_received_at ?? null,
    live_stats: {
      total_distance_miles: liveStats.totalDistanceMiles,
      total_distance_kilometers: liveStats.totalDistanceKilometers,
      foot_distance_miles: liveStats.footDistanceMiles,
      foot_distance_kilometers: liveStats.footDistanceKilometers
    },
    config: {
      public_delay_minutes: config.publicDelayMinutes,
      coordinate_decimals: config.coordinateDecimals,
      max_public_points: config.maxPublicPoints,
      stale_minutes: config.staleMinutes,
      allow_zero_coords: config.allowZeroCoords,
      bounding_box: configuredBounds(env),
      cors_allowed_origins: allowedOrigins(env),
      trip_start_date: TRIP_START_DATE,
      trip_end_date: TRIP_END_DATE,
      public_window_start: PUBLIC_WINDOW_START,
      public_window_end: PUBLIC_WINDOW_END,
      static_route_cutoff: STATIC_ROUTE_CUTOFF
    }
  });
}

async function exportCsv(request, env) {
  if (!isAuthorized(request, env)) {
    return json({ ok: false, error: "unauthorized" }, 401, {
      "WWW-Authenticate": 'Basic realm="Trip Tracker"'
    });
  }

  const rows = await env.DB.prepare(
    `SELECT id, recorded_at, received_at, lat, lon, acc, alt, batt, velocity, raw_type, source
     FROM location_points
     ORDER BY recorded_at ASC`
  ).all();

  const columns = ["id", "recorded_at", "received_at", "lat", "lon", "acc", "alt", "batt", "velocity", "raw_type", "source"];
  const body = [
    columns.join(","),
    ...(rows.results || []).map((row) => columns.map((column) => csvCell(row[column])).join(","))
  ].join("\n");

  return new Response(`${body}\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="trip-tracker-location-points.csv"'
    }
  });
}

function publicRows(rows, config) {
  return filterRouteSpikes(rows.map((row) => ({
    ...row,
    lat: roundCoordinate(row.lat, config.coordinateDecimals),
    lon: roundCoordinate(row.lon, config.coordinateDecimals)
  })), config);
}

function buildFeatureCollection(rows, config, stats = null) {
  const roundedRows = publicRows(rows, config);
  const routeStatsSummary = stats || routeStats(roundedRows);

  const latest = roundedRows[roundedRows.length - 1] || null;
  const coordinates = roundedRows.map((row) => [row.lon, row.lat]);
  const routeCoordinates = coordinates.length === 1 ? [coordinates[0], coordinates[0]] : coordinates;
  const status = tripStatus(latest, config);

  const sharedProperties = {
    last_recorded_at: latest?.recorded_at ?? null,
    received_at: latest?.received_at ?? null,
    acc: latest?.acc ?? null,
    batt: latest?.batt ?? null,
    public_delay_minutes: config.publicDelayMinutes,
    coordinate_decimals: config.coordinateDecimals,
    point_count: roundedRows.length,
    total_distance_miles: routeStatsSummary.totalDistanceMiles,
    total_distance_kilometers: routeStatsSummary.totalDistanceKilometers,
    foot_distance_miles: routeStatsSummary.footDistanceMiles,
    foot_distance_kilometers: routeStatsSummary.footDistanceKilometers,
    privacy_mode: privacyMode(config),
    public_window_start: PUBLIC_WINDOW_START,
    public_window_end: PUBLIC_WINDOW_END,
    static_route_cutoff: STATIC_ROUTE_CUTOFF
  };

  const features = [];
  if (routeCoordinates.length > 0) {
    features.push({
      type: "Feature",
      geometry: { type: "LineString", coordinates: routeCoordinates },
      properties: {
        name: "Route",
        kind: "route",
        ...sharedProperties
      }
    });
  }

  if (latest) {
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [latest.lon, latest.lat] },
      properties: {
        name: "Latest delayed location",
        kind: "latest",
        recorded_at: latest.recorded_at,
        velocity: latest.velocity,
        raw_type: latest.raw_type,
        source: latest.source,
        ...sharedProperties
      }
    });
  }

  return {
    type: "FeatureCollection",
    properties: {
      ...sharedProperties,
      generated_at: epochSeconds(),
      status
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      lastRecordedAt: latest ? epochToIso(latest.recorded_at) : null,
      lastReceivedAt: latest ? epochToIso(latest.received_at) : null,
      pointCount: roundedRows.length,
      publicDelayMinutes: config.publicDelayMinutes,
      coordinateDecimals: config.coordinateDecimals,
      totalDistanceMiles: routeStatsSummary.totalDistanceMiles,
      totalDistanceKilometers: routeStatsSummary.totalDistanceKilometers,
      footDistanceMiles: routeStatsSummary.footDistanceMiles,
      footDistanceKilometers: routeStatsSummary.footDistanceKilometers,
      privacyMode: privacyMode(config),
      feedStatus: status,
      tripStartDate: TRIP_START_DATE,
      tripEndDate: TRIP_END_DATE,
      publicWindowStart: PUBLIC_WINDOW_START,
      publicWindowEnd: PUBLIC_WINDOW_END,
      staticRouteCutoff: STATIC_ROUTE_CUTOFF
    },
    features
  };
}

function routeStats(rows) {
  let totalDistanceKilometers = 0;
  let footDistanceKilometers = 0;

  for (let index = 1; index < rows.length; index += 1) {
    const previous = rows[index - 1];
    const current = rows[index];
    const segmentKilometers = distanceKm(previous, current);
    totalDistanceKilometers += segmentKilometers;

    const elapsedHours = (current.recorded_at - previous.recorded_at) / 3600;
    if (elapsedHours > 0) {
      const segmentMiles = kilometersToMiles(segmentKilometers);
      if (segmentMiles / elapsedHours < 7) {
        footDistanceKilometers += segmentKilometers;
      }
    }
  }

  return {
    totalDistanceMiles: roundStat(kilometersToMiles(totalDistanceKilometers)),
    totalDistanceKilometers: roundStat(totalDistanceKilometers),
    footDistanceMiles: roundStat(kilometersToMiles(footDistanceKilometers)),
    footDistanceKilometers: roundStat(footDistanceKilometers)
  };
}

function tripStatus(latest, config) {
  const tripEnd = new Date(PUBLIC_WINDOW_END).getTime();
  if (Date.now() > tripEnd) return "trip_complete";
  if (!latest) return "stale";

  const latestAgeMinutes = (epochSeconds() - latest.recorded_at) / 60;
  if (latestAgeMinutes > config.publicDelayMinutes + config.staleMinutes) return "stale";
  return config.publicDelayMinutes > 0 || config.coordinateDecimals <= 3 ? "delayed" : "live";
}

function isAuthorized(request, env) {
  const auth = request.headers.get("Authorization") || "";

  if (auth.startsWith("Bearer ")) {
    return Boolean(env.TRACKER_TOKEN) && timingSafeEqual(auth.slice(7), env.TRACKER_TOKEN);
  }

  if (auth.startsWith("Basic ")) {
    const credentials = decodeBasicAuth(auth);
    if (!credentials) return false;
    return Boolean(env.TRACKER_USERNAME && env.TRACKER_PASSWORD)
      && timingSafeEqual(credentials.username, env.TRACKER_USERNAME)
      && timingSafeEqual(credentials.password, env.TRACKER_PASSWORD);
  }

  return false;
}

function decodeBasicAuth(auth) {
  try {
    const decoded = atob(auth.slice(6));
    const separator = decoded.indexOf(":");
    if (separator === -1) return null;
    return {
      username: decoded.slice(0, separator),
      password: decoded.slice(separator + 1)
    };
  } catch {
    return null;
  }
}

function validateCoordinates(lat, lon, env) {
  if (lat === null || lon === null) return "missing_coordinates";
  if (lat < -90 || lat > 90) return "invalid_latitude";
  if (lon < -180 || lon > 180) return "invalid_longitude";
  if (lat === 0 && lon === 0 && !booleanEnv(env.ALLOW_ZERO_COORDS)) return "zero_coordinates_rejected";

  const bounds = configuredBounds(env);
  if (bounds) {
    if (lat < bounds.min_lat || lat > bounds.max_lat || lon < bounds.min_lon || lon > bounds.max_lon) {
      return "outside_configured_bounds";
    }
  }

  return null;
}

function configuredBounds(env) {
  const minLat = numberOrNull(env.MIN_LAT);
  const maxLat = numberOrNull(env.MAX_LAT);
  const minLon = numberOrNull(env.MIN_LON);
  const maxLon = numberOrNull(env.MAX_LON);

  if ([minLat, maxLat, minLon, maxLon].every((value) => value === null)) return null;
  if ([minLat, maxLat, minLon, maxLon].some((value) => value === null)) {
    throw new Error("MIN_LAT, MAX_LAT, MIN_LON, and MAX_LON must all be set when using bounds");
  }

  return {
    min_lat: minLat,
    max_lat: maxLat,
    min_lon: minLon,
    max_lon: maxLon
  };
}

function publicConfig(env) {
  return {
    publicDelayMinutes: integerEnv(env.PUBLIC_DELAY_MINUTES, DEFAULT_PUBLIC_DELAY_MINUTES),
    coordinateDecimals: clamp(integerEnv(env.COORDINATE_DECIMALS, DEFAULT_COORDINATE_DECIMALS), 0, 6),
    maxPublicPoints: integerEnv(env.MAX_PUBLIC_POINTS, DEFAULT_MAX_PUBLIC_POINTS),
    staleMinutes: integerEnv(env.STALE_MINUTES, DEFAULT_STALE_MINUTES),
    maxSpikeDistanceKm: numberEnv(env.MAX_SPIKE_DISTANCE_KM, DEFAULT_MAX_SPIKE_DISTANCE_KM),
    maxSpikePointCount: integerEnv(env.MAX_SPIKE_POINT_COUNT, DEFAULT_MAX_SPIKE_POINT_COUNT),
    allowZeroCoords: booleanEnv(env.ALLOW_ZERO_COORDS)
  };
}

function recognizedBattery(payload) {
  return numberOrNull(payload.batt) ?? numberOrNull(payload.BAT) ?? numberOrNull(payload.battery);
}

function privacyMode(config) {
  return `delayed ${formatDuration(config.publicDelayMinutes)}, rounded to ${config.coordinateDecimals} decimals`;
}

function formatDuration(minutes) {
  if (minutes > 0 && minutes % 1440 === 0) {
    const days = minutes / 1440;
    return `${days} ${days === 1 ? "day" : "days"}`;
  }

  if (minutes > 0 && minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }

  return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
}

function withCors(response, request, env) {
  const headers = new Headers(response.headers);
  const origin = request.headers.get("Origin");
  const origins = allowedOrigins(env);

  if (origin && origins.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  } else if (!origin) {
    headers.set("Access-Control-Allow-Origin", "https://mtntheman.com");
  }

  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
  headers.set("Access-Control-Max-Age", "86400");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function allowedOrigins(env) {
  const configured = stringOrNull(env.CORS_ALLOWED_ORIGINS || env.CORS_ORIGIN);
  const defaults = [
    "https://mtntheman.com",
    "https://www.mtntheman.com",
    "http://mtntheman.com",
    "http://www.mtntheman.com",
    "https://mtntheman.github.io",
    "http://localhost:4000",
    "http://127.0.0.1:4000",
    "http://localhost:8080",
    "http://127.0.0.1:8080"
  ];

  if (!configured) return defaults;
  return configured.split(",").map((origin) => origin.trim()).filter(Boolean);
}

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders
    }
  });
}

function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function numberOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function integerOrNull(value) {
  const number = numberOrNull(value);
  return number === null ? null : Math.trunc(number);
}

function integerEnv(value, fallback) {
  const integer = integerOrNull(value);
  return integer === null ? fallback : integer;
}

function numberEnv(value, fallback) {
  const number = numberOrNull(value);
  return number === null ? fallback : number;
}

function stringOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  return String(value);
}

function booleanEnv(value) {
  return String(value || "").toLowerCase() === "true";
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundCoordinate(value, decimals) {
  const multiplier = 10 ** decimals;
  return Math.round(Number(value) * multiplier) / multiplier;
}

function filterRouteSpikes(rows, config) {
  if (rows.length < 3 || config.maxSpikeDistanceKm <= 0) return rows;

  const filtered = [rows[0]];
  const maxSpikePointCount = Math.max(1, config.maxSpikePointCount);

  for (let index = 1; index < rows.length - 1; index += 1) {
    const previous = filtered[filtered.length - 1];
    const lastCandidateIndex = Math.min(rows.length - 2, index + maxSpikePointCount - 1);
    let skippedSpike = false;

    for (let endIndex = index; endIndex <= lastCandidateIndex; endIndex += 1) {
      const next = rows[endIndex + 1];
      const candidates = rows.slice(index, endIndex + 1);
      const isSpike = distanceKm(previous, next) <= config.maxSpikeDistanceKm
        && candidates.every((candidate) => {
          return distanceKm(previous, candidate) > config.maxSpikeDistanceKm
            && distanceKm(candidate, next) > config.maxSpikeDistanceKm;
        });

      if (isSpike) {
        index = endIndex;
        skippedSpike = true;
        break;
      }
    }

    if (!skippedSpike) filtered.push(rows[index]);
  }

  filtered.push(rows[rows.length - 1]);
  return filtered;
}

function distanceKm(first, second) {
  const earthRadiusKm = 6371;
  const lat1 = degreesToRadians(first.lat);
  const lat2 = degreesToRadians(second.lat);
  const deltaLat = degreesToRadians(second.lat - first.lat);
  const deltaLon = degreesToRadians(second.lon - first.lon);
  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function kilometersToMiles(kilometers) {
  return kilometers * 0.621371;
}

function roundStat(value) {
  return Math.round(value * 10) / 10;
}

function degreesToRadians(value) {
  return value * Math.PI / 180;
}

function epochSeconds() {
  return Math.floor(Date.now() / 1000);
}

function epochFromIso(value) {
  return Math.floor(new Date(value).getTime() / 1000);
}

function epochToIso(value) {
  return new Date(value * 1000).toISOString();
}

function csvCell(value) {
  if (value === null || value === undefined) return "";
  return `"${String(value).replaceAll('"', '""')}"`;
}
