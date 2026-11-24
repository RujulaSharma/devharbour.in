CREATE SCHEMA study_together;
REVOKE ALL ON SCHEMA study_together FROM PUBLIC, anon, authenticated;
CREATE TABLE study_together.groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(name) BETWEEN 1 AND 60),
  owner_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  invite uuid UNIQUE NOT NULL DEFAULT gen_random_uuid()
);
CREATE TABLE study_together.members (
  user_id text PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  group_id uuid NOT NULL REFERENCES study_together.groups(id) ON DELETE CASCADE,
  muted boolean NOT NULL DEFAULT false,
  visible boolean NOT NULL DEFAULT true
);
CREATE INDEX study_members_group ON study_together.members(group_id);
CREATE TABLE study_together.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  duration integer NOT NULL CHECK (duration BETWEEN 60 AND 10800),
  subject text NOT NULL DEFAULT '' CHECK(length(subject)<=80),
  elapsed double precision NOT NULL DEFAULT 0,
  state text NOT NULL CHECK (state IN ('running','paused','finished','cancelled')),
  started timestamptz NOT NULL DEFAULT now(),
  touched timestamptz NOT NULL DEFAULT now(),
  reward_settled boolean NOT NULL DEFAULT false,
  ended timestamptz
);
CREATE UNIQUE INDEX study_open ON study_together.sessions(user_id) WHERE state IN ('running','paused');
CREATE INDEX study_recent ON study_together.sessions(touched) WHERE state='running';
CREATE INDEX study_history ON study_together.sessions(user_id,ended DESC);
CREATE TABLE study_together.starts (
  session_id uuid PRIMARY KEY REFERENCES study_together.sessions(id) ON DELETE CASCADE,
  group_id uuid NOT NULL REFERENCES study_together.groups(id) ON DELETE CASCADE,
  created timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX study_group_starts ON study_together.starts(group_id,created);
CREATE TABLE study_together.push_keys (singleton boolean PRIMARY KEY CHECK(singleton), keys jsonb NOT NULL);
CREATE TABLE study_together.subscriptions (
  endpoint text PRIMARY KEY,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subscription jsonb NOT NULL
);
