# 🌐 Wesal International — Complete Setup Guide

## Tech Stack
| Layer | Service |
|---|---|
| Frontend + Backend | Next.js 14 (App Router) |
| Hosting | Vercel |
| Database + Auth | Supabase |
| Video Calls | Daily.co |
| Email | Zoho Mail (SMTP) |
| WhatsApp | 360dialog (WhatsApp Business API) |
| Payments | Tap Payments (Kuwait) |
| AI Assistant | Anthropic Claude API |
| Version Control | GitHub |

---

## STEP 1 — GitHub Setup

```bash
# 1. Create a new repo on github.com named "wesal-international"

# 2. Clone and push this project
cd /path/to/wesal
git init
git add .
git commit -m "Initial commit — Wesal International"
git remote add origin https://github.com/YOUR_USERNAME/wesal-international.git
git push -u origin main
```

---

## STEP 2 — Supabase Setup

1. Go to **https://supabase.com** → New Project
2. Name: `wesal-international`
3. Region: Choose **Frankfurt** (closest to Kuwait)
4. Copy your **Project URL** and **anon key** from Settings → API

### Run the database schema:
1. Go to **SQL Editor** in Supabase dashboard
2. Paste the contents of `src/lib/schema.sql`
3. Click **Run**

### Create Khalaf's consultant account:
1. Go to **Authentication → Users → Invite User**
2. Email: `khalaf-j@hotmail.com`
3. After he signs up, go to SQL Editor and run:
```sql
UPDATE profiles 
SET role = 'consultant', preferred_name = 'Khalaf Jalal Alenizi'
WHERE email = 'khalaf-j@hotmail.com';
```

### Enable Email Auth:
- Authentication → Providers → Email → Enable

---

## STEP 3 — Daily.co Setup

1. Go to **https://www.daily.co** → Sign up
2. Dashboard → Developers → API Keys → Copy key
3. Set domain: **wesal.daily.co**

---

## STEP 4 — Zoho Mail Setup

1. Go to **https://mail.zoho.com** → Set up business email
2. Add domain: `wesal-international.com`
3. Create: `noreply@wesal-international.com`
4. Settings → Security → App Passwords → Create one
5. Use App Password (not your login password) in `.env`

---

## STEP 5 — WhatsApp Business (360dialog)

1. Go to **https://www.360dialog.com** → Register
2. Connect your WhatsApp Business number
3. Get your **API Key**
4. Request these message templates (required by Meta):
   - `wesal_booking_confirmation`
   - `wesal_session_reminder`
   - `wesal_session_link`
   - `wesal_post_survey`

---

## STEP 6 — Tap Payments (Kuwait)

1. Go to **https://www.tap.company** → Register business
2. Get **Secret Key** and **Public Key** from Dashboard
3. Supports: KNET, Visa, Mastercard, Apple Pay, STC Pay

---

## STEP 7 — Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Or connect via GitHub:
1. Go to **https://vercel.com** → New Project
2. Import your GitHub repo `wesal-international`
3. Framework: **Next.js** (auto-detected)
4. Add all environment variables (see below)

### Environment Variables to add in Vercel:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
DAILY_API_KEY
NEXT_PUBLIC_DAILY_DOMAIN
ZOHO_SMTP_HOST
ZOHO_SMTP_PORT
ZOHO_EMAIL
ZOHO_PASSWORD
WHATSAPP_API_KEY
WHATSAPP_FROM_NUMBER
TAP_SECRET_KEY
NEXT_PUBLIC_TAP_PUBLIC_KEY
NEXT_PUBLIC_APP_URL
CRON_SECRET
```

---

## STEP 8 — Custom Domain

1. In Vercel → Project → Settings → Domains
2. Add: `wesal-international.com`
3. Update DNS at your domain registrar:
   - A record: `76.76.19.61`
   - CNAME: `www` → `cname.vercel-dns.com`

---

## Automation (Cron Jobs)

Vercel runs the reminder cron every 5 minutes automatically via `vercel.json`:
- Sends 24hr reminders
- Sends 15min session links
- Sends post-session surveys
- Marks completed sessions

---

## Project File Structure

```
wesal/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (client)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── book/page.tsx
│   │   │   ├── progress/page.tsx
│   │   │   └── journal/page.tsx
│   │   ├── (consultant)/
│   │   │   ├── portal/page.tsx
│   │   │   └── clients/[id]/page.tsx
│   │   ├── api/
│   │   │   ├── booking/route.ts       ✅
│   │   │   ├── ai/route.ts            ✅
│   │   │   └── reminders/route.ts     ✅
│   │   ├── layout.tsx                 ✅
│   │   └── globals.css                ✅
│   ├── components/
│   │   ├── layout/Navbar.tsx
│   │   ├── booking/BookingFlow.tsx
│   │   └── ui/Button.tsx
│   └── lib/
│       ├── supabase.ts                ✅
│       ├── schema.sql                 ✅
│       ├── daily.ts                   ✅
│       ├── email.ts                   ✅
│       ├── whatsapp.ts                ✅
│       └── ai.ts                      ✅
├── package.json                       ✅
├── next.config.js                     ✅
├── tailwind.config.ts                 ✅
├── tsconfig.json                      ✅
├── vercel.json                        ✅
└── .env.example                       ✅
```

---

## Monthly Cost Estimate

| Service | Free Tier | Paid |
|---|---|---|
| Vercel | Free (hobby) | $20/mo (pro) |
| Supabase | Free (500MB) | $25/mo |
| Daily.co | Free (10k min) | $0.004/min |
| 360dialog | ~$5/mo base | Per message |
| Zoho Mail | Free (5GB) | $1/mo |
| Tap Payments | 2.75% per txn | — |
| Claude API | Pay per use | ~$0.003/req |
| **Total start** | **~Free** | **~$50-80/mo** |

---

## Next Steps After Deployment

1. ✅ Set up Supabase schema
2. ✅ Create Khalaf's consultant account
3. ✅ Test booking flow end-to-end
4. ✅ Test email + WhatsApp notifications
5. ✅ Test video call room creation
6. ✅ Submit WhatsApp templates to Meta for approval (~24hrs)
7. ✅ Add Tap Payments widget to booking step 5
8. ✅ Set custom domain in Vercel

---

*Built for Wesal International for Social Consultations — Kuwait*
*Licensed by Ministry of Commerce & Industry*
