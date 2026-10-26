CREATE TABLE IF NOT EXISTS subscriptions (
  endpoint TEXT PRIMARY KEY,
  subscription_json TEXT NOT NULL,
  device_token_hash TEXT NOT NULL,
  app_url TEXT NOT NULL,
  daily_goal INTEGER NOT NULL DEFAULT 5 CHECK (daily_goal IN (1, 3, 5, 8, 10, 15, 20)),
  time_zone TEXT NOT NULL DEFAULT 'Africa/Johannesburg',
  start_hour INTEGER NOT NULL DEFAULT 8 CHECK (start_hour BETWEEN 0 AND 23),
  end_hour INTEGER NOT NULL DEFAULT 22 CHECK (end_hour BETWEEN 1 AND 24),
  local_day TEXT NOT NULL DEFAULT '',
  next_slot INTEGER NOT NULL DEFAULT 0,
  next_send_at INTEGER,
  paused INTEGER NOT NULL DEFAULT 0 CHECK (paused IN (0, 1)),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_due
ON subscriptions(paused, next_send_at);

CREATE TABLE IF NOT EXISTS request_limits (
  ip_hash TEXT NOT NULL,
  local_day TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (ip_hash, local_day)
);
