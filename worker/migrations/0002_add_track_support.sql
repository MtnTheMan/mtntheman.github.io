ALTER TABLE location_points ADD COLUMN track_id TEXT DEFAULT 'nhr-megatrip-2026';

UPDATE location_points
SET track_id = 'nhr-megatrip-2026'
WHERE track_id IS NULL OR track_id = '';

CREATE INDEX IF NOT EXISTS idx_location_points_track_recorded
ON location_points(track_id, recorded_at);
