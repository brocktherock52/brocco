BEGIN;
CREATE TABLE IF NOT EXISTS billing_trial_claims (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  subscription_id text NOT NULL UNIQUE,
  created_at timestamp NOT NULL DEFAULT now()
);
COMMIT;
