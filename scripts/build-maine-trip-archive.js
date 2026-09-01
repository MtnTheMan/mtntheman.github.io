#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const TRACK_ID = "maine-august-trip";
const TRACK_NAME = "Maine Trip August 2026";
const TRACK_COLOR = "#ff7a00";
const TRACK_START_DATE = "2026-08-24";
const DAILY_WARM_HUES = [2, 28, 50, 8, 36];
const PUBLIC_DELAY_MINUTES = 900;
const WINDOW_START = "2026-08-24T13:00:00-04:00";
const WINDOW_END = "2026-08-28T20:00:00-04:00";
const HIDDEN_AFTER = "2026-08-27T14:32:00-04:00";
const HIDDEN_UNTIL = "2026-08-28T00:00:00-04:00";
const HIDDEN_AFTER_EPOCH = Math.floor(Date.parse(HIDDEN_AFTER) / 1000);
const HIDDEN_UNTIL_EPOCH = Math.floor(Date.parse(HIDDEN_UNTIL) / 1000);
const MILES_PER_KILOMETER = 0.621371192237334;

const inputPath = process.argv[2];
const outputPath = process.argv[3]
  || path.join(__dirname, "..", "assets", "data", "maine-trip-august-2026.geojson");

if (!inputPath) {
  console.error("Usage: node scripts/build-maine-trip-archive.js <maine-geojson-input> [output-file]");
  process.exit(1);
}

const source = JSON.parse(fs.readFileSync(path.resolve(inputPath), "utf8"));
const sourceFeatures = Array.isArray(source.features) ? source.features : [];
const sourcePoints = sourceFeatures
  .filter((feature) => feature?.properties?.kind === "route-point")
  .sort((left, right) => recordedAt(left) - recordedAt(right));
const sourceSegments = sourceFeatures
  .filter((feature) => feature?.properties?.kind === "route-segment")
  .sort((left, right) => segmentStart(left) - segmentStart(right));

if (sourcePoints.length === 0) {
  throw new Error("The source GeoJSON does not contain any route-point features.");
}
if (sourcePoints.some((feature) => feature?.properties?.track_id !== TRACK_ID)) {
  throw new Error(`The source GeoJSON contains a route point outside ${TRACK_ID}.`);
}

const retainedPoints = sourcePoints.filter((feature) => !isHidden(recordedAt(feature)));
const newlyExcludedPoints = sourcePoints.length - retainedPoints.length;
const priorExcludedPoints = Number(source?.metadata?.excludedPointCount) || 0;
const sourcePointCount = Number(source?.metadata?.sourcePointCount)
  || sourcePoints.length + priorExcludedPoints;
const excludedPoints = newlyExcludedPoints + priorExcludedPoints;
const endingSpeedByEpoch = new Map();
let totalDistanceMiles = 0;
let footDistanceMiles = 0;
let elapsedHours = 0;

const retainedSegments = sourceSegments
  .filter((feature) => segmentEnd(feature) <= HIDDEN_AFTER_EPOCH || segmentStart(feature) >= HIDDEN_UNTIL_EPOCH)
  .map((feature, index) => {
    const properties = feature.properties || {};
    const start = segmentStart(feature);
    const end = segmentEnd(feature);
    const midpoint = start + (end - start) / 2;
    const distanceMiles = haversineMiles(feature?.geometry?.coordinates?.[0], feature?.geometry?.coordinates?.[1]);
    const segmentHours = end > start ? (end - start) / 3600 : 0;
    const speedMph = segmentHours > 0 && distanceMiles !== null ? distanceMiles / segmentHours : null;

    if (distanceMiles !== null) {
      totalDistanceMiles += distanceMiles;
      if (speedMph !== null && speedMph < 7) footDistanceMiles += distanceMiles;
    }
    if (segmentHours > 0) elapsedHours += segmentHours;
    endingSpeedByEpoch.set(end, speedMph === null ? null : roundOne(speedMph));

    return {
      type: "Feature",
      geometry: feature.geometry,
      properties: {
        ...properties,
        kind: "route-segment",
        track_id: TRACK_ID,
        track_name: TRACK_NAME,
        segment_index: index,
        start_recorded_at: start,
        end_recorded_at: end,
        day_number: routeDayIndex(midpoint) + 1,
        local_date: localDateLabel(midpoint),
        distance_miles: distanceMiles === null ? null : roundOne(distanceMiles),
        speed_mph: speedMph === null ? null : roundOne(speedMph),
        color: routeColor(midpoint),
        source: "archived",
        original_source: properties.original_source || properties.source || "owntracks"
      }
    };
  });

const archivedPoints = retainedPoints.map((feature) => {
  const properties = feature.properties || {};
  const epoch = recordedAt(feature);
  return {
    type: "Feature",
    geometry: feature.geometry,
    properties: {
      ...properties,
      kind: "route-point",
      track_id: TRACK_ID,
      track_name: TRACK_NAME,
      recorded_at: epoch,
      speed_mph: endingSpeedByEpoch.has(epoch) ? endingSpeedByEpoch.get(epoch) : null,
      color: routeColor(epoch),
      source: "archived",
      original_source: properties.original_source || properties.source || "owntracks"
    }
  };
});

const firstPoint = archivedPoints[0];
const lastPoint = archivedPoints[archivedPoints.length - 1];
const firstEpoch = recordedAt(firstPoint);
const lastEpoch = recordedAt(lastPoint);
const totalDistanceKilometers = totalDistanceMiles / MILES_PER_KILOMETER;
const footDistanceKilometers = footDistanceMiles / MILES_PER_KILOMETER;
const averageSpeedMph = elapsedHours > 0 ? totalDistanceMiles / elapsedHours : null;
const sourceTrack = Array.isArray(source?.metadata?.tracks) ? source.metadata.tracks[0] || {} : {};

const latestFeature = {
  type: "Feature",
  geometry: lastPoint.geometry,
  properties: {
    ...lastPoint.properties,
    kind: "latest",
    public_delay_minutes: PUBLIC_DELAY_MINUTES,
    privacy_mode: "final archive, rounded to 3 decimals, with the Aug 27 privacy interval removed"
  }
};

const trackMetadata = {
  track_id: TRACK_ID,
  track_name: TRACK_NAME,
  public_source: "static_archive",
  archive_only: true,
  public_delay_minutes: PUBLIC_DELAY_MINUTES,
  public_window_start: WINDOW_START,
  public_window_end: WINDOW_END,
  stored_count: retainedPoints.length,
  source_point_count: sourcePointCount,
  excluded_point_count: excludedPoints,
  public_point_count: retainedPoints.length,
  latest_recorded_at: lastEpoch,
  latest_received_at: lastEpoch,
  latest_public_recorded_at: lastEpoch,
  total_distance_miles: roundOne(totalDistanceMiles),
  total_distance_kilometers: roundOne(totalDistanceKilometers),
  foot_distance_miles: roundOne(footDistanceMiles),
  foot_distance_kilometers: roundOne(footDistanceKilometers),
  average_speed_mph: averageSpeedMph === null ? null : roundOne(averageSpeedMph),
  status: "trip_complete",
  coordinate_decimals: sourceTrack.coordinate_decimals || 3,
  color: TRACK_COLOR
};

const archive = {
  type: "FeatureCollection",
  metadata: {
    generatedAt: source?.metadata?.generatedAt || null,
    lastRecordedAt: new Date(lastEpoch * 1000).toISOString(),
    lastReceivedAt: new Date(lastEpoch * 1000).toISOString(),
    pointCount: retainedPoints.length,
    segmentCount: retainedSegments.length,
    sourcePointCount,
    excludedPointCount: excludedPoints,
    hiddenAfter: HIDDEN_AFTER,
    hiddenUntil: HIDDEN_UNTIL,
    totalDistanceMiles: trackMetadata.total_distance_miles,
    totalDistanceKilometers: trackMetadata.total_distance_kilometers,
    footDistanceMiles: trackMetadata.foot_distance_miles,
    footDistanceKilometers: trackMetadata.foot_distance_kilometers,
    averageSpeedMph: trackMetadata.average_speed_mph,
    colorMode: "warm hue by Eastern trip day with a light-to-dark time-of-day gradient",
    tracks: [trackMetadata]
  },
  properties: {
    kind: "route",
    track_id: TRACK_ID,
    track_name: TRACK_NAME,
    name: TRACK_NAME,
    color: TRACK_COLOR,
    color_mode: "warm daily red, orange, and yellow gradients",
    source: "archived",
    point_count: retainedPoints.length,
    segment_count: retainedSegments.length,
    hidden_after: HIDDEN_AFTER,
    hidden_until: HIDDEN_UNTIL
  },
  features: retainedSegments.concat(archivedPoints, latestFeature)
};

verifyArchive(archive, firstEpoch, lastEpoch);
fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
fs.writeFileSync(path.resolve(outputPath), `${JSON.stringify(archive)}\n`);

console.log(JSON.stringify({
  output: path.resolve(outputPath),
  source_points: sourcePointCount,
  retained_points: retainedPoints.length,
  excluded_points: excludedPoints,
  retained_segments: retainedSegments.length,
  first_recorded_at: new Date(firstEpoch * 1000).toISOString(),
  last_recorded_at: new Date(lastEpoch * 1000).toISOString(),
  total_distance_miles: trackMetadata.total_distance_miles
}, null, 2));

function recordedAt(feature) {
  return Number(feature?.properties?.recorded_at);
}

function segmentStart(feature) {
  const properties = feature?.properties || {};
  return Number(properties.start_recorded_at ?? properties.recorded_at_start);
}

function segmentEnd(feature) {
  const properties = feature?.properties || {};
  return Number(properties.end_recorded_at ?? properties.recorded_at_end);
}

function isHidden(epoch) {
  return epoch > HIDDEN_AFTER_EPOCH && epoch < HIDDEN_UNTIL_EPOCH;
}

function routeColor(epoch) {
  const dayIndex = routeDayIndex(epoch);
  const dayProgress = localSecondsIntoDay(epoch) / 86400;
  const hue = DAILY_WARM_HUES[dayIndex % DAILY_WARM_HUES.length];
  const lightness = 78 - (78 - 26) * dayProgress;
  return hslString(hue, 95, lightness);
}

function routeDayIndex(epoch) {
  return Math.max(0, calendarDayDifference(TRACK_START_DATE, localDateLabel(epoch)));
}

function localDateLabel(epoch) {
  const parts = easternDateTimeParts(epoch);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function localSecondsIntoDay(epoch) {
  const parts = easternDateTimeParts(epoch);
  return (parts.hour % 24) * 3600 + parts.minute * 60 + parts.second;
}

function easternDateTimeParts(epoch) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hourCycle: "h23",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).formatToParts(new Date(epoch * 1000));
  const value = (type) => Number(parts.find((part) => part.type === type)?.value || 0);
  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour"),
    minute: value("minute"),
    second: value("second")
  };
}

function calendarDayDifference(firstDate, secondDate) {
  return Math.round((dateOnlyUtc(secondDate) - dateOnlyUtc(firstDate)) / 86400000);
}

function dateOnlyUtc(dateLabel) {
  const [year, month, day] = dateLabel.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function hslString(hue, saturation, lightness) {
  return `hsl(${hue}, ${saturation}%, ${Math.round(lightness * 10) / 10}%)`;
}

function haversineMiles(start, end) {
  if (!validCoordinate(start) || !validCoordinate(end)) return null;
  const earthRadiusKilometers = 6371.0088;
  const latitude1 = radians(start[1]);
  const latitude2 = radians(end[1]);
  const latitudeDelta = radians(end[1] - start[1]);
  const longitudeDelta = radians(end[0] - start[0]);
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(longitudeDelta / 2) ** 2;
  const kilometers = 2 * earthRadiusKilometers * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return kilometers * MILES_PER_KILOMETER;
}

function validCoordinate(coordinate) {
  return Array.isArray(coordinate)
    && coordinate.length >= 2
    && Number.isFinite(Number(coordinate[0]))
    && Number.isFinite(Number(coordinate[1]));
}

function radians(value) {
  return Number(value) * Math.PI / 180;
}

function roundOne(value) {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

function verifyArchive(geojson, firstEpoch, lastEpoch) {
  const points = geojson.features.filter((feature) => feature?.properties?.kind === "route-point");
  const segments = geojson.features.filter((feature) => feature?.properties?.kind === "route-segment");
  const hiddenPoints = points.filter((feature) => isHidden(recordedAt(feature)));
  const overlappingSegments = segments.filter((feature) => (
    segmentEnd(feature) > HIDDEN_AFTER_EPOCH && segmentStart(feature) < HIDDEN_UNTIL_EPOCH
  ));
  const uncoloredSegments = segments.filter((feature) => !/^hsl\(\d+, \d+%, \d+(?:\.\d+)?%\)$/.test(feature?.properties?.color || ""));

  if (hiddenPoints.length > 0) throw new Error("Archive verification found a point in the hidden interval.");
  if (overlappingSegments.length > 0) throw new Error("Archive verification found a segment crossing the hidden interval.");
  if (uncoloredSegments.length > 0) throw new Error("Archive verification found a segment without a warm gradient color.");
  if (recordedAt(points[0]) !== firstEpoch || recordedAt(points[points.length - 1]) !== lastEpoch) {
    throw new Error("Archive points are not in chronological order.");
  }
}
