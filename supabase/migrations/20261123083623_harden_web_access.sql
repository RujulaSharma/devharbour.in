-- This application authenticates with its own server-side sessions.
DROP POLICY IF EXISTS "Public can verify issued certificates" ON public.issued_certificates;
DROP POLICY IF EXISTS "Public can view basic profiles" ON public.users;
DROP POLICY IF EXISTS "Public can view event participants" ON public.event_participants;
DROP POLICY IF EXISTS "Service role full access on users" ON public.users;
DROP POLICY IF EXISTS "Service role full access on sessions" ON public.sessions;
DROP POLICY IF EXISTS "Service role full access on settings" ON public.user_settings;
DROP POLICY IF EXISTS "Service role full access on progress" ON public.lesson_progress;
DROP POLICY IF EXISTS "Service role full access on submissions" ON public.submissions;
DROP POLICY IF EXISTS "Service role full access on xp" ON public.xp_ledger;
DROP POLICY IF EXISTS "Service role full access on user_achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Service role full access on projects" ON public.projects;
DROP POLICY IF EXISTS "Service role full access on certificates" ON public.issued_certificates;
DROP POLICY IF EXISTS "Service role full access on participants" ON public.event_participants;
DROP POLICY IF EXISTS "Service role full access on workspace_tasks" ON public.workspace_tasks;
DROP POLICY IF EXISTS "Service role full access on workspace_notes" ON public.workspace_notes;
DROP POLICY IF EXISTS "Public view of profiles" ON public.users;
DROP POLICY IF EXISTS "Public can view challenges" ON public.challenges;
REVOKE ALL ON public.challenges FROM anon, authenticated;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.users, public.sessions, public.user_settings, public.lesson_progress, public.submissions, public.xp_ledger, public.user_achievements, public.workspace_tasks, public.workspace_notes, public.workspace_assignments, public.workspace_snippets, public.workspace_bookmarks, public.event_participants, public.issued_certificates, public.certificate_otps, public.project_votes, public.project_bookmarks FROM anon, authenticated;
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  key text PRIMARY KEY,
  hits bigint NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS auth_rate_limit_expiry ON public.auth_rate_limits(expires_at);
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.auth_rate_limits FROM anon, authenticated;
CREATE TABLE IF NOT EXISTS public.orcathon_gallery_votes (
  project_id text NOT NULL REFERENCES public.orcathon_projects(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, user_id)
);
ALTER TABLE public.orcathon_gallery_votes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.orcathon_gallery_votes FROM anon, authenticated;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'devharbour_runtime') THEN
    GRANT SELECT, INSERT, DELETE ON public.orcathon_gallery_votes TO devharbour_runtime;
    DROP POLICY IF EXISTS runtime_gallery_votes ON public.orcathon_gallery_votes;
    CREATE POLICY runtime_gallery_votes ON public.orcathon_gallery_votes FOR ALL TO devharbour_runtime USING (true) WITH CHECK (true);
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.auth_rate_limits TO devharbour_runtime;
    DROP POLICY IF EXISTS runtime_auth_limits ON public.auth_rate_limits;
    CREATE POLICY runtime_auth_limits ON public.auth_rate_limits FOR ALL TO devharbour_runtime USING (true) WITH CHECK (true);
  END IF;
END;
$$;
