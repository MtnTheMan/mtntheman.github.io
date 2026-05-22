# Trip Tracker Setup

Temporary OwnTracks road-trip tracker for mtntheman.com, active May 17, 2026 through June 22, 2026.

Architecture:

```text
OwnTracks mobile app -> Cloudflare Worker POST /api/tracker/ingest -> Cloudflare D1 -> GET /api/tracker/geojson -> MapLibre map page
```

## Files

- `trip-tracker.html` - Jekyll page at `/trip-tracker/`.
- `worker/tracker-worker.js` - Cloudflare Worker API.
- `worker/migrations/0001_create_tracker_points.sql` - D1 schema.
- `worker/wrangler.toml` - local Wrangler config with placeholders. This file is gitignored.
- `worker/wrangler.example.toml` - committed example config.
- `worker/sample-owntracks-payload.json` - sample OwnTracks location payload.

## Public Privacy Defaults

- Public endpoint is unauthenticated, but only returns delayed/generalized data.
- `PUBLIC_DELAY_MINUTES = "600"` by default.
- `COORDINATE_DECIMALS = "3"` by default.
- Public GeoJSON is masked to the trip window: May 17, 2026 at 8:00 AM Eastern through June 22, 2026 at 7:00 PM Eastern.
- Raw current exact location is never returned unless those settings are intentionally changed.
- The page displays a visible privacy note and reports the active privacy mode.

## 1. Install Wrangler

```powershell
npm install -g wrangler
```

## 2. Login to Cloudflare

```powershell
wrangler login
```

## 3. Create the D1 Database

From the repo root:

```powershell
Set-Location worker
wrangler d1 create mtntheman-trip-tracker
```

Cloudflare prints a `database_id`. Put that value in `worker/wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "mtntheman-trip-tracker"
database_id = "REPLACE_WITH_D1_DATABASE_ID"
migrations_dir = "migrations"
```

The binding name must stay `DB`.

## 4. Run Migrations

Remote production D1:

```powershell
Set-Location worker
wrangler d1 migrations apply mtntheman-trip-tracker --remote
```

Local D1 for `wrangler dev`:

```powershell
Set-Location worker
wrangler d1 migrations apply mtntheman-trip-tracker --local
```

## 5. Set Worker Secrets

Use Wrangler secrets. Do not commit credentials.

```powershell
Set-Location worker
wrangler secret put TRACKER_USERNAME
wrangler secret put TRACKER_PASSWORD
wrangler secret put TRACKER_TOKEN
```

`TRACKER_TOKEN` is optional for Bearer auth, but recommended. `TRACKER_USERNAME` and `TRACKER_PASSWORD` are required for Basic Auth.

For local development, create `worker/.dev.vars`:

```text
TRACKER_USERNAME=parker
TRACKER_PASSWORD=replace-with-local-password
TRACKER_TOKEN=replace-with-local-token
```

`worker/.dev.vars` is ignored by git.

## 6. Configure Public Settings

In `worker/wrangler.toml`:

```toml
[vars]
PUBLIC_DELAY_MINUTES = "600"
COORDINATE_DECIMALS = "3"
MAX_PUBLIC_POINTS = "5000"
STALE_MINUTES = "180"
CORS_ALLOWED_ORIGINS = "https://mtntheman.com,https://www.mtntheman.com,http://mtntheman.com,http://www.mtntheman.com,https://mtntheman.github.io,http://localhost:4000,http://127.0.0.1:4000"
```

Optional broad trip bounds. Set all four or omit all four:

```toml
MIN_LAT = "18"
MAX_LAT = "72"
MIN_LON = "-170"
MAX_LON = "-50"
```

`ALLOW_ZERO_COORDS` defaults to false. Only set it for deliberate testing:

```toml
ALLOW_ZERO_COORDS = "true"
```

## 7. Deploy the Worker

```powershell
Set-Location worker
wrangler deploy
```

## 8. Production API Fallback

Production currently uses the workers.dev API fallback because `mtntheman.com` is not a Cloudflare zone in the active Wrangler account. The website page fetches:

```text
https://mtntheman-trip-tracker.mtntheman.workers.dev/api/tracker/geojson
```

OwnTracks should currently post to:

```text
https://mtntheman-trip-tracker.mtntheman.workers.dev/api/tracker/ingest
```

The page still supports `window.TRIP_TRACKER_API_BASE_URL` as an override, but the default is already the workers.dev API.

Keep workers.dev enabled in `worker/wrangler.toml`:

```toml
workers_dev = true
preview_urls = true
```

The cleaner future option is one of:

- Move `mtntheman.com` DNS into this Cloudflare account.
- Use the correct Cloudflare account for the `mtntheman.com` zone.
- Create a Worker custom domain such as `tracker-api.mtntheman.com` if the zone is available.

## 9. OwnTracks iOS HTTP Configuration

Use HTTP mode.

- Active endpoint URL: `https://mtntheman-trip-tracker.mtntheman.workers.dev/api/tracker/ingest`
- Authentication: username/password with `TRACKER_USERNAME` and `TRACKER_PASSWORD`.
- If using Bearer auth, send `Authorization: Bearer <TRACKER_TOKEN>`.
- Location permissions: Always.
- Precise Location: on.
- Background App Refresh: on.
- Avoid Low Power Mode during travel.
- Do not force-close OwnTracks during travel.
- Use Move mode or significant-change mode.

## 10. Curl Tests

Basic Auth ingest test:

```powershell
curl.exe -X POST "https://mtntheman-trip-tracker.mtntheman.workers.dev/api/tracker/ingest" `
  -u "parker:REPLACE_WITH_PASSWORD" `
  -H "Content-Type: application/json" `
  -d '{"_type":"location","lat":42.7221,"lon":-84.4784,"acc":4,"alt":260,"batt":88,"tst":1779048000}'
```

Bearer token ingest test:

```powershell
curl.exe -X POST "https://mtntheman-trip-tracker.mtntheman.workers.dev/api/tracker/ingest" `
  -H "Authorization: Bearer REPLACE_WITH_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{"_type":"location","lat":42.7221,"lon":-84.4784,"acc":4,"alt":260,"batt":88,"vel":13,"tst":1779048000}'
```

Public GeoJSON:

```powershell
curl.exe "https://mtntheman-trip-tracker.mtntheman.workers.dev/api/tracker/geojson"
```

Health:

```powershell
curl.exe "https://mtntheman-trip-tracker.mtntheman.workers.dev/api/tracker/health"
```

Authenticated CSV export:

```powershell
curl.exe "https://mtntheman-trip-tracker.mtntheman.workers.dev/api/tracker/export.csv" `
  -u "parker:REPLACE_WITH_PASSWORD" `
  -o trip-tracker-location-points.csv
```

Because the default privacy delay is 10 hours, a freshly ingested test point will not appear in public GeoJSON immediately. Temporarily set `PUBLIC_DELAY_MINUTES = "0"` only for local testing.

If `/health` shows `point_count` increasing but `/geojson` has no public features, the 10-hour privacy delay is likely working as intended.
Points outside the public trip window are also intentionally masked from `/geojson`.

## 11. Sample OwnTracks Payload

```json
{
  "_type": "location",
  "lat": 42.7221,
  "lon": -84.4784,
  "acc": 4,
  "alt": 260,
  "batt": 88,
  "vel": 13,
  "tst": 1779048000
}
```

Non-location OwnTracks status/debug payloads return:

```json
{ "ok": true, "stored": false, "reason": "ignored_non_location_payload" }
```

## 12. Test OwnTracks

Use OwnTracks "Send Debug Status" first. The Worker should return a 200 ignored response because it is not a location payload.

Then trigger a manual publish/location update. The Worker should return:

```json
{ "ok": true, "stored": true, "id": 1 }
```

Check health:

```powershell
curl.exe "https://mtntheman-trip-tracker.mtntheman.workers.dev/api/tracker/health"
```

## 13. Trip Completion

The page has constants for:

- Start: `2026-05-17`
- End: `2026-06-22`

After June 22, 2026, the page still shows the completed route and displays `Trip complete` instead of `Live`. Data is not deleted automatically.

## Troubleshooting

- `401`: credentials or Bearer token are wrong, or the relevant secret was not set.
- Rotate credentials immediately if they are exposed in screenshots, exports, chat logs, or copied command history.
- `404`: Worker route/custom domain/path is wrong.
- No map points: default 10-hour privacy delay may be hiding recent test points.
- No map points: D1 migration may not have been applied.
- No map points: Worker may not be bound to `DB`.
- OwnTracks background gaps: check iOS Always location permission, Precise Location, Background App Refresh, Low Power Mode, and whether the app was force-closed.
- CORS errors: include `https://mtntheman.com`, `https://www.mtntheman.com`, redirected `http://www.mtntheman.com`, and local dev origins in `CORS_ALLOWED_ORIGINS`.
- OwnTracks points hitting the wrong host: production currently uses `https://mtntheman-trip-tracker.mtntheman.workers.dev/api/tracker/ingest`. The `mtntheman.com/api/tracker/*` routes should stay disabled until the domain is available in the active Cloudflare account.
