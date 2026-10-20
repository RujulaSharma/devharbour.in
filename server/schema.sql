-- ====================================================================
-- DEV HARBOUR — FULL-STACK POSTGRESQL / SUPABASE DATABASE SCHEMA
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & PROFILES
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(64) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'moderator', 'admin')),
    avatar_url TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    github_url TEXT DEFAULT '',
    portfolio_url TEXT DEFAULT '',
    streak_days INT DEFAULT 0,
    last_active_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. SESSIONS
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(128) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);

-- 3. USER SETTINGS
CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'mercury')),
    email_notifications BOOLEAN DEFAULT TRUE,
    profile_public BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. COURSES (Catalog of official and internal tracks)
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    level VARCHAR(30) DEFAULT 'Beginner',
    external_url TEXT NOT NULL,
    duration_hours INT DEFAULT 10,
    rating NUMERIC(3, 1) DEFAULT 4.8,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. READING LESSONS (Internal learning mode content)
CREATE TABLE IF NOT EXISTS lessons (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    reading_time_mins INT DEFAULT 10,
    order_index INT DEFAULT 1,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id, order_index);

-- 6. LESSON PROGRESS
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id VARCHAR(50) NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
    reading_seconds INT DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_user_lesson UNIQUE (user_id, lesson_id)
);

-- 7. CODING CHALLENGES
CREATE TABLE IF NOT EXISTS challenges (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    category VARCHAR(50) NOT NULL,
    time_estimate VARCHAR(30) DEFAULT '20 min',
    description TEXT NOT NULL,
    examples_json JSONB NOT NULL DEFAULT '[]',
    starter_code_js TEXT NOT NULL,
    solution_template TEXT DEFAULT '',
    public_tests_json JSONB NOT NULL DEFAULT '[]',
    hidden_tests_json JSONB NOT NULL DEFAULT '[]',
    xp_reward INT DEFAULT 25,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. CODE SUBMISSIONS
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id VARCHAR(50) NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language VARCHAR(30) DEFAULT 'javascript',
    status VARCHAR(20) NOT NULL CHECK (status IN ('passed', 'failed', 'error', 'timeout')),
    execution_time_ms INT DEFAULT 0,
    passed_tests INT DEFAULT 0,
    total_tests INT DEFAULT 0,
    error_message TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_submissions_user_challenge ON submissions(user_id, challenge_id);

-- 9. AUDITABLE XP LEDGER
CREATE TABLE IF NOT EXISTS xp_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INT NOT NULL CHECK (amount > 0),
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('lesson_complete', 'challenge_pass', 'project_submit', 'achievement_unlock', 'streak_bonus')),
    reference_id VARCHAR(100) NOT NULL,
    note TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_xp_event UNIQUE (user_id, source_type, reference_id)
);

CREATE INDEX IF NOT EXISTS idx_xp_ledger_user ON xp_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_ledger_date ON xp_ledger(created_at);

-- 10. ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(50) PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    badge_icon VARCHAR(50) DEFAULT 'trophy',
    xp_bonus INT DEFAULT 50,
    condition_type VARCHAR(50) NOT NULL,
    condition_value INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(50) NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_achievement UNIQUE (user_id, achievement_id)
);

-- 11. FEATURED PROJECTS
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    tech_stack_json JSONB NOT NULL DEFAULT '[]',
    repo_url TEXT NOT NULL,
    demo_url TEXT DEFAULT '',
    votes_count INT DEFAULT 0,
    bookmarks_count INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- 12. PROJECT VOTES & BOOKMARKS
CREATE TABLE IF NOT EXISTS project_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_vote UNIQUE (user_id, project_id)
);

CREATE TABLE IF NOT EXISTS project_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_bookmark UNIQUE (user_id, project_id)
);

-- 13. ROW LEVEL SECURITY POLICIES (FOR SUPABASE)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_bookmarks ENABLE ROW LEVEL SECURITY;

-- Public can view approved projects and courses
CREATE POLICY "Public can view approved projects" ON projects FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can create their own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- Public can view basic user profiles
CREATE POLICY "Public view of profiles" ON users FOR SELECT USING (true);
