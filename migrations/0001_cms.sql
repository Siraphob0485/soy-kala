CREATE TABLE IF NOT EXISTS catalog (
  id INTEGER PRIMARY KEY CHECK(id = 1),
  draft TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  published TEXT NOT NULL,
  published_revision INTEGER NOT NULL DEFAULT 1,
  published_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  credential_version TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS login_attempts (
  bucket TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
