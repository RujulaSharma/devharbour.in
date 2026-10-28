-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "badge_icon" TEXT DEFAULT 'trophy',
    "xp_bonus" INTEGER DEFAULT 50,
    "condition_type" TEXT NOT NULL,
    "condition_value" INTEGER DEFAULT 1,
    "created_at" TEXT DEFAULT to_char(timezone('UTC', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificate_otps" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expires_at" INTEGER NOT NULL,
    "verified" INTEGER DEFAULT 0,

    CONSTRAINT "certificate_otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenges" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "time_estimate" TEXT DEFAULT '20 min',
    "description" TEXT NOT NULL,
    "examples_json" TEXT NOT NULL DEFAULT '[]',
    "starter_code_js" TEXT NOT NULL,
    "solution_template" TEXT DEFAULT '',
    "public_tests_json" TEXT NOT NULL DEFAULT '[]',
    "hidden_tests_json" TEXT NOT NULL DEFAULT '[]',
    "xp_reward" INTEGER DEFAULT 25,
    "created_at" TEXT DEFAULT to_char(timezone('UTC', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "level" TEXT DEFAULT 'Beginner',
    "external_url" TEXT NOT NULL,
    "duration_hours" INTEGER DEFAULT 10,
    "rating" DOUBLE PRECISION DEFAULT 4.8,
    "is_featured" INTEGER DEFAULT 0,
    "created_at" TEXT DEFAULT to_char(timezone('UTC', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_participants" (
    "id" TEXT NOT NULL,
    "event_slug" TEXT NOT NULL,
    "team_id" TEXT,
    "team_name" TEXT,
    "candidate_role" TEXT,
    "candidate_name" TEXT NOT NULL,
    "candidate_email" TEXT NOT NULL,
    "candidate_mobile" TEXT,
    "candidate_location" TEXT,
    "candidate_organisation" TEXT,
    "is_eligible" INTEGER DEFAULT 1,
    "created_at" TEXT DEFAULT to_char(timezone('UTC', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),

    CONSTRAINT "event_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issued_certificates" (
    "credential_id" TEXT NOT NULL,
    "event_slug" TEXT NOT NULL,
    "participant_id" TEXT,
    "recipient_name" TEXT NOT NULL,
    "recipient_email" TEXT NOT NULL,
    "recipient_organisation" TEXT,
    "certificate_type" TEXT NOT NULL DEFAULT 'Participation',
    "issue_date" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Valid',
    "created_at" TEXT DEFAULT to_char(timezone('UTC', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),

    CONSTRAINT "issued_certificates_pkey" PRIMARY KEY ("credential_id")
);

-- CreateTable
CREATE TABLE "lesson_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "status" TEXT DEFAULT 'in_progress',
    "reading_seconds" INTEGER DEFAULT 0,
    "completed_at" TEXT,

    CONSTRAINT "lesson_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "reading_time_mins" INTEGER DEFAULT 10,
    "order_index" INTEGER DEFAULT 1,
    "content" TEXT NOT NULL,
    "created_at" TEXT DEFAULT to_char(timezone('UTC', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_bookmarks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "created_at" TEXT DEFAULT to_char(timezone('UTC', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),

    CONSTRAINT "project_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_votes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "created_at" TEXT DEFAULT to_char(timezone('UTC', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),

    CONSTRAINT "project_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tech_stack_json" TEXT NOT NULL DEFAULT '[]',
    "repo_url" TEXT NOT NULL,
    "demo_url" TEXT DEFAULT '',
    "votes_count" INTEGER DEFAULT 0,
    "bookmarks_count" INTEGER DEFAULT 0,
    "status" TEXT DEFAULT 'approved',
    "created_at" TEXT DEFAULT to_char(timezone('UTC', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),
    "updated_at" TEXT DEFAULT to_char(timezone('UTC', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TEXT NOT NULL,
    "created_at" TEXT DEFAULT to_char(timezone('UTC', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "language" TEXT DEFAULT 'javascript',
    "status" TEXT NOT NULL,
    "execution_time_ms" INTEGER DEFAULT 0,
    "passed_tests" INTEGER DEFAULT 0,
    "total_tests" INTEGER DEFAULT 0,
    "error_message" TEXT DEFAULT '',
    "created_at" TEXT DEFAULT to_char(timezone('UTC', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "achievement_id" TEXT NOT NULL,
    "unlocked_at" TEXT DEFAULT to_char(timezone('UTC', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "user_id" TEXT NOT NULL,
    "theme" TEXT DEFAULT 'light',
    "email_notifications" INTEGER DEFAULT 1,
    "profile_public" INTEGER DEFAULT 1,
    "updated_at" TEXT DEFAULT to_char(timezone('UTC', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'student',
    "avatar_url" TEXT DEFAULT '',
    "bio" TEXT DEFAULT '',
    "github_url" TEXT DEFAULT '',
    "portfolio_url" TEXT DEFAULT '',
    "streak_days" INTEGER DEFAULT 0,
    "last_active_date" TEXT,
    "created_at" TEXT DEFAULT to_char(timezone('UTC', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),
    "updated_at" TEXT DEFAULT to_char(timezone('UTC', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),
    "location" TEXT DEFAULT '',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_assignments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT DEFAULT '',
    "due_date" TEXT,
    "priority" TEXT DEFAULT 'medium',
    "status" TEXT DEFAULT 'pending',
    "link" TEXT DEFAULT '',
    "created_at" TEXT DEFAULT to_char(timezone('UTC', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),
    "updated_at" TEXT DEFAULT to_char(timezone('UTC', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),

    CONSTRAINT "workspace_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_bookmarks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "item_id" TEXT,
    "item_type" TEXT DEFAULT 'resource',
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT DEFAULT 'general',
    "created_at" TEXT DEFAULT to_char(timezone('UTC', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),

    CONSTRAINT "workspace_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_notes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT DEFAULT '',
    "subject" TEXT DEFAULT 'General',
    "tags" TEXT DEFAULT '',
    "link" TEXT DEFAULT '',
    "is_pinned" INTEGER DEFAULT 0,
    "created_at" TEXT DEFAULT to_char(timezone('UTC', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),
    "updated_at" TEXT DEFAULT to_char(timezone('UTC', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),

    CONSTRAINT "workspace_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_snippets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "language" TEXT DEFAULT 'javascript',
    "code" TEXT NOT NULL,
    "input" TEXT DEFAULT '',
    "created_at" TEXT DEFAULT to_char(timezone('UTC', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),
    "updated_at" TEXT DEFAULT to_char(timezone('UTC', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),

    CONSTRAINT "workspace_snippets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_tasks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject" TEXT DEFAULT 'General',
    "priority" TEXT DEFAULT 'medium',
    "due_date" TEXT,
    "status" TEXT DEFAULT 'pending',
    "created_at" TEXT DEFAULT to_char(timezone('UTC', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),
    "updated_at" TEXT DEFAULT to_char(timezone('UTC', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),

    CONSTRAINT "workspace_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_ledger" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "source_type" TEXT NOT NULL,
    "reference_id" TEXT NOT NULL,
    "note" TEXT DEFAULT '',
    "created_at" TEXT DEFAULT to_char(timezone('UTC', CURRENT_TIMESTAMP), 'YYYY-MM-DD HH24:MI:SS'),

    CONSTRAINT "xp_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "achievements_key_key" ON "achievements"("key");

-- CreateIndex
CREATE UNIQUE INDEX "challenges_slug_key" ON "challenges"("slug");

-- CreateIndex
CREATE INDEX "idx_participants_name" ON "event_participants"("candidate_name");

-- CreateIndex
CREATE INDEX "idx_participants_email" ON "event_participants"("candidate_email", "event_slug");

-- CreateIndex
CREATE INDEX "idx_ep_email" ON "event_participants"("candidate_email", "event_slug");

-- CreateIndex
CREATE INDEX "idx_certs_email" ON "issued_certificates"("recipient_email", "event_slug");

-- CreateIndex
CREATE INDEX "idx_certs_cred" ON "issued_certificates"("credential_id");

-- CreateIndex
CREATE INDEX "idx_ic_cred" ON "issued_certificates"("credential_id");

-- CreateIndex
CREATE UNIQUE INDEX "issued_certificates_event_slug_recipient_email_key" ON "issued_certificates"("event_slug", "recipient_email");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_progress_user_id_lesson_id_key" ON "lesson_progress"("user_id", "lesson_id");

-- CreateIndex
CREATE INDEX "idx_lessons_course" ON "lessons"("course_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "project_bookmarks_user_id_project_id_key" ON "project_bookmarks"("user_id", "project_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_votes_user_id_project_id_key" ON "project_votes"("user_id", "project_id");

-- CreateIndex
CREATE INDEX "idx_projects_status" ON "projects"("status");

-- CreateIndex
CREATE INDEX "idx_projects_category" ON "projects"("category");

-- CreateIndex
CREATE INDEX "idx_sessions_token" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "idx_submissions_user_challenge" ON "submissions"("user_id", "challenge_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_user_id_achievement_id_key" ON "user_achievements"("user_id", "achievement_id");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_username" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_ws_assignments_user" ON "workspace_assignments"("user_id", "status");

-- CreateIndex
CREATE INDEX "idx_ws_bookmarks_user" ON "workspace_bookmarks"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_bookmarks_user_id_url_key" ON "workspace_bookmarks"("user_id", "url");

-- CreateIndex
CREATE INDEX "idx_ws_notes_user" ON "workspace_notes"("user_id", "is_pinned");

-- CreateIndex
CREATE INDEX "idx_ws_snippets_user" ON "workspace_snippets"("user_id");

-- CreateIndex
CREATE INDEX "idx_ws_tasks_user" ON "workspace_tasks"("user_id", "status");

-- CreateIndex
CREATE INDEX "idx_xp_ledger_created" ON "xp_ledger"("created_at");

-- CreateIndex
CREATE INDEX "idx_xp_ledger_user" ON "xp_ledger"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "xp_ledger_user_id_source_type_reference_id_key" ON "xp_ledger"("user_id", "source_type", "reference_id");

-- AddForeignKey
ALTER TABLE "issued_certificates" ADD CONSTRAINT "issued_certificates_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "event_participants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_bookmarks" ADD CONSTRAINT "project_bookmarks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_bookmarks" ADD CONSTRAINT "project_bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_votes" ADD CONSTRAINT "project_votes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "project_votes" ADD CONSTRAINT "project_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workspace_assignments" ADD CONSTRAINT "workspace_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workspace_bookmarks" ADD CONSTRAINT "workspace_bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workspace_notes" ADD CONSTRAINT "workspace_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workspace_snippets" ADD CONSTRAINT "workspace_snippets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workspace_tasks" ADD CONSTRAINT "workspace_tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "xp_ledger" ADD CONSTRAINT "xp_ledger_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- Preserve existing application invariants not represented by Prisma.
ALTER TABLE "achievements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "certificate_otps" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_check_1" CHECK (difficulty IN ('Easy', 'Medium', 'Hard'));
ALTER TABLE "challenges" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "courses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "event_participants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "issued_certificates" ADD CONSTRAINT "issued_certificates_check_1" CHECK (status IN ('Valid', 'Revoked'));
ALTER TABLE "issued_certificates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_check_1" CHECK (status IN ('in_progress', 'completed'));
ALTER TABLE "lesson_progress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lessons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "project_bookmarks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "project_votes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "projects" ADD CONSTRAINT "projects_check_1" CHECK (status IN ('approved', 'pending', 'rejected'));
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_check_1" CHECK (status IN ('passed', 'failed', 'error', 'timeout'));
ALTER TABLE "submissions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_achievements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_check_1" CHECK (theme IN ('light', 'dark', 'mercury'));
ALTER TABLE "user_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ADD CONSTRAINT "users_check_1" CHECK (role IN ('student', 'moderator', 'admin'));
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workspace_assignments" ADD CONSTRAINT "workspace_assignments_check_1" CHECK (priority IN ('low', 'medium', 'high'));
ALTER TABLE "workspace_assignments" ADD CONSTRAINT "workspace_assignments_check_2" CHECK (status IN ('pending', 'in_progress', 'completed'));
ALTER TABLE "workspace_assignments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workspace_bookmarks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workspace_notes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workspace_snippets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workspace_tasks" ADD CONSTRAINT "workspace_tasks_check_1" CHECK (priority IN ('low', 'medium', 'high'));
ALTER TABLE "workspace_tasks" ADD CONSTRAINT "workspace_tasks_check_2" CHECK (status IN ('pending', 'completed'));
ALTER TABLE "workspace_tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "xp_ledger" ADD CONSTRAINT "xp_ledger_check_1" CHECK (amount > 0);
ALTER TABLE "xp_ledger" ADD CONSTRAINT "xp_ledger_check_2" CHECK (source_type IN ('lesson_complete', 'challenge_pass', 'project_submit', 'achievement_unlock', 'streak_bonus'));
ALTER TABLE "xp_ledger" ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX users_email_ci_key ON users (lower(email));
CREATE UNIQUE INDEX users_username_ci_key ON users (lower(username));
CREATE UNIQUE INDEX issued_certificates_event_email_ci_key ON issued_certificates (event_slug, lower(recipient_email));
CREATE INDEX event_participants_email_ci_idx ON event_participants (lower(candidate_email), event_slug);
