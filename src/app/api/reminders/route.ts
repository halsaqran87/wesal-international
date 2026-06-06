import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { send24hrReminder, sendSessionLink, sendPostSessionSurvey } from '@/lib/email'
import { sendWA24hrReminder, sendWASessionLink, sendWAPostSessionSurvey } from '@/lib/whatsapp'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://wesal-international.com'

export async function GET(req: NextRequest) {
  // Simple auth check — call with ?secret=YOUR_CRON_SECRET from Vercel cron
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const in24h  = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const in15m  = new Date(now.getTime() + 15 * 60 * 1000)
  const ago1h  = new Date(now.getTime() - 60 * 60 * 1000)

  let sent = 0

  // ── 24hr reminders ──────────────────────────────────────
  const { data: upcoming24h } = await supabaseAdmin
    .from('bookings')
    .select('*, profiles!bookings_client_id_fkey(preferred_name,email,whatsapp,language)')
    .eq('status', 'confirmed')
    .gte('scheduled_at', new Date(in24h.getTime() - 5*60*1000).toISOString())
    .lte('scheduled_at', new Date(in24h.getTime() + 5*60*1000).toISOString())

  for (const booking of upcoming24h || []) {
    const client = booking.profiles
    if (!client) continue
    const lang = client.language === 'en' ? 'en' : 'ar'
    const date = new Date(booking.scheduled_at).toLocaleDateString(lang === 'ar' ? 'ar-KW' : 'en-US', { weekday:'long', month:'long', day:'numeric' })
    const time = new Date(booking.scheduled_at).toLocaleTimeString(lang === 'ar' ? 'ar-KW' : 'en-US', { hour:'2-digit', minute:'2-digit' })
    const method = booking.method === 'video' ? (lang === 'ar' ? 'مكالمة فيديو' : 'Video Call') : 'WhatsApp'
    const d = { clientName: client.preferred_name, date, time, method, lang }

    if (client.email) await send24hrReminder(client.email, { ...d, bookingRef: booking.booking_ref }).catch(console.error)
    if (client.whatsapp) await sendWA24hrReminder(client.whatsapp, d).catch(console.error)
    sent++
  }

  // ── 15min session links ──────────────────────────────────
  const { data: upcoming15m } = await supabaseAdmin
    .from('bookings')
    .select('*, profiles!bookings_client_id_fkey(preferred_name,email,whatsapp,language)')
    .eq('status', 'confirmed')
    .eq('method', 'video')
    .gte('scheduled_at', new Date(in15m.getTime() - 3*60*1000).toISOString())
    .lte('scheduled_at', new Date(in15m.getTime() + 3*60*1000).toISOString())

  for (const booking of upcoming15m || []) {
    const client = booking.profiles
    if (!client || !booking.daily_room_url) continue
    const lang = client.language === 'en' ? 'en' : 'ar'
    const time = new Date(booking.scheduled_at).toLocaleTimeString(lang === 'ar' ? 'ar-KW' : 'en-US', { hour:'2-digit', minute:'2-digit' })
    const d = { clientName: client.preferred_name, roomUrl: booking.daily_room_url, time, lang }

    if (client.email) await sendSessionLink(client.email, d).catch(console.error)
    if (client.whatsapp) await sendWASessionLink(client.whatsapp, d).catch(console.error)
    sent++
  }

  // ── Post-session surveys (1hr after end) ─────────────────
  const { data: ended } = await supabaseAdmin
    .from('bookings')
    .select('*, profiles!bookings_client_id_fkey(preferred_name,email,whatsapp,language)')
    .eq('status', 'confirmed')
    .gte('scheduled_at', new Date(ago1h.getTime() - 5*60*1000).toISOString())
    .lte('scheduled_at', new Date(ago1h.getTime() + 5*60*1000).toISOString())

  for (const booking of ended || []) {
    const client = booking.profiles
    if (!client) continue
    const lang = client.language === 'en' ? 'en' : 'ar'
    const surveyUrl = `${APP_URL}/survey/${booking.id}`
    const d = { clientName: client.preferred_name, surveyUrl, lang }

    if (client.email) await sendPostSessionSurvey(client.email, d).catch(console.error)
    if (client.whatsapp) await sendWAPostSessionSurvey(client.whatsapp, d).catch(console.error)

    // Mark booking completed
    await supabaseAdmin.from('bookings').update({ status: 'completed' }).eq('id', booking.id)
    sent++
  }

  return NextResponse.json({ ok: true, sent })
}
