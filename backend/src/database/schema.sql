-- Code Battle Arena Database Schema for PostgreSQL
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    rating INTEGER NOT NULL DEFAULT 400,
    k_win INTEGER NOT NULL DEFAULT 40,
    k_lose INTEGER NOT NULL DEFAULT 30,
    win_streak INTEGER NOT NULL DEFAULT 0,
    loss_streak INTEGER NOT NULL DEFAULT 0,
    daily_streak INTEGER DEFAULT 0,
    last_activity_date DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- OAuth accounts table
CREATE TABLE IF NOT EXISTS oauth_accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (provider, provider_user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Submissions table (for tracking user code submissions)
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    exercise_id VARCHAR(100) NOT NULL,
    code TEXT NOT NULL,
    language VARCHAR(50) DEFAULT 'cpp',
    status VARCHAR(50) NOT NULL, -- 'pending', 'passed', 'failed', 'error'
    compilation_success BOOLEAN DEFAULT FALSE,
    compilation_error TEXT,
    test_results JSONB,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Battles table (for tracking player vs player battles)
CREATE TABLE IF NOT EXISTS battles (
    id SERIAL PRIMARY KEY,
    player1_id INTEGER NOT NULL,
    player2_id INTEGER NOT NULL,
    exercise_id VARCHAR(100) NOT NULL,
        -- status: 'pending' (waiting for accept), 'active', 'completed', 'cancelled'
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
    winner_id INTEGER,
    player1_submission_id INTEGER,
    player2_submission_id INTEGER,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
        player1_accepted BOOLEAN NOT NULL DEFAULT FALSE,
        player2_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (player2_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (player1_submission_id) REFERENCES submissions(id) ON DELETE SET NULL,
    FOREIGN KEY (player2_submission_id) REFERENCES submissions(id) ON DELETE SET NULL
);

-- Match queue table (for tracking players waiting for matches)
CREATE TABLE IF NOT EXISTS match_queue (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    queued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'waiting', -- 'waiting', 'matched', 'cancelled'
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tickets table (for user support)
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    admin_response TEXT,
    status VARCHAR(50) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_oauth_provider ON oauth_accounts(provider, provider_user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_exercise ON submissions(exercise_id);
CREATE INDEX IF NOT EXISTS idx_battles_status ON battles(status);
CREATE INDEX IF NOT EXISTS idx_battles_players ON battles(player1_id, player2_id);
CREATE INDEX IF NOT EXISTS idx_battles_active ON battles(player1_id, player2_id, status) WHERE status IN ('pending', 'waiting', 'active');
CREATE INDEX IF NOT EXISTS idx_match_queue_user ON match_queue(user_id, status);
CREATE INDEX IF NOT EXISTS idx_match_queue_status ON match_queue(status, queued_at);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);