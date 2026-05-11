CREATE TABLE IF NOT EXISTS tracker_points (
  id INTEGER PRIMARY KEY,
  recorded_at TEXT NOT NULL,
  received_at TEXT NOT NULL,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  acc REAL,
  alt REAL,
  batt REAL,
  velocity REAL,
  topic TEXT,
  raw_type TEXT,
  source TEXT DEFAULT 'owntracks'
);

CREATE INDEX IF NOT EXISTS idx_tracker_points_recorded_at
  ON tracker_points (recorded_at);
