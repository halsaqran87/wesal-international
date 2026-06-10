import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const sb = admin()

    // Load all clients + bookings for consultant dashboard
    if (body.userId) {
      const { data: clients } = await sb
        .from('profiles')
        .select('*')
        .eq('role', 'client')
        .order('created_at', { ascending: false })

      const { data: bookings } = await sb
        .from('bookings')
        .select('*, profiles!bookings_client_id_fkey(preferred_name)')
        .order('scheduled_at', { ascending: false })
        .limit(50)

      return NextResponse.json({ clients: clients || [], bookings: bookings || [] })
    }

    // Load specific client data
    if (body.clientId) {
      const { data: clientBookings } = await sb
        .from('bookings')
        .select('*')
        .eq('client_id', body.clientId)
        .order('scheduled_at', { ascending: false })

      const { data: surveys } = await sb
        .from('surveys')
        .select('*')
        .eq('client_id', body.clientId)
        .eq('type', 'intake')
        .order('created_at', { ascending: false })
        .limit(1)

      const { data: notes } = await sb
        .from('session_notes')
        .select('*')
        .eq('client_id', body.clientId)
        .order('created_at', { ascending: false })

      return NextResponse.json({
        clientBookings: clientBookings || [],
        survey: surveys?.[0] || null,
        notes: notes || [],
      })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
