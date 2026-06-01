const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const archivePath = path.join(repoRoot, "assets", "data", "trip-route-archive.geojson");
const defaultFeedUrl = "https://mtntheman-trip-tracker.mtntheman.workers.dev/api/tracker/geojson";
const feedUrl = process.argv[2] || defaultFeedUrl;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function routeFeature(geojson) {
  return (geojson.features || []).find((feature) => {
    return feature.properties && feature.properties.kind === "route";
  });
}

function coordinateKey(coordinate) {
  return coordinate.join(",");
}

function mergedCoordinates(first, second) {
  const merged = [];
  const seen = new Set();

  [first, second].forEach((coordinates) => {
    (coordinates || []).forEach((coordinate) => {
      const key = coordinateKey(coordinate);
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(coordinate);
      }
    });
  });

  return merged;
}

async function main() {
  const archive = readJson(archivePath);
  const response = await fetch(feedUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Tracker feed returned ${response.status}`);
  }

  const live = await response.json();
  const archivedRoute = routeFeature(archive);
  const liveRoute = routeFeature(live);
  const coordinates = mergedCoordinates(
    archivedRoute && archivedRoute.geometry && archivedRoute.geometry.coordinates,
    liveRoute && liveRoute.geometry && liveRoute.geometry.coordinates
  );

  const nextArchive = {
    type: "FeatureCollection",
    metadata: {
      archivedAt: new Date().toISOString(),
      source: "merged delayed public tracker feed",
      lastRecordedAt: live.metadata && live.metadata.lastRecordedAt,
      publicDelayMinutes: live.metadata && live.metadata.publicDelayMinutes,
      coordinateDecimals: live.metadata && live.metadata.coordinateDecimals,
      totalDistanceMiles: live.metadata && live.metadata.totalDistanceMiles,
      totalDistanceKilometers: live.metadata && live.metadata.totalDistanceKilometers,
      footDistanceMiles: live.metadata && live.metadata.footDistanceMiles,
      footDistanceKilometers: live.metadata && live.metadata.footDistanceKilometers
    },
    features: coordinates.length ? [{
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates
      },
      properties: {
        name: "Archived route",
        kind: "route",
        routePart: "archive",
        point_count: coordinates.length,
        public_delay_minutes: live.metadata && live.metadata.publicDelayMinutes,
        coordinate_decimals: live.metadata && live.metadata.coordinateDecimals
      }
    }] : []
  };

  fs.writeFileSync(archivePath, `${JSON.stringify(nextArchive)}\n`);
  console.log(`Wrote ${coordinates.length} route points to ${path.relative(repoRoot, archivePath)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
