import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { send24hrReminder, sendSessionLink, sendPostSessionSurvey } from '@/lib/email'
import { sendWA24hrReminder, sendWASessionLink, sendWAPostSessionSurvey } from '@/lib/whatsapp'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://wesal-international.com'

type Lang = 'ar' | 'en'

function getLang(language: string | null | undefined): Lang {
  return language === 'en' ? 'en' : 'ar'
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const in15m = new Date(now.getTime() + 15 * 60 * 1000)
  const ago1h = new Date(now.getTime() - 60 * 60 * 1000)

  let sent = 0

  // ── 24hr reminders ──────────────────────────────────────
  const { data: upcoming24h } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('status', 'confirmed')
    .gte('scheduled_at', new Date(in24h.getTime() - 5 * 60 * 1000).toISOString())
    .lte('scheduled_at', new Date(in24h.getTime() + 5 * 60 * 1000).toISOString())

  for (const booking of upcoming24h || []) {
    const { data: client } = await supabaseAdmin
      .from('profiles')
      .select('preferred_name,email,whatsapp,language')
      .eq('id', booking.client_id)
      .single()

    if (!client) continue
    const lang = getLang(client.language)
    const date = new Date(booking.scheduled_at).toLocaleDateString(
      lang === 'ar' ? 'ar-KW' : 'en-US',
      { weekday: 'long', month: 'long', day: 'numeric' }
    )
    const time = new Date(booking.scheduled_at).toLocaleTimeString(
      lang === 'ar' ? 'ar-KW' : 'en-US',
      { hour: '2-digit', minute: '2-digit' }
    )
    const method = booking.method === 'video'
      ? (lang === 'ar' ? 'مكالمة فيديو' : 'Video Call')
      : 'WhatsApp'

    if (client.email) {
      await send24hrReminder(client.email, {
        clientName: client.preferred_name,
        date, time, method,
        bookingRef: booking.booking_ref,
        lang,
      }).catch(console.error)
    }
    if (client.whatsapp) {
      await sendWA24hrReminder(client.whatsapp, {
        clientName: client.preferred_name,
        date, time, method, lang,
      }).catch(console.error)
    }
    sent++
  }

  // ── 15min session links ──────────────────────────────────
  const { data: upcoming15m } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('status', 'confirmed')
    .eq('method', 'video')
    .gte('scheduled_at', new Date(in15m.getTime() - 3 * 60 * 1000).toISOString())
    .lte('scheduled_at', new Date(in15m.getTime() + 3 * 60 * 1000).toISOString())

  for (const booking of upcoming15m || []) {
    if (!booking.daily_room_url) continue
    const { data: client } = await supabaseAdmin
      .from('profiles')
      .select('preferred_name,email,whatsapp,language')
      .eq('id', booking.client_id)
      .single()

    if (!client) continue
    const lang = getLang(client.language)
    const time = new Date(booking.scheduled_at).toLocaleTimeString(
      lang === 'ar' ? 'ar-KW' : 'en-US',
      { hour: '2-digit', minute: '2-digit' }
    )

    if (client.email) {
      await sendSessionLink(client.email, {
        clientName: client.preferred_name,
        roomUrl: booking.daily_room_url,
        time, lang,
      }).catch(console.error)
    }
    if (client.whatsapp) {
      await sendWASessionLink(client.whatsapp, {
        clientName: client.preferred_name,
        roomUrl: booking.daily_room_url,
        time, lang,
      }).catch(console.error)
    }
    sent++
  }

  // ── Post-session surveys ─────────────────────────────────
  const { data: ended } = await supabaseAdmin
    .from('bookings')
    .select('*')
    .eq('status', 'confirmed')
    .gte('scheduled_at', new Date(ago1h.getTime() - 5 * 60 * 1000).toISOString())
    .lte('scheduled_at', new Date(ago1h.getTime() + 5 * 60 * 1000).toISOString())

  for (const booking of ended || []) {
    const { data: client } = await supabaseAdmin
      .from('profiles')
      .select('preferred_name,email,whatsapp,language')
      .eq('id', booking.client_id)
      .single()

    if (!client) continue
    const lang = getLang(client.language)
    const surveyUrl = `${APP_URL}/survey/${booking.id}`

    if (client.email) {
      await sendPostSessionSurvey(client.email, {
        clientName: client.preferred_name,
        surveyUrl, lang,
      }).catch(console.error)
    }
    if (client.whatsapp) {
      await sendWAPostSessionSurvey(client.whatsapp, {
        clientName: client.preferred_name,
        surveyUrl, lang,
      }).catch(console.error)
    }

    await supabaseAdmin.from('bookings').update({ status: 'completed' }).eq('id', booking.id)
    sent++
  }

  return NextResponse.json({ ok: true, sent })
}
