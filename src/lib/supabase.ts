import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ── Browser client (used in client components) ────────────
export const supabase = createClient(supabaseUrl, supabaseAnon)

// ── Server-side admin client ──────────────────────────────
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ── Types ─────────────────────────────────────────────────
export type UserRole = 'client' | 'consultant' | 'admin'

export interface Profile {
  id: string
  preferred_name: string
  age: number | null
  gender: string | null
  nationality: string | null
  whatsapp: string | null
  email: string | null
  language: 'ar' | 'en' | 'both'
  role: UserRole
  service_type: 'social' | 'addiction' | null
  assigned_consultant_id: string | null
  created_at: string
}

export interface Booking {
  id: string
  client_id: string
  consultant_id: string
  service_type: 'social' | 'addiction'
  method: 'video' | 'whatsapp'
  duration_minutes: number
  price_kwd: number
  scheduled_at: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  daily_room_url: string | null
  booking_ref: string
  created_at: string
}

export interface Survey {
  id: string
  client_id: string
  booking_id: string | null
  type: 'intake' | 'post_session'
  answers: Record<string, unknown>
  stress_score: number | null
  created_at: string
}

export interface SessionNote {
  id: string
  booking_id: string
  consultant_id: string
  client_id: string
  content: string
  is_ai_assisted: boolean
  created_at: string
}

export interface MoodEntry {
  id: string
  client_id: string
  mood: 1 | 2 | 3 | 4
  note: string | null
  recorded_at: string
}

export interface JournalEntry {
  id: string
  client_id: string
  content: string
  mood: string
  created_at: string
}

export interface Progress {
  id: string
  client_id: string
  dimension: string
  score: number
  updated_at: string
}
