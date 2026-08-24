const DEFAULT_PUBLIC_DELAY_MINUTES = 600;
const DEFAULT_COORDINATE_DECIMALS = 3;
const DEFAULT_MAX_PUBLIC_POINTS = 20000;
const DEFAULT_STALE_MINUTES = 180;
const DEFAULT_MAX_SPIKE_DISTANCE_KM = 75;
const DEFAULT_MAX_SPIKE_POINT_COUNT = 5;
const TRIP_START_DATE = "2026-05-17";
const TRIP_END_DATE = "2026-06-22";
const DEFAULT_TRACK_ID = "nhr-megatrip-2026";
const TRACKS = {
  "nhr-megatrip-2026": {
    id: "nhr-megatrip-2026",
    name: "NHR Megatrip 2026",
    publicDelayMinutes: 600,
    coordinateDecimals: 3,
    publicWindowStart: "2026-05-17T08:00:00-04:00",
    publicWindowEnd: "2026-06-22T19:00:00-04:00",
    staticRouteCutoff: "2026-06-09T15:39:56Z",
    publicArchiveOnly: true,
    color: "#00ff66"
  },
  "maine-august-trip": {
    id: "maine-august-trip",
    name: "Maine August Trip",
    publicDelayMinutes: 900,
    coordinateDecimals: 3,
    publicWindowStart: "2026-08-24T13:00:00-04:00",
    publicWindowEnd: "2026-08-28T20:00:00-04:00",
    staticRouteCutoff: null,
    color: "#5ab0ff"
  }
};
const EASTERN_TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23"
});

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }), request, env);
    }

    try {
      if (url.pathname === "/api/tracker/ingest" && request.method === "POST") {
        return withCors(await ingestOwnTracks(request, env, url), request, env);
      }

      if (url.pathname === "/api/tracker/geojson" && request.method === "GET") {
        return withCors(await publicGeoJson(env, url), request, env);
      }

      if (url.pathname === "/api/tracker/health" && request.method === "GET") {
        return withCors(await health(env), request, env);
      }

      if (url.pathname === "/api/tracker/export.csv" && request.method === "GET") {
        return withCors(await exportCsv(request, env), request, env);
      }

      if (url.pathname === "/api/views/hit" && request.method === "POST") {
        return withCors(await hitPageView(request, env), request, env);
      }

      if (url.pathname === "/api/views/counts" && (request.method === "GET" || request.method === "POST")) {
        return withCors(await pageViewCounts(request, env), request, env);
      }

      return withCors(json({ ok: false, error: "not_found" }, 404), request, env);
    } catch (error) {
      return withCors(json({ ok: false, error: "server_error", message: error.message }, 500), request, env);
    }
  }
};

async function ingestOwnTracks(request, env, url) {
  if (!isAuthorized(request, env)) {
    return json({ ok: false, error: "unauthorized" }, 401, {
      "WWW-Authenticate": 'Basic realm="Trip Tracker"'
    });
  }

  const trackId = url.searchParams.get("track") || DEFAULT_TRACK_ID;
  const track = TRACKS[trackId];
  if (!track) {
    return json({ ok: false, error: "unknown_track" }, 400);
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
      (recorded_at, received_at, lat, lon, acc, alt, batt, velocity, raw_type, source, track_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
      "owntracks",
      track.id
    )
    .run();

  return json({
    ok: true,
    stored: true,
    id: result.meta.last_row_id,
    track_id: track.id,
    track_name: track.name
  });
}

async function publicGeoJson(env, url) {
  const selectedTracks = requestedTracks(url);
  if (!selectedTracks) {
    return json({ ok: false, error: "unknown_track" }, 400);
  }

  const trackResults = await Promise.all(selectedTracks.map((track) => publicTrackData(env, track)));
  return json(buildFeatureCollection(trackResults));
}

async function health(env) {
  const countResult = await env.DB.prepare(
    "SELECT COUNT(*) AS point_count, MAX(received_at) AS latest_received_at FROM location_points"
  ).first();
  const groupedRows = await env.DB.prepare(
    `SELECT track_id, COUNT(*) AS stored_count, MAX(received_at) AS latest_received_at
     FROM location_points
     GROUP BY track_id`
  ).all();
  const countsByTrack = new Map((groupedRows.results || []).map((row) => [row.track_id || DEFAULT_TRACK_ID, row]));
  const tracks = Object.values(TRACKS).map((track) => {
    const config = trackConfig(track, env);
    const row = countsByTrack.get(track.id);
    return {
      track_id: track.id,
      track_name: track.name,
      stored_count: row?.stored_count ?? 0,
      latest_received_at: row?.latest_received_at ?? null,
      public_delay_minutes: config.publicDelayMinutes,
      public_window_start: track.publicWindowStart,
      public_window_end: track.publicWindowEnd
    };
  });

  return json({
    ok: true,
    service: "trip-tracker",
    point_count: countResult?.point_count ?? 0,
    latest_received_at: countResult?.latest_received_at ?? null,
    tracks,
    config: {
      default_track_id: DEFAULT_TRACK_ID,
      default_public_delay_minutes: integerEnv(env.PUBLIC_DELAY_MINUTES, DEFAULT_PUBLIC_DELAY_MINUTES),
      max_public_points: integerEnv(env.MAX_PUBLIC_POINTS, DEFAULT_MAX_PUBLIC_POINTS),
      stale_minutes: integerEnv(env.STALE_MINUTES, DEFAULT_STALE_MINUTES),
      allow_zero_coords: booleanEnv(env.ALLOW_ZERO_COORDS),
      bounding_box: configuredBounds(env),
      cors_allowed_origins: allowedOrigins(env),
      trip_start_date: TRIP_START_DATE,
      trip_end_date: TRIP_END_DATE
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
    `SELECT id, track_id, recorded_at, received_at, lat, lon, acc, alt, batt, velocity, raw_type, source
     FROM location_points
     ORDER BY recorded_at ASC`
  ).all();

  const columns = ["id", "track_id", "recorded_at", "received_at", "lat", "lon", "acc", "alt", "batt", "velocity", "raw_type", "source"];
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

async function hitPageView(request, env) {
  if (!isAllowedViewWrite(request, env)) {
    return json({ ok: false, error: "origin_not_allowed" }, 403);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const path = normalizePagePath(payload?.path);
  if (!path) return json({ ok: false, error: "invalid_path" }, 400);

  const title = truncateString(stringOrNull(payload?.title), 180);
  const now = epochSeconds();

  await env.DB.prepare(
    `INSERT INTO page_views (path, title, views, created_at, updated_at)
     VALUES (?, ?, 1, ?, ?)
     ON CONFLICT(path) DO UPDATE SET
       views = views + 1,
       title = COALESCE(excluded.title, page_views.title),
       updated_at = excluded.updated_at`
  ).bind(path, title, now, now).run();

  const row = await env.DB.prepare(
    "SELECT path, title, views, updated_at FROM page_views WHERE path = ?"
  ).bind(path).first();

  return json({ ok: true, path, title: row?.title ?? title, views: row?.views ?? 1, updated_at: row?.updated_at ?? now });
}

async function pageViewCounts(request, env) {
  const paths = await requestedViewPaths(request);
  if (paths.length === 0) return json({ ok: true, counts: {} });

  const placeholders = paths.map(() => "?").join(", ");
  const rows = await env.DB.prepare(
    `SELECT path, views FROM page_views WHERE path IN (${placeholders})`
  ).bind(...paths).all();

  const counts = Object.fromEntries(paths.map((path) => [path, 0]));
  for (const row of rows.results || []) {
    counts[row.path] = row.views;
  }

  return json({ ok: true, counts });
}

async function requestedViewPaths(request) {
  const url = new URL(request.url);
  let rawPaths = [];

  if (request.method === "GET") {
    rawPaths = url.searchParams.getAll("path");
  } else {
    try {
      const payload = await request.json();
      rawPaths = Array.isArray(payload?.paths) ? payload.paths : [];
    } catch {
      rawPaths = [];
    }
  }

  return [...new Set(rawPaths.map(normalizePagePath).filter(Boolean))].slice(0, 100);
}

function requestedTracks(url) {
  const singleTrack = url.searchParams.get("track");
  const multipleTracks = url.searchParams.get("tracks");
  let requestedIds;

  if (singleTrack !== null) {
    requestedIds = [singleTrack.trim()];
  } else if (multipleTracks !== null) {
    requestedIds = multipleTracks.split(",").map((value) => value.trim()).filter(Boolean);
  } else {
    requestedIds = Object.keys(TRACKS);
  }

  const uniqueIds = [...new Set(requestedIds)];
  if (uniqueIds.length === 0 || uniqueIds.some((trackId) => !TRACKS[trackId])) return null;
  return uniqueIds.map((trackId) => TRACKS[trackId]);
}

async function publicTrackData(env, track) {
  const config = trackConfig(track, env);

  // The finalized NHR archive is the canonical public route. Keep its raw
  // OwnTracks rows for authenticated export and health counts, but never emit
  // them as public segments, points, or a latest marker.
  if (track.publicArchiveOnly) {
    return buildTrackData(track, config, [], {
      stored_count: 0,
      latest_recorded_at: null,
      latest_received_at: null
    });
  }

  const windowStart = epochFromIso(track.publicWindowStart);
  const windowEnd = epochFromIso(track.publicWindowEnd);
  const cutoff = epochSeconds() - config.publicDelayMinutes * 60;
  const publicEnd = Math.min(cutoff, windowEnd);
  const effectiveStart = track.staticRouteCutoff
    ? Math.max(windowStart, epochFromIso(track.staticRouteCutoff))
    : windowStart;

  if (publicEnd < effectiveStart) {
    return buildTrackData(track, config, [], {
      stored_count: 0,
      latest_recorded_at: null,
      latest_received_at: null
    });
  }

  const summaryPromise = env.DB.prepare(
    `SELECT COUNT(*) AS stored_count,
            MAX(recorded_at) AS latest_recorded_at,
            MAX(received_at) AS latest_received_at
     FROM location_points
     WHERE track_id = ?
       AND recorded_at >= ?
       AND recorded_at <= ?`
  ).bind(track.id, effectiveStart, publicEnd).first();

  const rowsPromise = env.DB.prepare(
    `SELECT id, track_id, recorded_at, received_at, lat, lon, acc, alt, batt, velocity, raw_type, source
     FROM location_points
     WHERE track_id = ?
       AND recorded_at >= ?
       AND recorded_at <= ?
     ORDER BY recorded_at DESC, id DESC
     LIMIT ?`
  ).bind(track.id, effectiveStart, publicEnd, config.maxPublicPoints).all();

  const [summary, rows] = await Promise.all([summaryPromise, rowsPromise]);
  return buildTrackData(track, config, (rows.results || []).reverse(), summary || {});
}

function publicRows(rows, config) {
  return filterRouteSpikes(rows.map((row) => ({
    ...row,
    lat: roundCoordinate(row.lat, config.coordinateDecimals),
    lon: roundCoordinate(row.lon, config.coordinateDecimals)
  })), config);
}

function buildTrackData(track, config, rows, summary) {
  const roundedRows = publicRows(rows, config);
  const latest = roundedRows[roundedRows.length - 1] || null;
  const features = [];
  const pointSpeeds = [null];
  const easternTimeCache = new Map();
  const easternTime = (epoch) => {
    if (!easternTimeCache.has(epoch)) easternTimeCache.set(epoch, epochToEastern(epoch));
    return easternTimeCache.get(epoch);
  };
  let totalDistanceKilometers = 0;
  let footDistanceKilometers = 0;

  for (let index = 1; index < roundedRows.length; index += 1) {
    const previous = roundedRows[index - 1];
    const current = roundedRows[index];
    const distanceKilometers = distanceKm(previous, current);
    const distanceMiles = kilometersToMiles(distanceKilometers);
    const elapsedHours = (current.recorded_at - previous.recorded_at) / 3600;
    const speedMph = elapsedHours > 0 ? roundStat(distanceMiles / elapsedHours) : null;
    pointSpeeds.push(speedMph);
    totalDistanceKilometers += distanceKilometers;
    if (speedMph !== null && speedMph < 7) footDistanceKilometers += distanceKilometers;

    features.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [[previous.lon, previous.lat], [current.lon, current.lat]]
      },
      properties: {
        kind: "route-segment",
        track_id: track.id,
        track_name: track.name,
        segment_index: index - 1,
        start_recorded_at: previous.recorded_at,
        end_recorded_at: current.recorded_at,
        start_time_eastern: easternTime(previous.recorded_at),
        end_time_eastern: easternTime(current.recorded_at),
        distance_miles: roundStat(distanceMiles),
        speed_mph: speedMph,
        color: track.color,
        source: current.source || previous.source || "owntracks"
      }
    });
  }

  roundedRows.forEach((row, index) => {
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [row.lon, row.lat] },
      properties: {
        kind: "route-point",
        track_id: track.id,
        track_name: track.name,
        recorded_at: row.recorded_at,
        time_eastern: easternTime(row.recorded_at),
        speed_mph: pointSpeeds[index] ?? null,
        raw_velocity: row.velocity ?? null,
        acc: row.acc ?? null,
        batt: row.batt ?? null,
        color: track.color,
        source: row.source || "owntracks"
      }
    });
  });

  if (latest) {
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [latest.lon, latest.lat] },
      properties: {
        kind: "latest",
        track_id: track.id,
        track_name: track.name,
        recorded_at: latest.recorded_at,
        time_eastern: easternTime(latest.recorded_at),
        speed_mph: pointSpeeds[pointSpeeds.length - 1] ?? null,
        raw_velocity: latest.velocity ?? null,
        acc: latest.acc ?? null,
        batt: latest.batt ?? null,
        public_delay_minutes: config.publicDelayMinutes,
        privacy_mode: privacyMode(config),
        color: track.color,
        source: latest.source || "owntracks"
      }
    });
  }

  const elapsedHours = roundedRows.length > 1
    ? (roundedRows[roundedRows.length - 1].recorded_at - roundedRows[0].recorded_at) / 3600
    : 0;
  const totalDistanceMiles = kilometersToMiles(totalDistanceKilometers);
  const stats = {
    totalDistanceMiles: roundStat(totalDistanceMiles),
    totalDistanceKilometers: roundStat(totalDistanceKilometers),
    footDistanceMiles: roundStat(kilometersToMiles(footDistanceKilometers)),
    footDistanceKilometers: roundStat(footDistanceKilometers),
    averageSpeedMph: elapsedHours > 0 ? roundStat(totalDistanceMiles / elapsedHours) : null
  };

  return {
    features,
    metadata: {
      track_id: track.id,
      track_name: track.name,
      public_source: track.publicArchiveOnly ? "static_archive" : "owntracks",
      archive_only: Boolean(track.publicArchiveOnly),
      public_delay_minutes: config.publicDelayMinutes,
      public_window_start: track.publicWindowStart,
      public_window_end: track.publicWindowEnd,
      stored_count: summary.stored_count ?? 0,
      public_point_count: roundedRows.length,
      latest_recorded_at: summary.latest_recorded_at ?? null,
      latest_received_at: summary.latest_received_at ?? null,
      latest_public_recorded_at: latest?.recorded_at ?? null,
      total_distance_miles: stats.totalDistanceMiles,
      total_distance_kilometers: stats.totalDistanceKilometers,
      foot_distance_miles: stats.footDistanceMiles,
      foot_distance_kilometers: stats.footDistanceKilometers,
      average_speed_mph: stats.averageSpeedMph,
      status: trackStatus(track, latest, config),
      coordinate_decimals: config.coordinateDecimals,
      color: track.color
    }
  };
}

function buildFeatureCollection(trackResults) {
  const tracks = trackResults.map((result) => result.metadata);
  const features = trackResults.flatMap((result) => result.features);
  const latestRecordedAt = maxNullable(tracks.map((track) => track.latest_public_recorded_at));
  const latestReceivedAt = maxNullable(tracks.map((track) => track.latest_received_at));
  const pointCount = tracks.reduce((sum, track) => sum + track.public_point_count, 0);

  return {
    type: "FeatureCollection",
    properties: {
      generated_at: epochSeconds(),
      point_count: pointCount
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      lastRecordedAt: latestRecordedAt === null ? null : epochToIso(latestRecordedAt),
      lastReceivedAt: latestReceivedAt === null ? null : epochToIso(latestReceivedAt),
      pointCount,
      tracks
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
      if (segmentMiles / elapsedHours < 7) footDistanceKilometers += segmentKilometers;
    }
  }

  const elapsedHours = rows.length > 1
    ? (rows[rows.length - 1].recorded_at - rows[0].recorded_at) / 3600
    : 0;
  const totalDistanceMiles = kilometersToMiles(totalDistanceKilometers);

  return {
    totalDistanceMiles: roundStat(totalDistanceMiles),
    totalDistanceKilometers: roundStat(totalDistanceKilometers),
    footDistanceMiles: roundStat(kilometersToMiles(footDistanceKilometers)),
    footDistanceKilometers: roundStat(footDistanceKilometers),
    averageSpeedMph: elapsedHours > 0 ? roundStat(totalDistanceMiles / elapsedHours) : null
  };
}

function trackStatus(track, latest, config) {
  const now = epochSeconds();
  const windowStart = epochFromIso(track.publicWindowStart);
  const windowEnd = epochFromIso(track.publicWindowEnd);
  if (now < windowStart) return "scheduled";
  if (now > windowEnd + config.publicDelayMinutes * 60) return "trip_complete";
  if (!latest) return "waiting_for_delay";

  const latestAgeMinutes = (now - latest.recorded_at) / 60;
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

function trackConfig(track, env) {
  return {
    publicDelayMinutes: track.publicDelayMinutes
      ?? integerEnv(env.PUBLIC_DELAY_MINUTES, DEFAULT_PUBLIC_DELAY_MINUTES),
    coordinateDecimals: clamp(
      track.coordinateDecimals ?? integerEnv(env.COORDINATE_DECIMALS, DEFAULT_COORDINATE_DECIMALS),
      0,
      6
    ),
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

function isAllowedViewWrite(request, env) {
  const origin = request.headers.get("Origin");
  return Boolean(origin && allowedOrigins(env).includes(origin));
}

function normalizePagePath(value) {
  const rawValue = stringOrNull(value);
  if (!rawValue) return null;

  let path = rawValue.trim();
  try {
    const parsed = new URL(path);
    path = parsed.pathname;
  } catch {
    path = path.split("#")[0].split("?")[0];
  }

  if (!path.startsWith("/")) path = `/${path}`;
  path = path.replace(/\/{2,}/g, "/");

  if (path.length > 500) return null;
  if (path.startsWith("/api/")) return null;
  if (!(path === "/" || path.endsWith("/") || path.endsWith(".html"))) return null;
  return path;
}

function truncateString(value, maxLength) {
  if (!value) return null;
  return value.length > maxLength ? value.slice(0, maxLength) : value;
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

function epochToEastern(value) {
  const parts = EASTERN_TIME_FORMATTER.formatToParts(new Date(value * 1000));
  const part = (type) => parts.find((item) => item.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")} ${part("hour")}:${part("minute")} ET`;
}

function maxNullable(values) {
  const numbers = values.filter((value) => Number.isFinite(value));
  return numbers.length > 0 ? Math.max(...numbers) : null;
}

function csvCell(value) {
  if (value === null || value === undefined) return "";
  return `"${String(value).replaceAll('"', '""')}"`;
}
