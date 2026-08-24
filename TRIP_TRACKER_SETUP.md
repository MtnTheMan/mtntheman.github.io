# Trip Tracker setup

The tracker publishes two routes on `/trip-tracker/`:

- **NHR Megatrip 2026** (`nhr-megatrip-2026`) combines the committed final archive at `/assets/data/trip-route-final.geojson` with any delayed public Worker data still returned for that track.
- **Maine August Trip** (`maine-august-trip`) is built from OwnTracks points and is delayed 15 hours before appearing in public GeoJSON or on the map.

The active API is the workers.dev fallback:

`https://mtntheman-trip-tracker.mtntheman.workers.dev`

`mtntheman.com` is not available as a Cloudflare zone in the active Wrangler account. Do not add `mtntheman.com/api/tracker/*` routes yet, and keep `workers_dev = true` in `worker/wrangler.toml`.

## Architecture

```text
OwnTracks
  -> authenticated POST /api/tracker/ingest?track=...
  -> Cloudflare Worker
  -> D1 location_points (including track_id)
  -> delayed/rounded GET /api/tracker/geojson
  -> MapLibre on /trip-tracker/

/assets/data/trip-route-final.geojson
  -> final static NHR route on the same MapLibre map

/assets/data/trip-elevation-profile.json
  -> privacy-safe, downsampled NHR GPS elevation profile
```

Files:

- `trip-tracker.html` loads and normalizes the archived route, loads public Worker GeoJSON, and provides track toggles and route details.
- `assets/data/trip-route-final.geojson` is the existing final NHR archive. Do not remove it.
- `assets/data/trip-elevation-profile.json` contains distance, smoothed GPS elevation, and archived timestamp values for the NHR elevation chart. It does not contain coordinates.
- `scripts/build-final-trip-route.js` builds the final route and elevation profile together from the authenticated tracker CSV export.
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
| Maine August Trip | `2026-08-24T13:00:00-04:00` through `2026-08-28T20:00:00-04:00` | 900 minutes / 15 hours | 3 decimals | `#5ab0ff` |

`PUBLIC_DELAY_MINUTES` remains the fallback for a track that does not define its own delay. Maine explicitly defines 900 minutes, so changing the fallback does not remove its 15-hour delay.

OwnTracks `tst` is used as `recorded_at` when present. This keeps queued phone points in the correct trip window even if they reach the Worker later. `received_at` records when the Worker accepted the request.

## Endpoints

Default/original ingest (defaults to NHR Megatrip 2026):

`https://mtntheman-trip-tracker.mtntheman.workers.dev/api/tracker/ingest`

Maine August Trip ingest:

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

## Privacy and public output

Maine points are not public until their OwnTracks `tst` timestamp is at least 15 hours old and is inside the configured Maine window. Coordinates are then rounded to three decimal places and the existing spike filter is applied.

`/health` is a technical status endpoint. It may show Maine stored counts and the latest receipt time immediately, but it never returns coordinates. `/geojson` and the public map use only delay-eligible points for route features and stats, so current movement is not disclosed through totals, timestamps, or the latest marker.

For every public track, GeoJSON contains:

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

The map loads both the archived NHR GeoJSON and the public Worker GeoJSON. `window.TRIP_TRACKER_API_BASE_URL` can override the API base before the page script runs; otherwise the working workers.dev base is used.

The legend toggles NHR Megatrip 2026 and Maine August Trip independently. Both are visible by default. The three interactive MapLibre layers are:

- `tracker-route-segments`
- `tracker-route-points`
- `tracker-latest`

On desktop, hovering updates the route-detail panel and opens a small popup. Clicking or tapping a point or segment pins its information in the panel and popup until another feature is selected. Details include route, Eastern date/time, segment-derived speed, accuracy when available, distance for segments, and whether the source is archived/static or delayed OwnTracks data. The archived NHR segment timestamps are normalized in the browser, and approximate archived segment speeds are calculated when timestamps are available. Missing values are described as unavailable rather than displayed as blank, `undefined`, or `NaN`.

The final NHR ticker remains separate from Maine public stats. Maine values never overwrite final NHR totals or trip-complete counters.

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
- The original ingest still stores points as `nhr-megatrip-2026`.
- Maine ingest returns `track_id: "maine-august-trip"` and `track_name: "Maine August Trip"`.
- Maine-only GeoJSON may have zero public features until a stored point is 15 hours old.
- Public Maine stats and the latest marker advance only with delay-eligible points.
- The public map shows both selected tracks and exposes Eastern time, mph, accuracy when available, and source on hover/click.
- The final NHR counters and page-view endpoints still work.

Do not use a zero public delay against production data. If a test point must be removed, handle it through an explicitly reviewed data operation; never delete existing location data as part of deployment.
