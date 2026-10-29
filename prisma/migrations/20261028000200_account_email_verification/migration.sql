-- Reviewed additive migration. Applying requires the owner's explicit approval.
-- No participant/certificate/user records are changed or reissued.
CREATE TABLE public.email_verifications (
  user_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE NO ACTION,
  email TEXT NOT NULL,
  challenge_id TEXT NOT NULL UNIQUE,
  code_hash TEXT,
  expires_at TEXT,
  sent_at TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 5),
  state TEXT NOT NULL CHECK (state IN ('pending','sent','failed','locked','verified')),
  verified_at TEXT,
  hour_started_at TEXT NOT NULL,
  send_count INTEGER NOT NULL CHECK (send_count BETWEEN 1 AND 5),
  CONSTRAINT verification_proof CHECK (
    (state = 'verified' AND verified_at IS NOT NULL AND code_hash IS NULL)
    OR (state <> 'verified' AND verified_at IS NULL)
  )
);
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.email_verifications FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.email_verifications TO devharbour_runtime;
CREATE POLICY devharbour_runtime_access ON public.email_verifications
  FOR ALL TO devharbour_runtime USING (true) WITH CHECK (true);
