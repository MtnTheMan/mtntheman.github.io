const DEFAULT_DELAY_MINUTES = 30;
const DEFAULT_COORD_DECIMALS = 3;
const DEFAULT_MAX_PUBLIC_POINTS = 2500;
const DEFAULT_STALE_HOURS = 6;
const DEFAULT_BOUNDS = {
  minLat: 18,
  maxLat: 72,
  minLon: -170,
  maxLon: -50
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }), env);
    }

    try {
      if (url.pathname === "/api/tracker/ingest" && request.method === "POST") {
        return withCors(await ingestOwnTracks(request, env), env);
      }

      if (url.pathname === "/api/tracker/geojson" && request.method === "GET") {
        return withCors(await readPublicGeoJson(env), env);
      }

      if (url.pathname === "/api/tracker/export.geojson" && request.method === "GET") {
        return withCors(await exportAllGeoJson(request, env), env);
      }

      if (url.pathname === "/api/tracker/export.csv" && request.method === "GET") {
        return withCors(await exportAllCsv(request, env), env);
      }

      if (url.pathname === "/api/tracker/clear-test" && request.method === "POST") {
        return withCors(await clearTestPoints(request, env), env);
      }

      return json({ error: "not_found" }, 404);
    } catch (error) {
      return json({ error: "server_error", message: error.message }, 500);
    }
  }
};

async function ingestOwnTracks(request, env) {
  if (!isAuthorized(request, env)) {
    return json({ error: "unauthorized" }, 401);
  }

  let payload;
  try {
    payload = await readJson(request);
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  if (!payload || typeof payload !== "object") {
    return json({ ok: true, ignored: true, reason: "empty_payload" });
  }

  const type = stringOrNull(payload._type || payload.type);
  if (type && type !== "location" && type !== "transition") {
    return json({ ok: true, ignored: true, reason: "non_location_payload", raw_type: type });
  }

  const lat = numberOrNull(payload.lat);
  const lon = numberOrNull(payload.lon);
  if (lat === null || lon === null) {
    return json({ ok: true, ignored: true, reason: "missing_coordinates" });
  }

  if (!validCoordinate(lat, lon)) {
    return json({ error: "invalid_coordinates" }, 400);
  }

  if (!boundsDisabled(env) && !insideExpectedBounds(lat, lon, env)) {
    return json({ error: "outside_expected_region" }, 400);
  }

  const recordedAt = ownTracksTimestamp(payload.tst);
  const receivedAt = new Date().toISOString();
  const topic = stringOrNull(payload.topic || request.headers.get("X-OwnTracks-Topic"));

  await env.DB.prepare(
    `INSERT INTO tracker_points
      (recorded_at, received_at, lat, lon, acc, alt, batt, velocity, topic, raw_type, source)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      recordedAt,
      receivedAt,
      lat,
      lon,
      numberOrNull(payload.acc),
      numberOrNull(payload.alt),
      numberOrNull(payload.batt),
      numberOrNull(payload.vel || payload.velocity),
      topic,
      type,
      "owntracks"
    )
    .run();

  return json({ ok: true, recorded_at: recordedAt, received_at: receivedAt });
}

async function readPublicGeoJson(env) {
  if (trackerHidden(env)) {
    return json(emptyFeatureCollection({ feedStatus: "complete", message: "Trip complete" }));
  }

  const privacy = privacyConfig(env);
  const cutoff = new Date(Date.now() - privacy.delayMinutes * 60 * 1000).toISOString();
  const limit = intEnv(env.MAX_PUBLIC_POINTS, DEFAULT_MAX_PUBLIC_POINTS);

  const rows = await env.DB.prepare(
    `SELECT recorded_at, received_at, lat, lon, acc, alt, batt, velocity, topic, raw_type, source
     FROM tracker_points
     WHERE recorded_at <= ?
     ORDER BY recorded_at ASC
     LIMIT ?`
  ).bind(cutoff, limit).all();

  return json(buildPublicGeoJson(rows.results || [], privacy));
}

async function exportAllGeoJson(request, env) {
  if (!isAuthorized(request, env)) {
    return json({ error: "unauthorized" }, 401);
  }

  const rows = await env.DB.prepare(
    `SELECT id, recorded_at, received_at, lat, lon, acc, alt, batt, velocity, topic, raw_type, source
     FROM tracker_points
     ORDER BY recorded_at ASC`
  ).all();

  const features = (rows.results || []).map((row) => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [row.lon, row.lat] },
    properties: pointProperties(row)
  }));

  return json({ type: "FeatureCollection", features });
}

async function exportAllCsv(request, env) {
  if (!isAuthorized(request, env)) {
    return json({ error: "unauthorized" }, 401);
  }

  const rows = await env.DB.prepare(
    `SELECT id, recorded_at, received_at, lat, lon, acc, alt, batt, velocity, topic, raw_type, source
     FROM tracker_points
     ORDER BY recorded_at ASC`
  ).all();

  const columns = ["id", "recorded_at", "received_at", "lat", "lon", "acc", "alt", "batt", "velocity", "topic", "raw_type", "source"];
  const body = [
    columns.join(","),
    ...(rows.results || []).map((row) => columns.map((column) => csvCell(row[column])).join(","))
  ].join("\n");

  return new Response(body + "\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="tracker-points.csv"'
    }
  });
}

async function clearTestPoints(request, env) {
  if (!isAuthorized(request, env)) {
    return json({ error: "unauthorized" }, 401);
  }

  const url = new URL(request.url);
  const before = url.searchParams.get("before");
  if (before) {
    await env.DB.prepare("DELETE FROM tracker_points WHERE recorded_at < ?").bind(before).run();
  } else {
    await env.DB.prepare("DELETE FROM tracker_points").run();
  }

  return json({ ok: true, cleared: true });
}

function buildPublicGeoJson(rows, privacy) {
  if (!rows.length) {
    return emptyFeatureCollection({
      feedStatus: "stale",
      coordinatePrecision: precisionLabel(privacy.coordDecimals),
      pointCount: 0,
      privacy
    });
  }

  const roundedRows = rows.map((row) => ({
    ...row,
    lat: roundCoord(row.lat, privacy.coordDecimals),
    lon: roundCoord(row.lon, privacy.coordDecimals)
  }));

  const coordinates = roundedRows.map((row) => [row.lon, row.lat]);
  const latest = roundedRows[roundedRows.length - 1];
  const lastRecordedAt = latest.recorded_at;
  const ageHours = (Date.now() - new Date(lastRecordedAt).getTime()) / 3600000;
  const feedStatus = ageHours > privacy.staleHours
    ? "stale"
    : privacy.delayMinutes > 0 ? "delayed" : "live";

  const features = [];
  const routeCoordinates = coordinates.length === 1 ? [coordinates[0], coordinates[0]] : coordinates;
  features.push({
    type: "Feature",
    geometry: { type: "LineString", coordinates: routeCoordinates },
    properties: { kind: "route" }
  });

  features.push({
    type: "Feature",
    geometry: { type: "Point", coordinates: [latest.lon, latest.lat] },
    properties: {
      kind: "latest",
      recorded_at: latest.recorded_at,
      acc: latest.acc,
      alt: latest.alt
    }
  });

  return {
    type: "FeatureCollection",
    metadata: {
      generatedAt: new Date().toISOString(),
      lastRecordedAt,
      coordinatePrecision: precisionLabel(privacy.coordDecimals),
      pointCount: roundedRows.length,
      feedStatus,
      privacy
    },
    features
  };
}

function emptyFeatureCollection(metadata = {}) {
  return {
    type: "FeatureCollection",
    metadata: {
      generatedAt: new Date().toISOString(),
      pointCount: 0,
      ...metadata
    },
    features: []
  };
}

function isAuthorized(request, env) {
  const expected = env.TRACKER_TOKEN;
  if (!expected) return false;

  const auth = request.headers.get("Authorization") || "";
  if (auth.startsWith("Bearer ")) {
    return timingSafeEqual(auth.slice(7), expected);
  }

  if (auth.startsWith("Basic ")) {
    try {
      const decoded = atob(auth.slice(6));
      const token = decoded.includes(":") ? decoded.split(":").pop() : decoded;
      return timingSafeEqual(token, expected);
    } catch {
      return false;
    }
  }

  const url = new URL(request.url);
  const queryToken = url.searchParams.get("token");
  return queryToken ? timingSafeEqual(queryToken, expected) : false;
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

async function readJson(request) {
  const text = await request.text();
  if (!text.trim()) return null;
  return JSON.parse(text);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}

function withCors(response, env) {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", env.CORS_ORIGIN || "https://mtntheman.com");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
  headers.set("Access-Control-Max-Age", "86400");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function privacyConfig(env) {
  const strictHours = numberOrNull(env.STRICT_DELAY_HOURS);
  return {
    delayMinutes: strictHours !== null
      ? Math.max(strictHours * 60, DEFAULT_DELAY_MINUTES)
      : intEnv(env.PUBLIC_DELAY_MINUTES, DEFAULT_DELAY_MINUTES),
    coordDecimals: intEnv(env.COORD_DECIMALS, DEFAULT_COORD_DECIMALS),
    staleHours: intEnv(env.STALE_HOURS, DEFAULT_STALE_HOURS)
  };
}

function trackerHidden(env) {
  if (!env.TRACKER_HIDE_AFTER) return false;
  return Date.now() > new Date(env.TRACKER_HIDE_AFTER).getTime();
}

function boundsDisabled(env) {
  return String(env.DISABLE_BOUNDS || "").toLowerCase() === "true";
}

function insideExpectedBounds(lat, lon, env) {
  const bounds = {
    minLat: numberOrNull(env.MIN_LAT) ?? DEFAULT_BOUNDS.minLat,
    maxLat: numberOrNull(env.MAX_LAT) ?? DEFAULT_BOUNDS.maxLat,
    minLon: numberOrNull(env.MIN_LON) ?? DEFAULT_BOUNDS.minLon,
    maxLon: numberOrNull(env.MAX_LON) ?? DEFAULT_BOUNDS.maxLon
  };
  return lat >= bounds.minLat && lat <= bounds.maxLat && lon >= bounds.minLon && lon <= bounds.maxLon;
}

function validCoordinate(lat, lon) {
  return Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

function ownTracksTimestamp(value) {
  const timestamp = numberOrNull(value);
  return timestamp === null ? new Date().toISOString() : new Date(timestamp * 1000).toISOString();
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function stringOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

function intEnv(value, fallback) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? number : fallback;
}

function roundCoord(value, decimals) {
  const multiplier = 10 ** decimals;
  return Math.round(Number(value) * multiplier) / multiplier;
}

function precisionLabel(decimals) {
  if (decimals <= 2) return "city-scale";
  if (decimals === 3) return "about 100 meters";
  if (decimals === 4) return "about 10 meters";
  return `${decimals} decimal places`;
}

function pointProperties(row) {
  return {
    id: row.id,
    recorded_at: row.recorded_at,
    received_at: row.received_at,
    acc: row.acc,
    alt: row.alt,
    batt: row.batt,
    velocity: row.velocity,
    topic: row.topic,
    raw_type: row.raw_type,
    source: row.source
  };
}

function csvCell(value) {
  if (value === null || value === undefined) return "";
  return `"${String(value).replaceAll('"', '""')}"`;
}
