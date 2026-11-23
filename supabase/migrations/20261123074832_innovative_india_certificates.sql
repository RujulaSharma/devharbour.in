ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS google_verified_email text;
REVOKE ALL ON public.sessions FROM anon, authenticated;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS certificate_name text;
ALTER TABLE public.event_participants ADD COLUMN IF NOT EXISTS certificate_credential_id text;
ALTER TABLE public.issued_certificates ADD COLUMN IF NOT EXISTS owner_user_id text;

CREATE UNIQUE INDEX IF NOT EXISTS innovative_india_participant_email
    ON public.event_participants (lower(btrim(candidate_email)))
    WHERE event_slug = 'innovative-india-2026';
CREATE UNIQUE INDEX IF NOT EXISTS innovative_india_reserved_id
    ON public.event_participants (certificate_credential_id)
    WHERE event_slug = 'innovative-india-2026';
CREATE UNIQUE INDEX IF NOT EXISTS innovative_india_certificate_email
    ON public.issued_certificates (lower(btrim(recipient_email)))
    WHERE event_slug = 'innovative-india-2026';
CREATE UNIQUE INDEX IF NOT EXISTS innovative_india_certificate_owner
    ON public.issued_certificates (owner_user_id)
    WHERE event_slug = 'innovative-india-2026' AND owner_user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS innovative_india_certificate_participant
    ON public.issued_certificates (participant_id)
    WHERE event_slug = 'innovative-india-2026' AND owner_user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.preserve_certificate_name() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
    IF OLD.certificate_name IS NOT NULL AND NEW.certificate_name IS DISTINCT FROM OLD.certificate_name THEN
        RAISE EXCEPTION 'The original certificate name is immutable';
    END IF;
    RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS preserve_certificate_name ON public.users;
CREATE TRIGGER preserve_certificate_name BEFORE UPDATE OF certificate_name ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.preserve_certificate_name();

ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issued_certificates ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.event_participants, public.issued_certificates FROM anon, authenticated;
