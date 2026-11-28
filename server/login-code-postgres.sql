-- Additive private storage for password sign-in challenges. No account or event rows change.
CREATE TABLE IF NOT EXISTS public.auth_login_challenges (
  user_id text PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  challenge_id text NOT NULL UNIQUE,
  code_hash text,
  password_version text NOT NULL,
  attempts_remaining integer NOT NULL DEFAULT 5 CHECK (attempts_remaining BETWEEN 0 AND 5),
  sent_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz
);
CREATE INDEX IF NOT EXISTS auth_login_challenges_expiry_idx ON public.auth_login_challenges(expires_at);
ALTER TABLE public.auth_login_challenges ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN
    REVOKE ALL ON public.auth_login_challenges FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN
    REVOKE ALL ON public.auth_login_challenges FROM authenticated;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname='devharbour_web') THEN
    GRANT SELECT,INSERT,UPDATE,DELETE ON public.auth_login_challenges TO devharbour_web;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='auth_login_challenges' AND policyname='runtime_login_code_access') THEN
      CREATE POLICY runtime_login_code_access ON public.auth_login_challenges FOR ALL TO devharbour_web USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;
