BEGIN;

SET LOCAL lock_timeout = '5s';

-- An existing proof of email ownership survives a new verification or reset code.
ALTER TABLE public.email_verifications
  DROP CONSTRAINT IF EXISTS verification_proof,
  ADD CONSTRAINT verification_proof CHECK (
    state <> 'verified' OR (verified_at IS NOT NULL AND code_hash IS NULL)
  );

COMMIT;
