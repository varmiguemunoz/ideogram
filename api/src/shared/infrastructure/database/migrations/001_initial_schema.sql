-- Baseline schema, version 1.
--
-- This reproduces exactly what the previous db.ts created at runtime,
-- including the training_selection_paths column that used to be patched in
-- by an ad hoc PRAGMA table_info check on every boot. Existing databases
-- already at user_version 1 are left untouched, so no reset is needed.

CREATE TABLE IF NOT EXISTS app_state (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  trigger_word TEXT,
  destination_model TEXT,
  trained_version TEXT,
  training_status TEXT NOT NULL DEFAULT 'idle'
    CHECK (training_status IN ('idle','pending','processing','succeeded','failed')),
  training_prediction_id TEXT,
  training_zip_url TEXT,
  training_started_at INTEGER,
  training_selection_paths TEXT
);

CREATE TABLE IF NOT EXISTS generations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scenario TEXT NOT NULL CHECK (scenario IN ('mirror','beach','office')),
  framing TEXT NOT NULL CHECK (framing IN ('headshot','knees_up')),
  clothing_description TEXT NOT NULL,
  prompt TEXT NOT NULL,
  prediction_id TEXT,
  output_url TEXT,
  error TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending','processing','succeeded','failed')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);

INSERT OR IGNORE INTO app_state (id, training_status) VALUES (1, 'idle');
