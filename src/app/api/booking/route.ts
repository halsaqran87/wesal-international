import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createSessionRoom } from '@/lib/daily'
import { sendBookingConfirmation } from '@/lib/email'
import { sendWABookingConfirmation } from '@/lib/whatsapp'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      clientId, serviceType, method, durationMinutes,
      priceKwd, scheduledAt, paymentRef, lang
    } = body

    // 1. Get consultant ID (only one for now — Khalaf)
    const { data: consultant } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'consultant')
      .single()

    if (!consultant) return NextResponse.json({ error: 'No consultant available' }, { status: 400 })

    // 2. Generate booking ref
    const bookingRef = `WSL-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000+1000))}`

    // 3. Create Daily.co room if video call
    let dailyRoomUrl = null
    let dailyRoomName = null
    if (method === 'video') {
      const room = await createSessionRoom(bookingRef, durationMinutes)
      dailyRoomUrl = room.url
      dailyRoomName = room.name
    }

    // 4. Insert booking to Supabase
    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .insert({
        client_id: clientId,
        consultant_id: consultant.id,
        service_type: serviceType,
        method,
        duration_minutes: durationMinutes,
        price_kwd: priceKwd,
        scheduled_at: scheduledAt,
        status: 'confirmed',
        daily_room_url: dailyRoomUrl,
        daily_room_name: dailyRoomName,
        booking_ref: bookingRef,
        payment_ref: paymentRef,
        payment_status: 'paid',
      })
      .select()
      .single()

    if (error) throw error

    // 5. Get client profile for notifications
    const { data: client } = await supabaseAdmin
      .from('profiles')
      .select('preferred_name, email, whatsapp, language')
      .eq('id', clientId)
      .single()

    if (client) {
      const date = new Date(scheduledAt).toLocaleDateString(lang === 'ar' ? 'ar-KW' : 'en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
      const time = new Date(scheduledAt).toLocaleTimeString(lang === 'ar' ? 'ar-KW' : 'en-US', {
        hour: '2-digit', minute: '2-digit'
      })

      const emailData = {
        clientName: client.preferred_name,
        serviceType: serviceType === 'social' ? (lang === 'ar' ? 'إرشاد اجتماعي' : 'Social Counseling') : (lang === 'ar' ? 'تأهيل الإدمان' : 'Addiction Rehab'),
        date, time,
        method: method === 'video' ? (lang === 'ar' ? 'مكالمة فيديو' : 'Video Call') : (lang === 'ar' ? 'مكالمة واتساب' : 'WhatsApp Call'),
        bookingRef,
        lang: client.language as 'ar' | 'en',
      }

      // Send email confirmation
      if (client.email) {
        await sendBookingConfirmation(client.email, emailData).catch(console.error)
      }

      // Send WhatsApp confirmation
      if (client.whatsapp) {
        await sendWABookingConfirmation(client.whatsapp, emailData).catch(console.error)
      }
    }

    // 6. Create in-app notification
    await supabaseAdmin.from('notifications').insert({
      user_id: clientId,
      type: 'booking_confirmed',
      title: 'Booking Confirmed',
      title_ar: 'تم تأكيد الحجز',
      body: `Your session on ${new Date(scheduledAt).toLocaleDateString()} is confirmed. Ref: ${bookingRef}`,
      body_ar: `تم تأكيد جلستك بتاريخ ${new Date(scheduledAt).toLocaleDateString('ar-KW')}. المرجع: ${bookingRef}`,
    })

    return NextResponse.json({ booking, bookingRef }, { status: 201 })

  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json({ error: 'Booking failed' }, { status: 500 })
  }
}
