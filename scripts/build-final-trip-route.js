const fs = require("fs");
const os = require("os");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const finalPath = path.join(repoRoot, "assets", "data", "trip-route-final.geojson");
const defaultCsvPath = path.join(os.homedir(), "trip-tracker-location-points.csv");
const csvPath = process.argv[2] || defaultCsvPath;

const publicWindowStart = "2026-05-17T08:00:00-04:00";
const publicWindowEnd = "2026-06-22T19:00:00-04:00";
const tripStartDate = "2026-05-17";
const tripEndDate = "2026-06-22";
const tripCalendarDayCount = calendarDayDifference(tripStartDate, tripEndDate) + 1;
const coordinateDecimals = 3;
const publicDelayMinutes = 600;
const maxSpikeDistanceKm = 75;
const maxSpikePointCount = 5;
const exclusionCenter = { lat: 42.742557, lon: -84.452255 };
const exclusionRadiusMeters = 200;
const finalStats = {
  ticksIntercepted: 16,
  fianceCalls: 88,
  tripCompleted: "100%",
  tripDay: "Day 36 of 36",
  bearsEncountered: 3,
  interviewsConducted: 42,
  trees: "Countless",
  carLockouts: 1
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (quoted) {
      if (char === "\"" && next === "\"") {
        cell += "\"";
        index += 1;
      } else if (char === "\"") {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === "\"") {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }

  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

function readTrackerRows(filePath) {
  const rows = parseCsv(fs.readFileSync(filePath, "utf8"));
  const header = rows.shift();
  const columns = Object.fromEntries(header.map((name, index) => [name, index]));

  return rows.map((row) => ({
    id: integerOrNull(row[columns.id]),
    recorded_at: integerOrNull(row[columns.recorded_at]),
    received_at: integerOrNull(row[columns.received_at]),
    lat: numberOrNull(row[columns.lat]),
    lon: numberOrNull(row[columns.lon]),
    acc: numberOrNull(row[columns.acc]),
    alt: numberOrNull(row[columns.alt]),
    batt: numberOrNull(row[columns.batt]),
    velocity: numberOrNull(row[columns.velocity]),
    raw_type: row[columns.raw_type] || null,
    source: row[columns.source] || null
  })).filter((row) => {
    return row.recorded_at !== null && Number.isFinite(row.lat) && Number.isFinite(row.lon);
  });
}

function integerOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isInteger(number) ? number : null;
}

function numberOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function epochFromIso(iso) {
  return Math.floor(new Date(iso).getTime() / 1000);
}

function epochToIso(epoch) {
  return epoch ? new Date(epoch * 1000).toISOString() : null;
}

function roundCoordinate(value) {
  const multiplier = 10 ** coordinateDecimals;
  return Math.round(Number(value) * multiplier) / multiplier;
}

function publicRows(rows) {
  const start = epochFromIso(publicWindowStart);
  const end = epochFromIso(publicWindowEnd);
  const rounded = rows
    .filter((row) => row.recorded_at >= start && row.recorded_at <= end)
    .sort((first, second) => first.recorded_at - second.recorded_at || first.id - second.id)
    .map((row) => ({
      ...row,
      lat: roundCoordinate(row.lat),
      lon: roundCoordinate(row.lon)
    }));

  return filterRouteSpikes(rounded);
}

function filterRouteSpikes(rows) {
  if (rows.length < 3 || maxSpikeDistanceKm <= 0) return rows;

  const filtered = [rows[0]];
  const maxCount = Math.max(1, maxSpikePointCount);

  for (let index = 1; index < rows.length - 1; index += 1) {
    const previous = filtered[filtered.length - 1];
    const lastCandidateIndex = Math.min(rows.length - 2, index + maxCount - 1);
    let skippedSpike = false;

    for (let endIndex = index; endIndex <= lastCandidateIndex; endIndex += 1) {
      const next = rows[endIndex + 1];
      const candidates = rows.slice(index, endIndex + 1);
      const isSpike = distanceKm(previous, next) <= maxSpikeDistanceKm
        && candidates.every((candidate) => {
          return distanceKm(previous, candidate) > maxSpikeDistanceKm
            && distanceKm(candidate, next) > maxSpikeDistanceKm;
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

function filterExclusion(rows) {
  return rows.filter((row) => {
    return distanceMeters(row, exclusionCenter) > exclusionRadiusMeters;
  });
}

function rowCoordinate(row) {
  return [row.lon, row.lat];
}

function distanceMeters(first, second) {
  return distanceKm(first, second) * 1000;
}

function distanceKm(first, second) {
  const earthRadiusKm = 6371;
  const lat1 = toRadians(first.lat);
  const lat2 = toRadians(second.lat);
  const deltaLat = toRadians(second.lat - first.lat);
  const deltaLon = toRadians(second.lon - first.lon);
  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

function kilometersToMiles(kilometers) {
  return kilometers * 0.621371;
}

function roundStat(value) {
  return Math.round(value * 10) / 10;
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

function localDateLabel(epoch) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(epoch * 1000));
}

function localSecondsIntoDay(epoch) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).formatToParts(new Date(epoch * 1000));
  const value = (type) => Number(parts.find((part) => part.type === type)?.value || 0);
  const hour = value("hour") % 24;
  return hour * 3600 + value("minute") * 60 + value("second");
}

function calendarDayDifference(firstDate, secondDate) {
  const first = dateOnlyUtc(firstDate);
  const second = dateOnlyUtc(secondDate);
  return Math.round((second - first) / 86400000);
}

function dateOnlyUtc(dateLabel) {
  const [year, month, day] = dateLabel.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function segmentDayNumber(epoch) {
  const localDate = localDateLabel(epoch);
  return Math.min(tripCalendarDayCount, Math.max(1, calendarDayDifference(tripStartDate, localDate) + 1));
}

function segmentColor(epoch) {
  const dayNumber = segmentDayNumber(epoch);
  const dayProgress = localSecondsIntoDay(epoch) / 86400;
  const colors = dayColorRange(dayNumber - 1);
  return hslString(colors.hue, colors.saturation, colors.light - (colors.light - colors.dark) * dayProgress);
}

function dayColorRange(dayIndex) {
  const hueFamilies = [
    [112, 128, 144, 160],
    [42, 48, 54, 60],
    [196, 210, 224, 238]
  ];
  const familyIndex = dayIndex % hueFamilies.length;
  const hues = hueFamilies[familyIndex];
  const hue = hues[Math.floor(dayIndex / hueFamilies.length) % hues.length];
  const saturation = [92, 96, 90][familyIndex];
  const lightnessOffset = Math.floor(dayIndex / hueFamilies.length) % 3;
  return {
    hue,
    saturation,
    light: 78 - lightnessOffset * 2,
    dark: 24 - lightnessOffset
  };
}

function hslString(hue, saturation, lightness) {
  return `hsl(${hue}, ${saturation}%, ${Math.round(lightness * 10) / 10}%)`;
}

function segmentFeatures(rows) {
  const features = [];
  for (let index = 1; index < rows.length; index += 1) {
    const previous = rows[index - 1];
    const current = rows[index];
    const midpointEpoch = Math.round((previous.recorded_at + current.recorded_at) / 2);
    features.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [rowCoordinate(previous), rowCoordinate(current)]
      },
      properties: {
        name: "Final trip route segment",
        kind: "route-segment",
        segment_index: index,
        day_number: segmentDayNumber(midpointEpoch),
        local_date: localDateLabel(midpointEpoch),
        recorded_at_start: previous.recorded_at,
        recorded_at_end: current.recorded_at,
        recorded_at_start_iso: epochToIso(previous.recorded_at),
        recorded_at_end_iso: epochToIso(current.recorded_at),
        color: segmentColor(midpointEpoch)
      }
    });
  }
  return features;
}

function latestPointFeature(row, metadata) {
  if (!row) return null;
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: rowCoordinate(row)
    },
    properties: {
      ...metadata,
      name: "Final published location",
      kind: "latest",
      recorded_at: row.recorded_at,
      recorded_at_iso: epochToIso(row.recorded_at),
      received_at: row.received_at,
      received_at_iso: epochToIso(row.received_at),
      velocity: row.velocity,
      raw_type: row.raw_type,
      source: row.source
    }
  };
}

function main() {
  const rawRows = readTrackerRows(csvPath);
  const publicSafeRows = publicRows(rawRows);
  const finalRows = filterExclusion(publicSafeRows);
  const filteredCount = publicSafeRows.length - finalRows.length;
  const stats = routeStats(finalRows);
  const latest = finalRows[finalRows.length - 1] || null;
  const coordinates = finalRows.map(rowCoordinate);

  const sharedProperties = {
    kind: "route",
    routePart: "final",
    point_count: finalRows.length,
    public_delay_minutes: publicDelayMinutes,
    coordinate_decimals: coordinateDecimals,
    filtered_point_count: filteredCount,
    exclusion_center_lat: exclusionCenter.lat,
    exclusion_center_lon: exclusionCenter.lon,
    exclusion_radius_meters: exclusionRadiusMeters
  };

  const metadata = {
    archivedAt: new Date().toISOString(),
    source: "final public tracker route from timestamped D1 CSV export",
    sourceCsv: path.basename(csvPath),
    sourceCsvRowCount: rawRows.length,
    publicWindowRowCount: publicSafeRows.length,
    filteredPointCount: filteredCount,
    pointCount: finalRows.length,
    segmentCount: Math.max(0, finalRows.length - 1),
    firstRecordedAt: finalRows[0] ? epochToIso(finalRows[0].recorded_at) : null,
    lastRecordedAt: latest ? epochToIso(latest.recorded_at) : null,
    lastReceivedAt: latest ? epochToIso(latest.received_at) : null,
    publicDelayMinutes,
    coordinateDecimals,
    totalDistanceMiles: stats.totalDistanceMiles,
    totalDistanceKilometers: stats.totalDistanceKilometers,
    footDistanceMiles: stats.footDistanceMiles,
    footDistanceKilometers: stats.footDistanceKilometers,
    feedStatus: "trip_complete",
    tripStartDate,
    tripEndDate,
    tripCalendarDayCount,
    publicWindowStart,
    publicWindowEnd,
    exclusionCenter,
    exclusionRadiusMeters,
    colorMode: "timestamped route segments by local trip day and time of day",
    finalStats
  };

  const routeProperties = {
    name: "Final trip route",
    ...sharedProperties,
    first_recorded_at: finalRows[0]?.recorded_at ?? null,
    last_recorded_at: latest?.recorded_at ?? null,
    received_at: latest?.received_at ?? null,
    total_distance_miles: stats.totalDistanceMiles,
    total_distance_kilometers: stats.totalDistanceKilometers,
    foot_distance_miles: stats.footDistanceMiles,
    foot_distance_kilometers: stats.footDistanceKilometers,
    ticks_intercepted: finalStats.ticksIntercepted,
    fiance_calls: finalStats.fianceCalls,
    bears_encountered: finalStats.bearsEncountered,
    interviews_conducted: finalStats.interviewsConducted,
    trees: finalStats.trees,
    car_lockouts: finalStats.carLockouts,
    privacy_mode: "final static route with home-area points removed"
  };

  const routeFeature = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates
    },
    properties: routeProperties
  };

  const features = coordinates.length
    ? [
      routeFeature,
      ...segmentFeatures(finalRows),
      latestPointFeature(latest, {
        ...routeProperties,
        kind: "latest"
      })
    ].filter(Boolean)
    : [];

  const finalGeoJson = {
    type: "FeatureCollection",
    metadata,
    properties: {
      ...routeProperties,
      generated_at: Math.floor(Date.now() / 1000),
      status: "trip_complete"
    },
    features
  };

  fs.writeFileSync(finalPath, `${JSON.stringify(finalGeoJson)}\n`);
  console.log(`CSV rows: ${rawRows.length}`);
  console.log(`Public-safe rows after window/spike filtering: ${publicSafeRows.length}`);
  console.log(`Removed within ${exclusionRadiusMeters}m: ${filteredCount}`);
  console.log(`Final route points: ${finalRows.length}`);
  console.log(`Timestamped route segments: ${Math.max(0, finalRows.length - 1)}`);
  console.log(`Final route distance: ${stats.totalDistanceMiles} mi (${stats.totalDistanceKilometers} km)`);
  console.log(`Final foot distance: ${stats.footDistanceMiles} mi (${stats.footDistanceKilometers} km)`);
  console.log(`Wrote ${path.relative(repoRoot, finalPath)}`);
}

main();
