-- Additive extension to an existing Dev Harbour database. No existing table is altered.
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "developer_profiles" (
    "user_id" TEXT NOT NULL,
    "headline" TEXT NOT NULL DEFAULT '',
    "college" TEXT NOT NULL DEFAULT '',
    "company" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "state" TEXT NOT NULL DEFAULT '',
    "country" TEXT NOT NULL DEFAULT '',
    "cover" TEXT NOT NULL DEFAULT 'lavender',
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "discovery" BOOLEAN NOT NULL DEFAULT false,
    "recruitment" BOOLEAN NOT NULL DEFAULT false,
    "details" JSONB NOT NULL DEFAULT '{}',
    "privacy" JSONB NOT NULL DEFAULT '{}',
    "links" JSONB NOT NULL DEFAULT '{}',
    "pins" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "developer_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "profile_entries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_skills" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "proficiency" TEXT NOT NULL DEFAULT 'Beginner',
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_activity" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_key" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reference" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_goals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "baseline" INTEGER NOT NULL DEFAULT 0,
    "deadline" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_media" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "object_path" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_connections" (
    "id" TEXT NOT NULL,
    "from_id" TEXT NOT NULL,
    "to_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "developer_profiles_visibility_discovery_idx" ON "developer_profiles"("visibility", "discovery");

-- CreateIndex
CREATE INDEX "profile_entries_user_id_kind_created_at_idx" ON "profile_entries"("user_id", "kind", "created_at");

-- CreateIndex
CREATE INDEX "profile_skills_user_id_category_idx" ON "profile_skills"("user_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "profile_skills_user_id_name_key" ON "profile_skills"("user_id", "name");

-- CreateIndex
CREATE INDEX "profile_activity_user_id_occurred_at_id_idx" ON "profile_activity"("user_id", "occurred_at", "id");

-- CreateIndex
CREATE UNIQUE INDEX "profile_activity_user_id_event_key_key" ON "profile_activity"("user_id", "event_key");

-- CreateIndex
CREATE INDEX "profile_goals_user_id_created_at_idx" ON "profile_goals"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "profile_media_object_path_key" ON "profile_media"("object_path");

-- CreateIndex
CREATE INDEX "profile_media_user_id_kind_idx" ON "profile_media"("user_id", "kind");

-- CreateIndex
CREATE INDEX "profile_connections_to_id_kind_status_idx" ON "profile_connections"("to_id", "kind", "status");

-- CreateIndex
CREATE UNIQUE INDEX "profile_connections_from_id_to_id_kind_key" ON "profile_connections"("from_id", "to_id", "kind");

-- CreateIndex
CREATE INDEX "profile_notifications_user_id_read_created_at_idx" ON "profile_notifications"("user_id", "read", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "profile_notifications_user_id_event_key_key" ON "profile_notifications"("user_id", "event_key");

-- AddForeignKey
ALTER TABLE "developer_profiles" ADD CONSTRAINT "developer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_entries" ADD CONSTRAINT "profile_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_skills" ADD CONSTRAINT "profile_skills_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_activity" ADD CONSTRAINT "profile_activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_goals" ADD CONSTRAINT "profile_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_media" ADD CONSTRAINT "profile_media_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_connections" ADD CONSTRAINT "profile_connections_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_connections" ADD CONSTRAINT "profile_connections_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_notifications" ADD CONSTRAINT "profile_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Match the existing custom-session architecture: no direct browser access.
ALTER TABLE public.developer_profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.developer_profiles FROM anon, authenticated;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'devharbour_runtime') THEN GRANT SELECT,INSERT,UPDATE,DELETE ON public.developer_profiles TO devharbour_runtime; CREATE POLICY runtime_profile_access ON public.developer_profiles FOR ALL TO devharbour_runtime USING (true) WITH CHECK (true); END IF; END $$;
ALTER TABLE public.profile_entries ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.profile_entries FROM anon, authenticated;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'devharbour_runtime') THEN GRANT SELECT,INSERT,UPDATE,DELETE ON public.profile_entries TO devharbour_runtime; CREATE POLICY runtime_profile_access ON public.profile_entries FOR ALL TO devharbour_runtime USING (true) WITH CHECK (true); END IF; END $$;
ALTER TABLE public.profile_skills ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.profile_skills FROM anon, authenticated;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'devharbour_runtime') THEN GRANT SELECT,INSERT,UPDATE,DELETE ON public.profile_skills TO devharbour_runtime; CREATE POLICY runtime_profile_access ON public.profile_skills FOR ALL TO devharbour_runtime USING (true) WITH CHECK (true); END IF; END $$;
ALTER TABLE public.profile_activity ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.profile_activity FROM anon, authenticated;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'devharbour_runtime') THEN GRANT SELECT,INSERT,UPDATE,DELETE ON public.profile_activity TO devharbour_runtime; CREATE POLICY runtime_profile_access ON public.profile_activity FOR ALL TO devharbour_runtime USING (true) WITH CHECK (true); END IF; END $$;
ALTER TABLE public.profile_goals ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.profile_goals FROM anon, authenticated;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'devharbour_runtime') THEN GRANT SELECT,INSERT,UPDATE,DELETE ON public.profile_goals TO devharbour_runtime; CREATE POLICY runtime_profile_access ON public.profile_goals FOR ALL TO devharbour_runtime USING (true) WITH CHECK (true); END IF; END $$;
ALTER TABLE public.profile_media ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.profile_media FROM anon, authenticated;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'devharbour_runtime') THEN GRANT SELECT,INSERT,UPDATE,DELETE ON public.profile_media TO devharbour_runtime; CREATE POLICY runtime_profile_access ON public.profile_media FOR ALL TO devharbour_runtime USING (true) WITH CHECK (true); END IF; END $$;
ALTER TABLE public.profile_connections ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.profile_connections FROM anon, authenticated;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'devharbour_runtime') THEN GRANT SELECT,INSERT,UPDATE,DELETE ON public.profile_connections TO devharbour_runtime; CREATE POLICY runtime_profile_access ON public.profile_connections FOR ALL TO devharbour_runtime USING (true) WITH CHECK (true); END IF; END $$;
ALTER TABLE public.profile_notifications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.profile_notifications FROM anon, authenticated;
DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'devharbour_runtime') THEN GRANT SELECT,INSERT,UPDATE,DELETE ON public.profile_notifications TO devharbour_runtime; CREATE POLICY runtime_profile_access ON public.profile_notifications FOR ALL TO devharbour_runtime USING (true) WITH CHECK (true); END IF; END $$;
