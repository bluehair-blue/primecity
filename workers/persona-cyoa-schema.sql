CREATE TABLE IF NOT EXISTS persona_cyoa_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scenario_id TEXT NOT NULL,
  selected_target_character TEXT NOT NULL,
  final_archetype TEXT NOT NULL,
  clicked_cta TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_persona_cyoa_events_created_at
  ON persona_cyoa_events (created_at);

CREATE INDEX IF NOT EXISTS idx_persona_cyoa_events_scenario_cta
  ON persona_cyoa_events (scenario_id, clicked_cta);
