import nodemailer from 'nodemailer'

// ── Zoho Mail transporter ─────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.ZOHO_SMTP_HOST || 'smtp.zoho.com',
  port:   Number(process.env.ZOHO_SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_EMAIL,
    pass: process.env.ZOHO_PASSWORD,
  },
})

const FROM = `Wesal International <${process.env.ZOHO_EMAIL}>`
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://wesal-international.com'

// ── Email template base ───────────────────────────────────
function baseTemplate(content: string, lang: 'ar' | 'en' = 'ar') {
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const font = lang === 'ar' ? 'Tajawal, sans-serif' : 'Montserrat, sans-serif'
  return `
<!DOCTYPE html>
<html dir="${dir}" lang="${lang}">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  body { margin:0; padding:0; background:#f0f4f8; font-family:${font}; }
  .wrap { max-width:580px; margin:32px auto; background:white; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(26,58,92,0.10); }
  .header { background:linear-gradient(135deg,#1a3a5c,#2a6090); padding:28px 32px; display:flex; align-items:center; gap:16px; }
  .logo-text { color:white; }
  .logo-text .brand { font-size:18px; font-weight:800; letter-spacing:1px; }
  .logo-text .sub   { font-size:10px; opacity:0.6; letter-spacing:2px; margin-top:2px; }
  .body   { padding:32px; }
  .footer { padding:20px 32px; background:#f7fafd; border-top:1px solid #eef4fa; text-align:center; font-size:11px; color:#7a9ab8; }
  .btn    { display:inline-block; background:#2a6090; color:white; padding:13px 28px; border-radius:22px; text-decoration:none; font-weight:700; font-size:14px; margin:16px 0; }
  .info-box { background:#eef4fa; border-radius:10px; padding:16px 20px; margin:16px 0; font-size:13px; color:#3a5a7a; line-height:1.8; }
  .privacy  { background:#eafaf3; border:1px solid rgba(42,154,106,0.2); border-radius:8px; padding:12px 16px; font-size:11px; color:#1a6a4a; margin-top:16px; }
  h2 { color:#1a3a5c; margin-bottom:12px; }
  p  { color:#3a5a7a; line-height:1.7; font-size:14px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="logo-text">
      <div class="brand">WESAL INTERNATIONAL</div>
      <div class="sub">SOCIAL CONSULTATIONS</div>
    </div>
  </div>
  <div class="body">${content}</div>
  <div class="footer">
    🔒 ${lang === 'ar' ? 'جميع الجلسات سرية تماماً ولن تُشارك بياناتك أبداً.' : 'All sessions are strictly confidential. Your data is never shared.'}<br>
    © ${new Date().getFullYear()} Wesal International · Kuwait
  </div>
</div>
</body>
</html>`
}

// ── Email functions ───────────────────────────────────────

export async function sendBookingConfirmation(to: string, data: {
  clientName: string
  serviceType: string
  date: string
  time: string
  method: string
  bookingRef: string
  lang: 'ar' | 'en'
}) {
  const isAr = data.lang === 'ar'
  const subject = isAr
    ? `✅ تم تأكيد جلستك — ${data.bookingRef}`
    : `✅ Your session is confirmed — ${data.bookingRef}`

  const content = isAr ? `
    <h2>تم تأكيد جلستك! ✅</h2>
    <p>مرحباً ${data.clientName}، تم تأكيد حجزك بنجاح.</p>
    <div class="info-box">
      📋 <strong>الخدمة:</strong> ${data.serviceType}<br>
      📅 <strong>التاريخ:</strong> ${data.date}<br>
      ⏰ <strong>الوقت:</strong> ${data.time} (توقيت الكويت)<br>
      🎥 <strong>الطريقة:</strong> ${data.method}<br>
      🔖 <strong>رقم الحجز:</strong> ${data.bookingRef}
    </div>
    <p>ستتلقى رابط الجلسة قبل 15 دقيقة من الموعد عبر واتساب والبريد الإلكتروني.</p>
    <a href="${APP_URL}/dashboard" class="btn">عرض لوحتي</a>
    <div class="privacy">🔒 جميع البيانات سرية ولن تُشارك مع أي طرف ثالث.</div>
  ` : `
    <h2>Your Session is Confirmed! ✅</h2>
    <p>Hi ${data.clientName}, your booking has been confirmed.</p>
    <div class="info-box">
      📋 <strong>Service:</strong> ${data.serviceType}<br>
      📅 <strong>Date:</strong> ${data.date}<br>
      ⏰ <strong>Time:</strong> ${data.time} (Kuwait Time)<br>
      🎥 <strong>Method:</strong> ${data.method}<br>
      🔖 <strong>Ref:</strong> ${data.bookingRef}
    </div>
    <p>You'll receive your session link 15 minutes before via WhatsApp and email.</p>
    <a href="${APP_URL}/dashboard" class="btn">View My Dashboard</a>
    <div class="privacy">🔒 All data is confidential and never shared with any third party.</div>
  `

  await transporter.sendMail({ from: FROM, to, subject, html: baseTemplate(content, data.lang) })
}

export async function send24hrReminder(to: string, data: {
  clientName: string
  date: string
  time: string
  method: string
  bookingRef: string
  lang: 'ar' | 'en'
}) {
  const isAr = data.lang === 'ar'
  const subject = isAr ? `⏰ تذكير: جلستك غداً — ${data.time}` : `⏰ Reminder: Your session tomorrow — ${data.time}`

  const content = isAr ? `
    <h2>جلستك غداً ⏰</h2>
    <p>مرحباً ${data.clientName}، نذكّرك بأن جلستك مع خلف جلال العنيزي غداً.</p>
    <div class="info-box">
      📅 <strong>التاريخ:</strong> ${data.date}<br>
      ⏰ <strong>الوقت:</strong> ${data.time}<br>
      🎥 <strong>الطريقة:</strong> ${data.method}
    </div>
    <p>إذا احتجت إلى إعادة الجدولة، يرجى التواصل معنا قبل ساعتين على الأقل.</p>
    <a href="${APP_URL}/dashboard" class="btn">عرض حجزي</a>
  ` : `
    <h2>Your session is tomorrow ⏰</h2>
    <p>Hi ${data.clientName}, just a reminder about your session with Khalaf Jalal Alenizi tomorrow.</p>
    <div class="info-box">
      📅 <strong>Date:</strong> ${data.date}<br>
      ⏰ <strong>Time:</strong> ${data.time}<br>
      🎥 <strong>Method:</strong> ${data.method}
    </div>
    <p>Need to reschedule? Please let us know at least 2 hours before.</p>
    <a href="${APP_URL}/dashboard" class="btn">View My Booking</a>
  `

  await transporter.sendMail({ from: FROM, to, subject, html: baseTemplate(content, data.lang) })
}

export async function sendSessionLink(to: string, data: {
  clientName: string
  roomUrl: string
  time: string
  lang: 'ar' | 'en'
}) {
  const isAr = data.lang === 'ar'
  const subject = isAr ? '🎥 جلستك تبدأ خلال 15 دقيقة!' : '🎥 Your session starts in 15 minutes!'

  const content = isAr ? `
    <h2>جلستك على وشك البدء! 🎥</h2>
    <p>مرحباً ${data.clientName}، جلستك تبدأ الآن في ${data.time}.</p>
    <a href="${data.roomUrl}" class="btn">🎥 انضم للجلسة الآن</a>
    <div class="info-box">الغرفة مشفرة ومؤمّنة. لا يمكن لأحد الدخول إلا أنت ومختصك.</div>
  ` : `
    <h2>Your session is starting! 🎥</h2>
    <p>Hi ${data.clientName}, your session at ${data.time} is ready.</p>
    <a href="${data.roomUrl}" class="btn">🎥 Join Session Now</a>
    <div class="info-box">The room is encrypted and secure. Only you and your specialist can enter.</div>
  `

  await transporter.sendMail({ from: FROM, to, subject, html: baseTemplate(content, data.lang) })
}

export async function sendPostSessionSurvey(to: string, data: {
  clientName: string
  surveyUrl: string
  lang: 'ar' | 'en'
}) {
  const isAr = data.lang === 'ar'
  const subject = isAr ? '⭐ كيف كانت جلستك اليوم؟' : '⭐ How was your session today?'

  const content = isAr ? `
    <h2>كيف كانت جلستك؟ ⭐</h2>
    <p>مرحباً ${data.clientName}، نودّ معرفة رأيك في جلسة اليوم. يستغرق الاستبيان دقيقتين فقط.</p>
    <a href="${data.surveyUrl}" class="btn">⭐ تقييم الجلسة</a>
    <div class="privacy">🔒 إجاباتك مجهولة المصدر لمختصك — يرى فقط ملخص التقييم.</div>
  ` : `
    <h2>How was your session? ⭐</h2>
    <p>Hi ${data.clientName}, we'd love to hear how your session went. It only takes 2 minutes.</p>
    <a href="${data.surveyUrl}" class="btn">⭐ Rate My Session</a>
    <div class="privacy">🔒 Your answers are anonymous to your specialist — they only see a summary score.</div>
  `

  await transporter.sendMail({ from: FROM, to, subject, html: baseTemplate(content, data.lang) })
}
