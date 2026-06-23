const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const archivePath = path.join(repoRoot, "assets", "data", "trip-route-archive.geojson");
const finalPath = path.join(repoRoot, "assets", "data", "trip-route-final.geojson");
const defaultFeedUrl = "https://mtntheman-trip-tracker.mtntheman.workers.dev/api/tracker/geojson";
const defaultHealthUrl = "https://mtntheman-trip-tracker.mtntheman.workers.dev/api/tracker/health";
const feedUrl = process.argv[2] || defaultFeedUrl;
const healthUrl = process.argv[3] || defaultHealthUrl;
const exclusionCenter = { lat: 42.742557, lon: -84.452255 };
const exclusionRadiusMeters = 100;
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

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function routeFeature(geojson) {
  return (geojson.features || []).find((feature) => {
    return feature.properties && feature.properties.kind === "route";
  });
}

function lastCoordinate(coordinates) {
  return coordinates.length ? coordinates[coordinates.length - 1] : null;
}

function sameCoordinate(first, second) {
  return Boolean(first && second && first[0] === second[0] && first[1] === second[1]);
}

function mergedCoordinates(archiveCoordinates, feedCoordinates) {
  const merged = [...(archiveCoordinates || [])];
  const next = [...(feedCoordinates || [])];
  if (sameCoordinate(lastCoordinate(merged), next[0])) next.shift();
  return merged.concat(next);
}

function distanceMeters(first, second) {
  const earthRadiusMeters = 6371000;
  const lat1 = toRadians(first.lat);
  const lat2 = toRadians(second.lat);
  const deltaLat = toRadians(second.lat - first.lat);
  const deltaLon = toRadians(second.lon - first.lon);
  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

function coordinateToPoint(coordinate) {
  return { lon: coordinate[0], lat: coordinate[1] };
}

function filterExclusion(coordinates) {
  return coordinates.filter((coordinate) => {
    return distanceMeters(coordinateToPoint(coordinate), exclusionCenter) > exclusionRadiusMeters;
  });
}

function kilometersToMiles(kilometers) {
  return kilometers * 0.621371;
}

function routeDistanceKilometers(coordinates) {
  let totalMeters = 0;
  for (let index = 1; index < coordinates.length; index += 1) {
    totalMeters += distanceMeters(coordinateToPoint(coordinates[index - 1]), coordinateToPoint(coordinates[index]));
  }
  return totalMeters / 1000;
}

function roundStat(value) {
  return Math.round(value * 10) / 10;
}

function latestPointFeature(coordinates, metadata) {
  const latest = lastCoordinate(coordinates);
  if (!latest) return null;
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: latest
    },
    properties: {
      name: "Final published location",
      kind: "latest",
      ...metadata
    }
  };
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }
  return response.json();
}

async function main() {
  const archive = readJson(archivePath);
  const live = await fetchJson(feedUrl);
  const health = await fetchJson(healthUrl).catch(() => null);

  const archivedRoute = routeFeature(archive);
  const liveRoute = routeFeature(live);
  const archivedCoordinates = archivedRoute?.geometry?.coordinates || [];
  const liveCoordinates = liveRoute?.geometry?.coordinates || [];
  const allCoordinates = mergedCoordinates(archivedCoordinates, liveCoordinates);
  const finalCoordinates = filterExclusion(allCoordinates);
  const filteredCount = allCoordinates.length - finalCoordinates.length;
  const totalDistanceKilometers = routeDistanceKilometers(finalCoordinates);

  const sharedProperties = {
    kind: "route",
    routePart: "final",
    point_count: finalCoordinates.length,
    public_delay_minutes: live.metadata?.publicDelayMinutes ?? archive.metadata?.publicDelayMinutes ?? null,
    coordinate_decimals: live.metadata?.coordinateDecimals ?? archive.metadata?.coordinateDecimals ?? null,
    filtered_point_count: filteredCount,
    exclusion_center_lat: exclusionCenter.lat,
    exclusion_center_lon: exclusionCenter.lon,
    exclusion_radius_meters: exclusionRadiusMeters
  };

  const metadata = {
    archivedAt: new Date().toISOString(),
    source: "merged final public tracker route",
    sourceArchive: path.relative(repoRoot, archivePath).replace(/\\/g, "/"),
    sourceFeedUrl: feedUrl,
    sourceHealthUrl: health ? healthUrl : null,
    sourceArchivePointCount: archivedCoordinates.length,
    sourceFeedPointCount: liveCoordinates.length,
    sourceMergedPointCount: allCoordinates.length,
    filteredPointCount: filteredCount,
    pointCount: finalCoordinates.length,
    lastRecordedAt: live.metadata?.lastRecordedAt ?? archive.metadata?.lastRecordedAt ?? null,
    lastReceivedAt: live.metadata?.lastReceivedAt ?? null,
    publicDelayMinutes: sharedProperties.public_delay_minutes,
    coordinateDecimals: sharedProperties.coordinate_decimals,
    totalDistanceMiles: roundStat(kilometersToMiles(totalDistanceKilometers)),
    totalDistanceKilometers: roundStat(totalDistanceKilometers),
    footDistanceMiles: health?.live_stats?.foot_distance_miles ?? null,
    footDistanceKilometers: health?.live_stats?.foot_distance_kilometers ?? null,
    feedStatus: "trip_complete",
    tripStartDate: live.metadata?.tripStartDate ?? null,
    tripEndDate: live.metadata?.tripEndDate ?? null,
    publicWindowStart: live.metadata?.publicWindowStart ?? null,
    publicWindowEnd: live.metadata?.publicWindowEnd ?? null,
    exclusionCenter: exclusionCenter,
    exclusionRadiusMeters: exclusionRadiusMeters,
    finalStats
  };

  const routeProperties = {
    name: "Final trip route",
    ...sharedProperties,
    last_recorded_at: live.properties?.last_recorded_at ?? null,
    received_at: live.properties?.received_at ?? null,
    total_distance_miles: metadata.totalDistanceMiles,
    total_distance_kilometers: metadata.totalDistanceKilometers,
    foot_distance_miles: metadata.footDistanceMiles,
    foot_distance_kilometers: metadata.footDistanceKilometers,
    ticks_intercepted: finalStats.ticksIntercepted,
    fiance_calls: finalStats.fianceCalls,
    bears_encountered: finalStats.bearsEncountered,
    interviews_conducted: finalStats.interviewsConducted,
    trees: finalStats.trees,
    car_lockouts: finalStats.carLockouts,
    privacy_mode: "final static route with home-area points removed"
  };

  const finalGeoJson = {
    type: "FeatureCollection",
    metadata,
    properties: {
      ...routeProperties,
      generated_at: Math.floor(Date.now() / 1000),
      status: "trip_complete"
    },
    features: finalCoordinates.length ? [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: finalCoordinates
        },
        properties: routeProperties
      },
      latestPointFeature(finalCoordinates, {
        ...routeProperties,
        kind: "latest"
      })
    ].filter(Boolean) : []
  };

  fs.writeFileSync(finalPath, `${JSON.stringify(finalGeoJson)}\n`);
  console.log(`Archive route points: ${archivedCoordinates.length}`);
  console.log(`Current feed route points: ${liveCoordinates.length}`);
  console.log(`Merged route points: ${allCoordinates.length}`);
  console.log(`Removed within ${exclusionRadiusMeters}m: ${filteredCount}`);
  console.log(`Final route points: ${finalCoordinates.length}`);
  console.log(`Final route distance: ${metadata.totalDistanceMiles} mi (${metadata.totalDistanceKilometers} km)`);
  console.log(`Wrote ${path.relative(repoRoot, finalPath)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
