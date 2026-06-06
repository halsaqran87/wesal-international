// ── WhatsApp Business API via 360dialog ──────────────────
const WA_API_KEY  = process.env.WHATSAPP_API_KEY!
const WA_API_BASE = 'https://waba.360dialog.io/v1/messages'
const WA_FROM     = process.env.WHATSAPP_FROM_NUMBER!

async function sendWAMessage(to: string, text: string) {
  const phone = to.replace(/\D/g, '').replace(/^00/, '+').replace(/^965/, '+965')
  const res = await fetch(WA_API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'D360-API-KEY': WA_API_KEY,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type:    'individual',
      to:                phone,
      type:              'text',
      text:              { preview_url: true, body: text },
    }),
  })
  if (!res.ok) console.error('WhatsApp send failed:', await res.text())
  return res.json()
}

// ── Message Templates ─────────────────────────────────────

export async function sendWABookingConfirmation(phone: string, data: {
  clientName: string
  serviceType: string
  date: string
  time: string
  method: string
  bookingRef: string
  lang: 'ar' | 'en'
}) {
  const isAr = data.lang === 'ar'
  const msg = isAr
    ? `✅ *تم تأكيد الحجز — وصال الدولية*\n\nمرحباً ${data.clientName}!\n\n📋 الخدمة: ${data.serviceType}\n📅 التاريخ: ${data.date}\n⏰ الوقت: ${data.time}\n🎥 الطريقة: ${data.method}\n🔖 رقم الحجز: ${data.bookingRef}\n\nستتلقى رابط الجلسة قبل 15 دقيقة.\n\n_جميع الجلسات سرية 🔒_`
    : `✅ *Booking Confirmed — Wesal International*\n\nHi ${data.clientName}!\n\n📋 Service: ${data.serviceType}\n📅 Date: ${data.date}\n⏰ Time: ${data.time}\n🎥 Method: ${data.method}\n🔖 Ref: ${data.bookingRef}\n\nYou'll receive your session link 15 minutes before.\n\n_All sessions are confidential 🔒_`
  return sendWAMessage(phone, msg)
}

export async function sendWA24hrReminder(phone: string, data: {
  clientName: string
  date: string
  time: string
  method: string
  lang: 'ar' | 'en'
}) {
  const isAr = data.lang === 'ar'
  const msg = isAr
    ? `⏰ *تذكير بالجلسة — غداً*\n\nمرحباً ${data.clientName}!\n\nجلستك غداً:\n📅 ${data.date}\n⏰ ${data.time} (توقيت الكويت)\n🎥 ${data.method}\n\nرد *CONFIRM* للتأكيد\nرد *RESCHEDULE* لإعادة الجدولة`
    : `⏰ *Session Reminder — Tomorrow*\n\nHi ${data.clientName}!\n\nYour session is tomorrow:\n📅 ${data.date}\n⏰ ${data.time} (Kuwait Time)\n🎥 ${data.method}\n\nReply *CONFIRM* to confirm\nReply *RESCHEDULE* to change`
  return sendWAMessage(phone, msg)
}

export async function sendWASessionLink(phone: string, data: {
  clientName: string
  roomUrl: string
  time: string
  lang: 'ar' | 'en'
}) {
  const isAr = data.lang === 'ar'
  const msg = isAr
    ? `🎥 *جلستك تبدأ خلال 15 دقيقة!*\n\nمرحباً ${data.clientName}!\n\nانقر للانضمام:\n${data.roomUrl}\n\n_الغرفة مشفرة وآمنة 🔒_`
    : `🎥 *Your session starts in 15 minutes!*\n\nHi ${data.clientName}!\n\nClick to join:\n${data.roomUrl}\n\n_Room is encrypted and secure 🔒_`
  return sendWAMessage(phone, msg)
}

export async function sendWAPostSessionSurvey(phone: string, data: {
  clientName: string
  surveyUrl: string
  lang: 'ar' | 'en'
}) {
  const isAr = data.lang === 'ar'
  const msg = isAr
    ? `⭐ *كيف كانت جلستك؟*\n\nمرحباً ${data.clientName}!\n\nنودّ معرفة رأيك. يستغرق دقيقتين فقط:\n${data.surveyUrl}\n\n_إجاباتك سرية تماماً 🔒_`
    : `⭐ *How was your session?*\n\nHi ${data.clientName}!\n\nShare your feedback — only 2 minutes:\n${data.surveyUrl}\n\n_Your answers are completely private 🔒_`
  return sendWAMessage(phone, msg)
}

export async function sendWARiskAlert(consultantPhone: string, clientName: string) {
  const msg = `⚠️ *AI Risk Alert — Wesal*\n\nClient: ${clientName}\n\nThe AI assistant has detected elevated distress patterns in recent entries.\n\nPlease review the client profile and consider a priority check-in.\n\nWesal AI System 🤖`
  return sendWAMessage(consultantPhone, msg)
}
