# Trip Tracker setup

The tracker publishes two routes on `/trip-tracker/`:

- **NHR Megatrip 2026** (`nhr-megatrip-2026`) uses only the committed, privacy-filtered final archive at `/assets/data/trip-route-final.geojson` for map geometry.
- **Maine Trip August 2026** (`maine-august-trip`) uses only the committed, privacy-filtered final archive at `/assets/data/maine-trip-august-2026.geojson` for map geometry.

All stored OwnTracks rows remain in D1. Neither finalized track is returned as route geometry by Worker GeoJSON, so the static files cannot be duplicated by the live feed.

The active API is the workers.dev fallback:

`https://mtntheman-trip-tracker.mtntheman.workers.dev`

`mtntheman.com` is not available as a Cloudflare zone in the active Wrangler account. Do not add `mtntheman.com/api/tracker/*` routes yet, and keep `workers_dev = true` in `worker/wrangler.toml`.

## Architecture

```text
OwnTracks
  -> authenticated POST /api/tracker/ingest?track=...
  -> Cloudflare Worker
  -> D1 location_points (including track_id)
  -> delayed/rounded GET /api/tracker/geojson for any future live tracks
  -> MapLibre on /trip-tracker/

/assets/data/trip-route-final.geojson
  -> sole NHR route on the MapLibre map

/assets/data/maine-trip-august-2026.geojson
  -> sole Maine route on the same MapLibre map
  -> excludes the configured Aug 27–28 privacy interval

/assets/data/trip-elevation-profile.json
  -> privacy-safe, downsampled NHR GPS elevation profile
```

Files:

- `trip-tracker.html` loads and normalizes both archived routes, defensively ignores live geometry for either completed track, and provides track toggles and route details.
- `assets/data/trip-route-final.geojson` is the existing final NHR archive. Do not remove it.
- `assets/data/maine-trip-august-2026.geojson` is the final Maine archive. It retains the displayed route points as data, while the map renders only its segment features so thousands of point markers do not cover the route.
- `assets/data/trip-elevation-profile.json` contains distance, smoothed GPS elevation, and archived timestamp values for the NHR elevation chart. It does not contain coordinates.
- `scripts/build-final-trip-route.js` builds the final route and elevation profile together from the authenticated tracker CSV export.
- `scripts/build-maine-trip-archive.js` creates or verifies the Maine archive and removes the privacy interval and every segment that touches it.
- `worker/tracker-worker.js` implements tracker and page-view API endpoints.
- `worker/migrations/0001_create_tracker_points.sql` creates the original location table.
- `worker/migrations/0002_add_track_support.sql` adds and indexes `track_id` without recreating the table or deleting rows.
- `worker/migrations/0002_create_page_views.sql` creates the existing page-view table.
- `worker/wrangler.toml` keeps workers.dev enabled and binds the D1 database.

The page-view endpoints remain active:

- `POST /api/views/hit`
- `GET` or `POST /api/views/counts`

## Track configuration

Track metadata is centralized in `TRACKS` in `worker/tracker-worker.js`.

| Track | Public window (Eastern) | Public delay | Rounding | Color |
| --- | --- | ---: | ---: | --- |
| NHR Megatrip 2026 | `2026-05-17T08:00:00-04:00` through `2026-06-22T19:00:00-04:00` | 600 minutes / 10 hours | 3 decimals | `#00ff66` |
| Maine Trip August 2026 | `2026-08-24T13:00:00-04:00` through `2026-08-28T20:00:00-04:00` | 900 minutes / 15 hours | 3 decimals | warm daily red/orange/yellow gradients |

`PUBLIC_DELAY_MINUTES` remains the fallback for a track that does not define its own delay. Maine explicitly defines 900 minutes. That delay governed the feed used to produce the final static snapshot.

Both completed tracks set `publicArchiveOnly: true`. Their ingest endpoints remain available for backward compatibility, health counts, and authenticated export, but the Worker returns no segments, route points, or latest marker for either one. The committed archives are the canonical map routes.

OwnTracks `tst` is used as `recorded_at` when present. This keeps queued phone points in the correct trip window even if they reach the Worker later. `received_at` records when the Worker accepted the request.

## Endpoints

Default/original ingest (defaults to NHR Megatrip 2026):

`https://mtntheman-trip-tracker.mtntheman.workers.dev/api/tracker/ingest`

Maine Trip August 2026 ingest:

`https://mtntheman-trip-tracker.mtntheman.workers.dev/api/tracker/ingest?track=maine-august-trip`

Public GeoJSON for both tracks:

`https://mtntheman-trip-tracker.mtntheman.workers.dev/api/tracker/geojson`

Optional public filtering:

```text
/api/tracker/geojson?track=maine-august-trip
/api/tracker/geojson?tracks=nhr-megatrip-2026,maine-august-trip
```

Health:

`https://mtntheman-trip-tracker.mtntheman.workers.dev/api/tracker/health`

Authenticated CSV export:

`https://mtntheman-trip-tracker.mtntheman.workers.dev/api/tracker/export.csv`

Unknown ingest or GeoJSON track IDs return HTTP 400 with `{"ok":false,"error":"unknown_track"}`. Ingest keeps the existing Basic and Bearer authentication behavior. Non-location OwnTracks payloads are still acknowledged and ignored.

The authenticated CSV export includes `track_id`.

## Privacy and route output

The Maine archive was captured from the completed, 15-hour-delayed Worker feed after the trip ended. Its coordinates had already been rounded to three decimal places and passed through the existing spike filter.

The archive then removes locations whose recorded timestamp is after `2026-08-27T14:32:00-04:00` and before `2026-08-28T00:00:00-04:00`. It also removes every segment that overlaps that interval, so the map has a real break instead of a straight line connecting the retained locations. The source contained 1,405 route points; 106 were excluded and 1,299 remain. The first retained point on August 28 is at 12:30 PM ET because the source contains no earlier point that day.

NHR OwnTracks rows are never used as public map geometry. They remain in D1 and continue to appear in aggregate `/health` counts and authenticated CSV export, but `/geojson` emits zero NHR features. The browser also omits the archive's completed-trip `latest` marker, leaving only the privacy-filtered NHR route segments. This prevents thousands of point markers and a duplicate route from being layered over the final archive, and prevents a later raw destination point from restoring coordinates intentionally removed from that archive.

Maine OwnTracks rows are handled the same way after finalization: the database rows are retained, `/health` may report their aggregate counts, authenticated export remains available, and `/geojson` emits zero Maine features. The browser draws the committed archive's segments only, while its route-point records remain in the file for inspection and reproducibility.

For any future Worker-published live track, GeoJSON contains:

- `route-segment` LineString features for consecutive points;
- `route-point` Point features for timestamp and speed inspection;
- one `latest` Point feature when at least one delayed public point exists;
- per-track delayed public stats in `metadata.tracks`.

Segment speed is calculated from the rounded, published points:

```text
speed_mph = distance_miles / ((current.recorded_at - previous.recorded_at) / 3600)
```

Zero or negative elapsed time produces no speed. A point uses the speed of the segment ending at that point; the first point has no speed. Foot distance keeps the existing heuristic: a segment under 7 mph counts as foot travel. Speeds are approximate, and GPS noise can have a large effect on short segments.

## Map interaction

The map loads the archived NHR and Maine GeoJSON files and displays archive segments only, without archive point clouds or completed-trip latest markers. It also defensively ignores NHR and Maine geometry from the Worker feed, so an older or overridden Worker cannot recreate duplicate lines or point clouds. `window.TRIP_TRACKER_API_BASE_URL` can override the API base before the page script runs; otherwise the working workers.dev base is used.

The legend toggles NHR Megatrip 2026 and Maine Trip August 2026 independently. Both are visible by default. The three interactive MapLibre layers are:

- `tracker-route-segments`
- `tracker-route-points`
- `tracker-latest`

On desktop, hovering updates the route-detail panel and opens a small popup. Clicking or tapping a segment pins its information in the panel and popup until another feature is selected. Details include route, Eastern date/time, approximate segment-derived speed, distance, and archived/static source. Missing values are described as unavailable rather than displayed as blank, `undefined`, or `NaN`.

The final NHR ticker remains separate from Maine archive stats. Maine values never overwrite final NHR totals or trip-complete counters.

## Maine archive build

The one-time source snapshot was the completed Maine-only delayed GeoJSON feed, saved after every in-window point had become delay-eligible. Build the committed archive with:

```powershell
node scripts/build-maine-trip-archive.js "PATH_TO_COMPLETED_MAINE_GEOJSON"
```

The command is also safe to run against the committed archive itself as a verification/rewrite pass. It preserves the original source and excluded-point counts. The script fails if verification finds a point in the hidden interval or a segment overlapping it. It never connects to D1 and never deletes a stored row.

Maine segment colors follow the NHR archive convention: the segment midpoint determines its Eastern calendar day and its progress through that day. Maine alternates red, orange, yellow, deeper red, and amber across August 24–28, with each day fading from a lighter morning shade to a darker evening shade. The warm gradient is stored directly in each segment feature's `color` property.

## NHR elevation profile

The elevation chart below the map covers the complete privacy-filtered NHR archive. Its horizontal axis is cumulative route distance in miles, and its vertical axis is approximate elevation in feet. Hovering, tapping, clicking, or using the left/right arrow keys reveals the nearest trip mile, altitude, and Eastern timestamp.

The source OwnTracks data contains altitude for every archived NHR point. The committed chart data is reduced to 1,600 representative points with largest-triangle downsampling after a seven-point rolling median, limited to readings no more than 15 minutes apart. The median reduces isolated phone-GPS altitude errors without smoothing across long recording gaps. The profile data omits latitude and longitude because the already-committed GeoJSON remains the canonical public route geometry.

Phone GPS altitude is approximate and can differ from terrain elevation, especially during short fixes, inside vehicles, or around weak satellite geometry. Rebuilding `trip-route-final.geojson` with `scripts/build-final-trip-route.js` also rebuilds `trip-elevation-profile.json` from the same final, spike-filtered, home-excluded rows.

## Authentication and secrets

Set secrets through Wrangler; never add them to `wrangler.toml`, this repository, an OwnTracks export, screenshots, or command history:

```powershell
wrangler.cmd secret put TRACKER_USERNAME
wrangler.cmd secret put TRACKER_PASSWORD
wrangler.cmd secret put TRACKER_TOKEN
```

Ingest accepts either the existing Basic Auth username/password pair or Bearer token. Export remains authenticated.

## Migration and deployment

Work from the Worker directory:

```powershell
Set-Location "C:\Users\parke\OneDrive\Documents\GitHub\mtntheman.github.io\worker"
```

Before applying the migration, inspect the remote schema:

```powershell
wrangler.cmd d1 execute mtntheman-trip-tracker --remote --command="PRAGMA table_info(location_points);"
```

If `track_id` already exists, stop. Do not run `0002_add_track_support.sql`, recreate the table, or delete any rows.

If `track_id` is absent, apply the migration and deploy:

```powershell
wrangler.cmd d1 execute mtntheman-trip-tracker --remote --file=migrations\0002_add_track_support.sql
wrangler.cmd deploy
```

The migration adds `track_id`, assigns all existing rows to `nhr-megatrip-2026`, and creates the `(track_id, recorded_at)` index.

## Verification

Health and public feeds do not require credentials:

```powershell
curl.exe "https://mtntheman-trip-tracker.mtntheman.workers.dev/api/tracker/health"
curl.exe "https://mtntheman-trip-tracker.mtntheman.workers.dev/api/tracker/geojson"
curl.exe "https://mtntheman-trip-tracker.mtntheman.workers.dev/api/tracker/geojson?track=maine-august-trip"
```

Use placeholders for authenticated tests; do not paste real credentials into documentation or commit them:

```powershell
curl.exe -X POST "https://mtntheman-trip-tracker.mtntheman.workers.dev/api/tracker/ingest" `
  -u "YOUR_USERNAME:YOUR_PASSWORD" `
  -H "Content-Type: application/json" `
  -d '{"_type":"location","lat":42.7221,"lon":-84.4784,"acc":4,"alt":260,"batt":88,"tst":1779048000}'

curl.exe -X POST "https://mtntheman-trip-tracker.mtntheman.workers.dev/api/tracker/ingest?track=maine-august-trip" `
  -u "YOUR_USERNAME:YOUR_PASSWORD" `
  -H "Content-Type: application/json" `
  -d '{"_type":"location","lat":44.3106,"lon":-69.7795,"acc":4,"alt":70,"batt":88,"tst":1787605500}'
```

Expected results:

- `/health` lists both configured tracks and may show Maine stored points immediately.
- NHR-only and Maine-only GeoJSON each contain zero features because their final archives are the sole map geometry.
- The original ingest still stores points as `nhr-megatrip-2026`.
- Maine ingest returns `track_id: "maine-august-trip"` and `track_name: "Maine Trip August 2026"`.
- The map shows both selected archived tracks and exposes Eastern time, approximate mph, distance, and source on hover/click.
- The Maine archive contains 1,299 retained route points and 1,297 retained route segments, with no point or segment in the hidden Aug 27–28 interval.
- The final NHR counters and page-view endpoints still work.

Do not use a zero public delay against production data. If a test point must be removed, handle it through an explicitly reviewed data operation; never delete existing location data as part of deployment.
