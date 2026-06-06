-- ═══════════════════════════════════════════════════════════
--  WESAL INTERNATIONAL — Supabase Database Schema
--  Run this in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PROFILES ─────────────────────────────────────────────
CREATE TABLE profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_name        TEXT NOT NULL,
  age                   INT,
  gender                TEXT,
  nationality           TEXT,
  whatsapp              TEXT,
  email                 TEXT,
  language              TEXT DEFAULT 'ar' CHECK (language IN ('ar','en','both')),
  role                  TEXT DEFAULT 'client' CHECK (role IN ('client','consultant','admin')),
  service_type          TEXT CHECK (service_type IN ('social','addiction')),
  assigned_consultant_id UUID REFERENCES profiles(id),
  emergency_contact     TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ── BOOKINGS ──────────────────────────────────────────────
CREATE TABLE bookings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  consultant_id     UUID NOT NULL REFERENCES profiles(id),
  service_type      TEXT NOT NULL CHECK (service_type IN ('social','addiction')),
  method            TEXT NOT NULL CHECK (method IN ('video','whatsapp')),
  duration_minutes  INT NOT NULL CHECK (duration_minutes IN (30,60,90)),
  price_kwd         DECIMAL(8,2) NOT NULL,
  scheduled_at      TIMESTAMPTZ NOT NULL,
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled')),
  daily_room_url    TEXT,
  daily_room_name   TEXT,
  booking_ref       TEXT UNIQUE DEFAULT 'WSL-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(FLOOR(RANDOM()*9000+1000)::TEXT,4,'0'),
  payment_ref       TEXT,
  payment_status    TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','refunded')),
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── INTAKE SURVEYS ────────────────────────────────────────
CREATE TABLE surveys (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id    UUID REFERENCES bookings(id),
  type          TEXT NOT NULL CHECK (type IN ('intake','post_session')),
  answers       JSONB NOT NULL DEFAULT '{}',
  stress_score  INT CHECK (stress_score BETWEEN 1 AND 10),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── SESSION NOTES (Consultant only) ──────────────────────
CREATE TABLE session_notes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id       UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  consultant_id    UUID NOT NULL REFERENCES profiles(id),
  client_id        UUID NOT NULL REFERENCES profiles(id),
  content          TEXT NOT NULL,
  is_ai_assisted   BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── MOOD ENTRIES ──────────────────────────────────────────
CREATE TABLE mood_entries (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mood         INT NOT NULL CHECK (mood BETWEEN 1 AND 4),
  note         TEXT,
  recorded_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── JOURNAL ENTRIES ───────────────────────────────────────
CREATE TABLE journal_entries (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  mood        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── PROGRESS TRACKING ─────────────────────────────────────
CREATE TABLE progress (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dimension   TEXT NOT NULL,
  score       INT NOT NULL CHECK (score BETWEEN 0 AND 100),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, dimension)
);

-- ── NOTIFICATIONS ─────────────────────────────────────────
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  title_ar   TEXT,
  body       TEXT NOT NULL,
  body_ar    TEXT,
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── MESSAGE LOGS ──────────────────────────────────────────
CREATE TABLE message_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id   UUID REFERENCES profiles(id),
  channel     TEXT NOT NULL CHECK (channel IN ('whatsapp','email','sms')),
  template    TEXT NOT NULL,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending','sent','delivered','failed')),
  sent_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════

ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys        ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_notes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications  ENABLE ROW LEVEL SECURITY;

-- Profiles: users see only their own, consultants see their clients
CREATE POLICY "profiles_self" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "consultant_sees_clients" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'consultant'
    )
  );

-- Bookings: client sees own, consultant sees theirs
CREATE POLICY "bookings_client" ON bookings
  FOR ALL USING (auth.uid() = client_id);

CREATE POLICY "bookings_consultant" ON bookings
  FOR ALL USING (auth.uid() = consultant_id);

-- Surveys: client sees own, consultant sees their clients'
CREATE POLICY "surveys_client" ON surveys
  FOR ALL USING (auth.uid() = client_id);

CREATE POLICY "surveys_consultant" ON surveys
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = surveys.booking_id AND b.consultant_id = auth.uid()
    )
  );

-- Session notes: consultant only
CREATE POLICY "notes_consultant" ON session_notes
  FOR ALL USING (auth.uid() = consultant_id);

-- Journal: client only (consultant reads via service role)
CREATE POLICY "journal_client" ON journal_entries
  FOR ALL USING (auth.uid() = client_id);

-- Mood: client only
CREATE POLICY "mood_client" ON mood_entries
  FOR ALL USING (auth.uid() = client_id);

-- Progress: client sees own, consultant sees clients'
CREATE POLICY "progress_client" ON progress
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "progress_consultant" ON progress
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('consultant','admin')
    )
  );

-- Notifications: own only
CREATE POLICY "notif_own" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
--  SEED: Default consultant (Khalaf)
-- ═══════════════════════════════════════════════════════════
-- Run AFTER creating Khalaf's auth account in Supabase Dashboard:
-- INSERT INTO profiles (id, preferred_name, role, language, email, whatsapp)
-- VALUES ('<KHALAF_AUTH_UUID>', 'Khalaf Jalal Alenizi', 'consultant', 'both', 'khalaf-j@hotmail.com', '+96593331533');

-- ═══════════════════════════════════════════════════════════
--  SEED: Default progress dimensions for new clients
-- ═══════════════════════════════════════════════════════════
-- Trigger to auto-create progress rows on profile insert
CREATE OR REPLACE FUNCTION init_client_progress()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'client' THEN
    INSERT INTO progress (client_id, dimension, score) VALUES
      (NEW.id, 'stress_management', 0),
      (NEW.id, 'communication', 0),
      (NEW.id, 'emotional_regulation', 0),
      (NEW.id, 'self_awareness', 0),
      (NEW.id, 'social_relationships', 0);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION init_client_progress();
