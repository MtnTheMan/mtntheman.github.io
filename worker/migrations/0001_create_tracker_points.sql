CREATE TABLE IF NOT EXISTS location_points (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recorded_at INTEGER,
  received_at INTEGER NOT NULL,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  acc REAL,
  alt REAL,
  batt REAL,
  velocity REAL,
  raw_type TEXT,
  source TEXT DEFAULT 'owntracks'
);

CREATE INDEX IF NOT EXISTS idx_location_points_recorded_at
ON location_points(recorded_at);
