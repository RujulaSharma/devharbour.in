-- REVIEW REQUIRED: do not run automatically. Does not edit application records.
-- This is a new server-only runtime role, never an anon/browser role.
-- Run through the existing privileged administrative connection after approval.
BEGIN;
DO $role$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'devharbour_runtime') THEN
    RAISE EXCEPTION 'devharbour_runtime already exists; review instead of overwriting its permissions';
  END IF;
  CREATE ROLE devharbour_runtime NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;
END
$role$;
GRANT CONNECT ON DATABASE postgres TO devharbour_runtime;
GRANT USAGE ON SCHEMA public TO devharbour_runtime;
DO $tables$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'achievements','certificate_otps','challenges','courses','event_participants',
    'issued_certificates','lesson_progress','lessons','project_bookmarks','project_votes',
    'projects','sessions','submissions','user_achievements','user_settings','users',
    'workspace_assignments','workspace_bookmarks','workspace_notes','workspace_snippets',
    'workspace_tasks','xp_ledger'
  ] LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO devharbour_runtime', table_name);
    -- Express authenticates end users. Its private service role needs application
    -- data access; the role cannot bypass RLS or grant access to browser roles.
    EXECUTE format('CREATE POLICY devharbour_runtime_access ON public.%I FOR ALL TO devharbour_runtime USING (true) WITH CHECK (true)', table_name);
  END LOOP;
END
$tables$;
DO $checks$
BEGIN
  IF has_schema_privilege('devharbour_runtime','public','CREATE') THEN
    RAISE EXCEPTION 'Runtime role inherits public schema CREATE access; review shared grants before proceeding';
  END IF;
  IF has_table_privilege('devharbour_runtime','public._prisma_migrations','UPDATE') THEN
    RAISE EXCEPTION 'Runtime role inherits migration-table write access; review shared grants before proceeding';
  END IF;
END
$checks$;
COMMIT;
-- Separate secure activation, never paste a password into this file or chat:
-- In an interactive psql admin session: \password devharbour_runtime
-- Then: ALTER ROLE devharbour_runtime LOGIN;
-- Update only the local/server DATABASE_URL to that role after a backup and
-- read-only connection test. Keep DIRECT_URL administrative for approved migrations.
-- Verify every runtime API against a staging database before production rollout.
