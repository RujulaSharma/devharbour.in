-- Some development databases use the schema owner rather than the hosted app role.
DO $migration$
BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = 'devharbour_web') THEN
    GRANT USAGE ON SCHEMA study_together TO devharbour_web;
    GRANT SELECT, INSERT, UPDATE, DELETE ON
      study_together.groups, study_together.members, study_together.subscriptions
      TO devharbour_web;
    GRANT SELECT, INSERT, UPDATE ON study_together.sessions TO devharbour_web;
    GRANT SELECT, INSERT ON study_together.starts TO devharbour_web;
    GRANT SELECT, INSERT, UPDATE(singleton) ON study_together.push_keys TO devharbour_web;
  END IF;
END;
$migration$;
