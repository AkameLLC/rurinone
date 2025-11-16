-- CloudFlare D1 Database Schema for Rurinone
-- Execute these statements in order

-- 承認済みメールアドレステーブル
CREATE TABLE IF NOT EXISTS approved_emails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  approved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  approved_by TEXT,
  notes TEXT
);

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- GoogleのUser ID
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'member' CHECK(role IN ('member', 'admin')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  is_active BOOLEAN DEFAULT true
);

-- 配信者プロフィールテーブル
CREATE TABLE IF NOT EXISTS streamer_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id),
  display_name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  twitter_handle TEXT,
  youtube_channel TEXT,
  twitch_channel TEXT,
  join_phase TEXT DEFAULT 'phase01' CHECK(join_phase IN ('phase01', 'phase02', 'phase03')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 配信状態テーブル
CREATE TABLE IF NOT EXISTS stream_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  streamer_id INTEGER NOT NULL REFERENCES streamer_profiles(id),
  is_live BOOLEAN DEFAULT false,
  platform TEXT,
  title TEXT,
  viewer_count INTEGER,
  stream_url TEXT,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ニューステーブル
CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  published BOOLEAN DEFAULT false,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_approved_emails_email ON approved_emails(email);
CREATE INDEX IF NOT EXISTS idx_streamer_profiles_user_id ON streamer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_stream_status_streamer_id ON stream_status(streamer_id);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(published);
CREATE INDEX IF NOT EXISTS idx_news_created_by ON news(created_by);