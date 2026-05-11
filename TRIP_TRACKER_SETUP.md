# Trip Tracker Setup

This repo includes a temporary live road-trip tracker for mtntheman.com. The static page lives at `/trip-tracker/`; the API is a separate Cloudflare Worker backed by D1.

The default public behavior is privacy-preserving:

- Public points are delayed by 30 minutes.
- Public coordinates are rounded to 3 decimal places, roughly 100 meters.
- The Worker can be switched to a stricter several-hour delay.
- The tracker can auto-hide after the trip.
- Secrets are stored as Worker secrets, not committed.

## Files

- `trip-tracker.html` - Jekyll page with the Leaflet map and status panel.
- `worker/tracker-worker.js` - Cloudflare Worker API.
- `worker/migrations/0001_create_tracker_points.sql` - D1 schema.
- `worker/wrangler.example.toml` - example Wrangler config with placeholders.
- `worker/sample-owntracks-payload.json` - sample OwnTracks payload for tests.

## Endpoints

- `POST /api/tracker/ingest` - private OwnTracks ingest endpoint.
- `GET /api/tracker/geojson` - public delayed/generalized GeoJSON for the map.
- `GET /api/tracker/export.geojson` - private full export.
- `GET /api/tracker/export.csv` - private full CSV export.
- `POST /api/tracker/clear-test` - private cleanup endpoint for test points.

## 1. Install Wrangler

Use the current Cloudflare Wrangler CLI. This is only needed on the machine used to deploy the Worker.

```powershell
npm install -g wrangler
wrangler login
```

## 2. Create the D1 Database

From the repo root:

```powershell
Set-Location worker
wrangler d1 create mtntheman-trip-tracker
```

Copy the returned `database_id` into a new local config:

```powershell
Copy-Item wrangler.example.toml wrangler.toml
```

Edit `worker/wrangler.toml` and replace:

```toml
database_id = "REPLACE_WITH_D1_DATABASE_ID"
```

Do not commit `wrangler.toml` if it contains account-specific values you do not want public.
The repo ignores `worker/wrangler.toml` by default.

## 3. Run the D1 Migration

```powershell
Set-Location worker
wrangler d1 migrations apply mtntheman-trip-tracker --remote
```

For local Worker testing:

```powershell
wrangler d1 migrations apply mtntheman-trip-tracker --local
```

For `wrangler dev`, put local-only secrets in `worker/.dev.vars`:

```text
TRACKER_TOKEN=replace-with-your-local-test-token
```

`worker/.dev.vars` is ignored by git.

## 4. Configure Worker Secrets

Set a long random token for OwnTracks and maintenance endpoints:

```powershell
Set-Location worker
wrangler secret put TRACKER_TOKEN
```

Recommended token: at least 32 random characters.

The public privacy settings are normal environment variables in `wrangler.toml`:

```toml
PUBLIC_DELAY_MINUTES = "30"
COORD_DECIMALS = "3"
STALE_HOURS = "6"
TRACKER_HIDE_AFTER = "2026-06-23T00:00:00-04:00"
```

For stricter mode, add:

```toml
STRICT_DELAY_HOURS = "4"
```

That shows only the trail up to at least 4 hours ago.

## 5. Deploy the Worker

```powershell
Set-Location worker
wrangler deploy
```

The example route is:

```toml
routes = [
  { pattern = "mtntheman.com/api/tracker/*", zone_name = "mtntheman.com" }
]
```

That lets the static page fetch:

```text
https://mtntheman.com/api/tracker/geojson
```

## 6. Website Navigation

The shared Jekyll nav in `_layouts/default.html` includes:

```liquid
<a href="{{ '/trip-tracker/' | relative_url }}">Trip Tracker</a>
```

To remove the tracker after the trip, delete that nav item and either delete `trip-tracker.html` or leave it unlinked. The Worker can also show a complete/empty feed after `TRACKER_HIDE_AFTER`.

## 7. Configure OwnTracks

Use HTTP mode and point OwnTracks at:

```text
https://mtntheman.com/api/tracker/ingest
```

Preferred authentication:

```text
Authorization: Bearer YOUR_TRACKER_TOKEN
```

If the app makes bearer auth awkward, the Worker also supports:

- HTTP Basic Auth, using the token as the password.
- Query string fallback: `https://mtntheman.com/api/tracker/ingest?token=YOUR_TRACKER_TOKEN`

The query string fallback is less private because URLs can appear in logs. Prefer the `Authorization` header.

### iOS Notes

- Set OwnTracks to use HTTP mode.
- Allow location access while using the app or always, depending on how active the trip tracking should be.
- Enable background app refresh.
- Keep low power mode in mind; it can reduce background sending.
- Use significant-change or move mode if you want lower battery use.

### Android Notes

- Set OwnTracks to use HTTP mode.
- Allow background location permission.
- Disable battery optimization for OwnTracks.
- Confirm mobile data is allowed in the background.
- Use move mode or significant-change style settings for lower battery use.

## 8. Test Locally

Start the Worker locally:

```powershell
Set-Location worker
wrangler dev
```

In another terminal, send a sample point:

```powershell
$env:TRACKER_TOKEN = "replace-with-your-token"
curl.exe -X POST "http://127.0.0.1:8787/api/tracker/ingest" `
  -H "Authorization: Bearer $env:TRACKER_TOKEN" `
  -H "Content-Type: application/json" `
  --data-binary "@sample-owntracks-payload.json"
```

Fetch public GeoJSON:

```powershell
curl.exe "http://127.0.0.1:8787/api/tracker/geojson"
```

Because of the default 30-minute privacy delay, a just-created test point may not appear immediately. Temporarily set this for local testing:

```toml
PUBLIC_DELAY_MINUTES = "0"
```

Then restart `wrangler dev`.

## 9. Test Deployed Endpoint

```powershell
$env:TRACKER_TOKEN = "replace-with-your-token"
curl.exe -X POST "https://mtntheman.com/api/tracker/ingest" `
  -H "Authorization: Bearer $env:TRACKER_TOKEN" `
  -H "Content-Type: application/json" `
  --data-binary "@worker/sample-owntracks-payload.json"
```

```powershell
curl.exe "https://mtntheman.com/api/tracker/geojson"
```

Export all points:

```powershell
curl.exe "https://mtntheman.com/api/tracker/export.csv" `
  -H "Authorization: Bearer $env:TRACKER_TOKEN" `
  -o tracker-points.csv
```

Clear test points before the trip:

```powershell
curl.exe -X POST "https://mtntheman.com/api/tracker/clear-test" `
  -H "Authorization: Bearer $env:TRACKER_TOKEN"
```

Or clear only points before a date:

```powershell
curl.exe -X POST "https://mtntheman.com/api/tracker/clear-test?before=2026-05-17T00:00:00-04:00" `
  -H "Authorization: Bearer $env:TRACKER_TOKEN"
```

## 10. Sample Payload

`worker/sample-owntracks-payload.json`:

```json
{
  "_type": "location",
  "lat": 39.7392,
  "lon": -104.9903,
  "tst": 1779033600,
  "acc": 25,
  "alt": 1609,
  "batt": 87,
  "vel": 12,
  "topic": "owntracks/parker/phone"
}
```

The Worker stores latitude, longitude, recorded time, received time, accuracy, altitude, battery, velocity, topic, raw type, and source.

## 11. Privacy Controls

Set these in `wrangler.toml`:

```toml
PUBLIC_DELAY_MINUTES = "30"
COORD_DECIMALS = "3"
STRICT_DELAY_HOURS = "4"
TRACKER_HIDE_AFTER = "2026-06-23T00:00:00-04:00"
```

Coordinate rounding examples:

- `2` - city/region scale.
- `3` - roughly 100 meters.
- `4` - roughly 10 meters.

Bounds are enabled by default for a broad North America region:

```toml
MIN_LAT = "18"
MAX_LAT = "72"
MIN_LON = "-170"
MAX_LON = "-50"
```

Disable only if needed:

```toml
DISABLE_BOUNDS = "true"
```

## Troubleshooting

### OwnTracks is not sending in the background

Check background app refresh, location permission, low power mode, mobile data, and OwnTracks mode settings. On Android, disable battery optimization for OwnTracks.

### Battery optimization stops updates

Use a less aggressive OwnTracks tracking mode or exempt OwnTracks from battery optimization. Confirm the phone is not in low power mode.

### Bad token or 401 errors

Confirm the Worker secret was set:

```powershell
wrangler secret put TRACKER_TOKEN
```

Then confirm OwnTracks sends exactly:

```text
Authorization: Bearer YOUR_TRACKER_TOKEN
```

### No GPS fix

OwnTracks may send no location or stale location indoors. Check phone location permissions and confirm the app can see a current GPS/network location.

### Browser CORS issues

Set:

```toml
CORS_ORIGIN = "https://mtntheman.com"
```

If testing from `wrangler dev`, temporarily use the local origin or `*`.

### The map loads but no trail appears

Common causes:

- No points have been ingested.
- The test point is newer than `PUBLIC_DELAY_MINUTES`.
- Coordinates were outside the expected bounds and rejected.
- D1 migration was not applied to the remote database.
- The Worker route is not attached to `mtntheman.com/api/tracker/*`.

### The feed is delayed intentionally

This is expected. By default, the public page does not show exact current position. Set `PUBLIC_DELAY_MINUTES` or `STRICT_DELAY_HOURS` only if you deliberately want different behavior.
