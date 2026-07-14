CREATE TABLE IF NOT EXISTS page_views (
  path TEXT PRIMARY KEY,
  title TEXT,
  views INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_page_views_views
ON page_views(views DESC);
