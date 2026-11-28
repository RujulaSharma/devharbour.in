-- Apply as the backend database role before enabling poster submissions.
BEGIN;
CREATE TABLE IF NOT EXISTS public.tatva_poster_entries (
  user_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL UNIQUE,
  post_url TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'eligible', 'needs_correction', 'shortlisted')),
  note TEXT NOT NULL DEFAULT ''
);
ALTER TABLE public.tatva_poster_entries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tatva_poster_entries FROM PUBLIC, anon, authenticated;
COMMIT;
