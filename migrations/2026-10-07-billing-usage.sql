BEGIN;
CREATE TABLE IF NOT EXISTS billing_customers (
  customer_id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS billing_customers_user_idx ON billing_customers(user_id);
CREATE TABLE IF NOT EXISTS hosted_usage (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month text NOT NULL,
  runs integer NOT NULL DEFAULT 0,
  day text NOT NULL,
  day_runs integer NOT NULL DEFAULT 0,
  updated_at timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, month),
  CONSTRAINT hosted_usage_nonnegative CHECK (runs >= 0 AND day_runs >= 0),
  CONSTRAINT hosted_usage_month_format CHECK (month ~ '^[0-9]{4}-[0-9]{2}$'),
  CONSTRAINT hosted_usage_day_format CHECK (day ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$')
);
COMMIT;
