'use client'
import { useState, useEffect } from 'react'

type Profile = { preferred_name: string; service_type: string | null; language: string }
type Booking = { id: string; scheduled_at: string; service_type: string; method: string; status: string; booking_ref: string; duration_minutes: number }
type MoodEntry = { mood: number; recorded_at: string }

export default function DashboardPage() {
  const [lang, setLang]       = useState<'ar'|'en'>('ar')
  const [profile, setProfile] = useState<Profile|null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [moods, setMoods]     = useState<MoodEntry[]>([])
  const [todayMood, setTodayMood] = useState<number|null>(null)
  const [journalText, setJournalText] = useState('')
  const [activePage, setActivePage] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isAr = lang === 'ar'

  useEffect(() => {
    async function load() {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
        const { data: { user } } = await sb.auth.getUser()
        if (!user) { window.location.href = '/login'; return }
        const { data: p } = await sb.from('profiles').select('*').eq('id', user.id).single()
        if (p) { setProfile(p); if (p.language) setLang(p.language === 'en' ? 'en' : 'ar') }
        const { data: b } = await sb.from('bookings').select('*').eq('client_id', user.id).order('scheduled_at', { ascending: false }).limit(10)
        if (b) setBookings(b)
        const { data: m } = await sb.from('mood_entries').select('*').eq('client_id', user.id).order('recorded_at', { ascending: false }).limit(7)
        if (m) setMoods(m)
      } catch { window.location.href = '/login' }
      setLoading(false)
    }
    load()
  }, [])

  async function saveMood(mood: number) {
    setTodayMood(mood)
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      const { data: { user } } = await sb.auth.getUser()
      if (user) await sb.from('mood_entries').insert({ client_id: user.id, mood })
    } catch {}
  }

  async function saveJournal() {
    if (!journalText.trim()) return
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      const { data: { user } } = await sb.auth.getUser()
      if (user) {
        await sb.from('journal_entries').insert({ client_id: user.id, content: journalText, mood: todayMood ? ['😔','😐','🙂','😄'][todayMood-1] : null })
        setJournalText('')
        alert(isAr ? '✓ تم حفظ المدخل' : '✓ Entry saved')
      }
    } catch {}
  }

  async function logout() {
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    await sb.auth.signOut()
    window.location.href = '/'
  }

  const upcoming = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending')
  const past     = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled')
  const moodEmojis = ['😔','😐','🙂','😄']
  const moodLabels = isAr ? ['منخفض','عادي','جيد','رائع'] : ['Low','Okay','Good','Great']

  const sidebarItems = [
    { id:'dashboard', icon:'🏠', en:'Dashboard',      ar:'لوحة التحكم' },
    { id:'appointments', icon:'📅', en:'My Appointments', ar:'مواعيدي' },
    { id:'journal',   icon:'📓', en:'My Journal',     ar:'مذكراتي' },
    { id:'profile',   icon:'👤', en:'My Profile',     ar:'ملفي' },
  ]

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#eef4fa',fontFamily:'Tajawal,sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:40,marginBottom:16}}>⏳</div>
        <p style={{color:'#2a6090',fontWeight:600}}>{isAr?'جارٍ التحميل...':'Loading...'}</p>
      </div>
    </div>
  )

  return (
    <div dir={isAr?'rtl':'ltr'} style={{display:'flex',minHeight:'100vh',fontFamily:isAr?'Tajawal,sans-serif':'Montserrat,sans-serif',background:'#f7fafd'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=Montserrat:wght@400;500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        @media(max-width:768px){
          .sidebar{transform:${isAr?'translateX(100%)':'translateX(-100%)'} !important;}
          .sidebar.open{transform:translateX(0) !important;}
          .main{margin-left:0 !important;margin-right:0 !important;}
        }
      `}</style>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && <div onClick={()=>setSidebarOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.4)',zIndex:49}}/>}

      {/* ── SIDEBAR ── */}
      <aside className={`sidebar${sidebarOpen?' open':''}`} style={{width:240,minHeight:'100vh',background:'linear-gradient(180deg,#0f2233,#1a3a5c)',display:'flex',flexDirection:'column',position:'fixed',top:0,[isAr?'right':'left']:0,zIndex:50,transition:'transform .3s'}}>
        <div style={{padding:'20px 16px',borderBottom:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',gap:10}}>
          <svg width="34" height="34" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="38" fill="rgba(255,255,255,.08)"/>
            <clipPath id="sl"><circle cx="40" cy="40" r="35"/></clipPath>
            <path d="M40 8 L40 26 Q35 26 33 30 Q31 35 36 37 Q41 39 40 40 L18 40 L18 22 Q23 22 25 18 Q27 13 22 11 Q17 9 18 8Z" fill="#4a90c4" clipPath="url(#sl)"/>
            <path d="M40 8 L62 8 Q61 9 56 11 Q51 13 53 18 Q55 22 60 22 L62 40 L40 40 Q39 39 44 37 Q49 35 47 30 Q45 26 40 26Z" fill="#7ab5d8" clipPath="url(#sl)"/>
            <path d="M18 40 L40 40 Q40 41 36 43 Q31 45 33 50 Q35 54 40 54 L40 72 L18 72 Q18 62 23 60 Q28 58 26 53 Q24 48 18 50Z" fill="#b8d8ec" clipPath="url(#sl)"/>
            <path d="M40 40 L62 40 Q56 38 54 43 Q52 48 57 53 Q62 58 62 72 L40 72 L40 54 Q45 54 47 50 Q49 45 44 43 Q39 41 40 40Z" fill="rgba(255,255,255,.25)" clipPath="url(#sl)"/>
          </svg>
          <div><div style={{fontWeight:800,fontSize:13,color:'white',letterSpacing:1}}>WESAL</div><div style={{fontSize:8,color:'#b8d8ec',letterSpacing:'2px',textTransform:'uppercase'}}>{isAr?'بوابة العميل':'Client Portal'}</div></div>
        </div>

        <div style={{padding:'14px 12px',borderBottom:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:38,height:38,borderRadius:'50%',background:'linear-gradient(135deg,#4a90c4,#2a6090)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,color:'white',fontWeight:700,flexShrink:0}}>
            {profile?.preferred_name?.[0]?.toUpperCase() || '👤'}
          </div>
          <div><div style={{fontSize:13,fontWeight:600,color:'white'}}>{profile?.preferred_name || (isAr?'المستخدم':'User')}</div><div style={{fontSize:10,color:'#b8d8ec',marginTop:2}}>{isAr?'عميل':'Client'}</div></div>
        </div>

        <nav style={{flex:1,padding:'8px 0'}}>
          {sidebarItems.map(item=>(
            <div key={item.id} onClick={()=>{setActivePage(item.id);setSidebarOpen(false)}}
              style={{display:'flex',alignItems:'center',gap:10,padding:'10px 16px',cursor:'pointer',color:activePage===item.id?'white':'rgba(255,255,255,.55)',fontSize:13,fontWeight:500,background:activePage===item.id?'rgba(255,255,255,.1)':'transparent',borderLeft:isAr?'none':'3px solid',borderRight:isAr?'3px solid':'none',borderLeftColor:activePage===item.id?'#4a90c4':'transparent',borderRightColor:activePage===item.id?'#4a90c4':'transparent',transition:'all .2s'}}>
              <span style={{fontSize:15,width:18,textAlign:'center'}}>{item.icon}</span>
              <span>{isAr?item.ar:item.en}</span>
            </div>
          ))}
        </nav>

        <div style={{padding:12,borderTop:'1px solid rgba(255,255,255,.08)',display:'flex',flexDirection:'column',gap:8}}>
          <a href="/book" style={{display:'block',background:'#4a90c4',color:'white',borderRadius:12,padding:'10px',fontSize:13,fontWeight:600,textAlign:'center',textDecoration:'none'}}>
            ＋ {isAr?'حجز جلسة جديدة':'Book New Session'}
          </a>
          <button onClick={logout} style={{background:'rgba(255,255,255,.08)',border:'none',color:'rgba(255,255,255,.6)',borderRadius:12,padding:'8px',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
            {isAr?'تسجيل الخروج':'Sign Out'}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="main" style={{flex:1,marginLeft:isAr?0:240,marginRight:isAr?240:0}}>

        {/* Topbar */}
        <div style={{background:'white',borderBottom:'1px solid rgba(74,144,196,.1)',padding:'14px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:40,boxShadow:'0 2px 12px rgba(26,58,92,.05)'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <button onClick={()=>setSidebarOpen(!sidebarOpen)} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#1a3a5c',padding:4}}>☰</button>
            <div>
              <h2 style={{fontSize:17,fontWeight:700,color:'#1a3a5c'}}>{sidebarItems.find(s=>s.id===activePage)?.[isAr?'ar':'en']}</h2>
              <p style={{fontSize:11,color:'#7a9ab8',marginTop:1}}>{isAr?`مرحباً، ${profile?.preferred_name || ''}`:`Welcome, ${profile?.preferred_name || ''}`}</p>
            </div>
          </div>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <button onClick={()=>setLang(isAr?'en':'ar')} style={{background:'#eef4fa',border:'1px solid #b8d8ec',color:'#2a6090',fontSize:11,fontWeight:600,padding:'6px 12px',borderRadius:14,cursor:'pointer',fontFamily:'inherit'}}>
              {isAr?'English':'العربية'}
            </button>
          </div>
        </div>

        <div style={{padding:24}}>

          {/* ═══ DASHBOARD ═══ */}
          {activePage==='dashboard' && (
            <div>
              {/* Stats */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:16,marginBottom:24}}>
                {[
                  {icon:'📅',num:bookings.length,label:isAr?'إجمالي الجلسات':'Total Sessions',color:'#eef4fa'},
                  {icon:'⏳',num:upcoming.length,label:isAr?'جلسات قادمة':'Upcoming',color:'#eafaf3'},
                  {icon:'✅',num:past.filter(b=>b.status==='completed').length,label:isAr?'جلسات مكتملة':'Completed',color:'#f0f7ff'},
                  {icon:'😊',num:moods.length,label:isAr?'تسجيلات المزاج':'Mood Logs',color:'#fdf6e8'},
                ].map((s,i)=>(
                  <div key={i} style={{background:'white',borderRadius:16,padding:20,boxShadow:'0 4px 16px rgba(26,58,92,.07)',border:'1px solid rgba(74,144,196,.08)',display:'flex',alignItems:'center',gap:14}}>
                    <div style={{width:46,height:46,borderRadius:12,background:s.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{s.icon}</div>
                    <div><div style={{fontSize:26,fontWeight:800,color:'#1a3a5c',lineHeight:1}}>{s.num}</div><div style={{fontSize:11,color:'#7a9ab8',marginTop:3}}>{s.label}</div></div>
                  </div>
                ))}
              </div>

              {/* Next session */}
              {upcoming.length > 0 ? (
                <div style={{background:'linear-gradient(135deg,#1a3a5c,#2a6090)',borderRadius:18,padding:28,marginBottom:24,color:'white'}}>
                  <div style={{fontSize:10,fontWeight:600,letterSpacing:2,opacity:.6,textTransform:'uppercase',marginBottom:10}}>{isAr?'الجلسة القادمة':'NEXT SESSION'}</div>
                  <h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>
                    {upcoming[0].service_type==='social'?(isAr?'إرشاد اجتماعي':'Social Counseling'):(isAr?'تأهيل وعلاج إدمان':'Rehab & Addiction')}
                  </h3>
                  <p style={{opacity:.8,fontSize:14,marginBottom:16}}>
                    📅 {new Date(upcoming[0].scheduled_at).toLocaleDateString(isAr?'ar-KW':'en-US',{weekday:'long',month:'long',day:'numeric'})}
                    &nbsp;—&nbsp;
                    {new Date(upcoming[0].scheduled_at).toLocaleTimeString(isAr?'ar-KW':'en-US',{hour:'2-digit',minute:'2-digit'})}
                  </p>
                  <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
                    <span style={{background:'rgba(255,255,255,.1)',padding:'5px 14px',borderRadius:20,fontSize:12,fontWeight:600}}>
                      {upcoming[0].method==='video'?'🎥':(isAr?'💬 واتساب':'💬 WhatsApp')}
                      {upcoming[0].method==='video'?(isAr?' مكالمة فيديو':' Video Call'):''}
                    </span>
                    <span style={{background:'rgba(255,255,255,.1)',padding:'5px 14px',borderRadius:20,fontSize:12,fontWeight:600}}>
                      ⏱️ {upcoming[0].duration_minutes} {isAr?'دقيقة':'min'}
                    </span>
                    <span style={{background:'rgba(255,255,255,.1)',padding:'5px 14px',borderRadius:20,fontSize:12,fontWeight:600}}>
                      🔖 {upcoming[0].booking_ref}
                    </span>
                  </div>
                  <div style={{marginTop:20,display:'flex',gap:10}}>
                    <a href="/book" style={{background:'white',color:'#1a3a5c',padding:'10px 22px',borderRadius:20,fontSize:13,fontWeight:700,textDecoration:'none'}}>
                      {isAr?'🎥 انضم للجلسة':'🎥 Join Session'}
                    </a>
                  </div>
                </div>
              ) : (
                <div style={{background:'linear-gradient(135deg,#1a3a5c,#2a6090)',borderRadius:18,padding:28,marginBottom:24,color:'white',textAlign:'center'}}>
                  <div style={{fontSize:36,marginBottom:12}}>📅</div>
                  <h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>{isAr?'لا توجد جلسات قادمة':'No Upcoming Sessions'}</h3>
                  <a href="/book" style={{display:'inline-block',background:'white',color:'#1a3a5c',padding:'10px 24px',borderRadius:20,fontSize:13,fontWeight:700,textDecoration:'none',marginTop:8}}>
                    {isAr?'احجز جلستك الأولى':'Book Your First Session'}
                  </a>
                </div>
              )}

              {/* Mood check-in */}
              <div style={{background:'white',borderRadius:16,padding:24,boxShadow:'0 4px 16px rgba(26,58,92,.07)',marginBottom:24}}>
                <h3 style={{fontSize:14,fontWeight:700,color:'#1a3a5c',marginBottom:4}}>{isAr?'تسجيل مزاج اليوم':'Today\'s Mood Check-In'}</h3>
                <p style={{fontSize:12,color:'#7a9ab8',marginBottom:16}}>{isAr?'كيف تشعر الآن؟':'How are you feeling right now?'}</p>
                <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                  {moodEmojis.map((emoji,i)=>(
                    <button key={i} onClick={()=>saveMood(i+1)} style={{flex:1,minWidth:70,padding:'12px 8px',border:`2px solid ${todayMood===i+1?'#2a6090':'#b8d8ec'}`,borderRadius:12,background:todayMood===i+1?'#eef4fa':'white',cursor:'pointer',textAlign:'center',transition:'all .2s',fontFamily:'inherit'}}>
                      <div style={{fontSize:24,marginBottom:4}}>{emoji}</div>
                      <div style={{fontSize:11,fontWeight:600,color:todayMood===i+1?'#2a6090':'#7a9ab8'}}>{moodLabels[i]}</div>
                    </button>
                  ))}
                </div>
                {todayMood && <p style={{fontSize:12,color:'#2a9a6a',marginTop:12,fontWeight:600}}>✓ {isAr?'تم تسجيل مزاجك':'Mood saved'}</p>}
              </div>

              {/* Privacy note */}
              <div style={{background:'#eafaf3',border:'1px solid rgba(42,154,106,.2)',borderRadius:12,padding:'14px 18px',display:'flex',alignItems:'center',gap:12}}>
                <span style={{fontSize:22}}>🔒</span>
                <p style={{fontSize:13,color:'#1a6a4a',lineHeight:1.6}}>
                  {isAr?'جميع بياناتك ومذكراتك وجلساتك سرية تماماً ولن تُشارك مع أي شخص.':'All your data, journals, and sessions are strictly confidential and never shared with anyone.'}
                </p>
              </div>
            </div>
          )}

          {/* ═══ APPOINTMENTS ═══ */}
          {activePage==='appointments' && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
                <h3 style={{fontSize:16,fontWeight:700,color:'#1a3a5c'}}>{isAr?'جميع المواعيد':'All Appointments'}</h3>
                <a href="/book" style={{background:'#2a6090',color:'white',padding:'9px 20px',borderRadius:20,fontSize:13,fontWeight:600,textDecoration:'none'}}>
                  ＋ {isAr?'حجز جديد':'New Booking'}
                </a>
              </div>
              {bookings.length===0 ? (
                <div style={{background:'white',borderRadius:16,padding:48,textAlign:'center',boxShadow:'0 4px 16px rgba(26,58,92,.07)'}}>
                  <div style={{fontSize:48,marginBottom:16}}>📅</div>
                  <h4 style={{fontSize:16,fontWeight:600,color:'#1a3a5c',marginBottom:8}}>{isAr?'لا توجد مواعيد بعد':'No appointments yet'}</h4>
                  <a href="/book" style={{display:'inline-block',background:'#2a6090',color:'white',padding:'11px 24px',borderRadius:20,fontSize:13,fontWeight:600,textDecoration:'none',marginTop:12}}>
                    {isAr?'احجز جلستك الأولى':'Book Your First Session'}
                  </a>
                </div>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {bookings.map(b=>{
                    const statusColor = b.status==='confirmed'||b.status==='pending'?{bg:'#eef4fa',color:'#2a6090'}:b.status==='completed'?{bg:'#eafaf3',color:'#2a9a6a'}:{bg:'#fef0f0',color:'#e05050'}
                    const statusLabel = b.status==='confirmed'?(isAr?'قادم':'Upcoming'):b.status==='completed'?(isAr?'مكتملة':'Completed'):(isAr?'ملغاة':'Cancelled')
                    return (
                      <div key={b.id} style={{background:'white',borderRadius:14,padding:20,boxShadow:'0 4px 16px rgba(26,58,92,.07)',display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
                        <div style={{width:52,height:52,borderRadius:12,background:b.status==='completed'?'#2a9a6a':b.status==='cancelled'?'#aaa':'#2a6090',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'white',flexShrink:0}}>
                          <div style={{fontSize:18,fontWeight:800,lineHeight:1}}>{new Date(b.scheduled_at).getDate()}</div>
                          <div style={{fontSize:9,fontWeight:600,opacity:.8}}>{new Date(b.scheduled_at).toLocaleString(isAr?'ar-KW':'en-US',{month:'short'}).toUpperCase()}</div>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:700,color:'#1a3a5c',marginBottom:3}}>
                            {b.service_type==='social'?(isAr?'إرشاد اجتماعي':'Social Counseling'):(isAr?'تأهيل وعلاج إدمان':'Rehab & Addiction')}
                            {' — '}{b.method==='video'?(isAr?'مكالمة فيديو':'Video Call'):(isAr?'واتساب':'WhatsApp')}
                          </div>
                          <div style={{fontSize:11,color:'#7a9ab8'}}>
                            {new Date(b.scheduled_at).toLocaleTimeString(isAr?'ar-KW':'en-US',{hour:'2-digit',minute:'2-digit'})}
                            {' · '}{b.duration_minutes} {isAr?'دقيقة':'min'}
                            {' · '}{b.booking_ref}
                          </div>
                        </div>
                        <span style={{background:statusColor.bg,color:statusColor.color,fontSize:11,fontWeight:700,padding:'4px 12px',borderRadius:20}}>{statusLabel}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══ JOURNAL ═══ */}
          {activePage==='journal' && (
            <div>
              <div style={{background:'white',borderRadius:16,padding:24,boxShadow:'0 4px 16px rgba(26,58,92,.07)',marginBottom:20}}>
                <h3 style={{fontSize:14,fontWeight:700,color:'#1a3a5c',marginBottom:4}}>{isAr?'كتابة مدخل جديد':'Write a New Entry'}</h3>
                <p style={{fontSize:12,color:'#7a9ab8',marginBottom:14}}>{isAr?'مساحتك الخاصة — يراها مختصك فقط':'Your private space — only your specialist can see this'}</p>
                <div style={{display:'flex',gap:8,marginBottom:12}}>
                  {moodEmojis.map((emoji,i)=>(
                    <button key={i} onClick={()=>setTodayMood(i+1)} style={{flex:1,padding:'8px 4px',border:`2px solid ${todayMood===i+1?'#2a6090':'#b8d8ec'}`,borderRadius:10,background:todayMood===i+1?'#eef4fa':'white',cursor:'pointer',fontSize:20,fontFamily:'inherit'}}>
                      {emoji}
                    </button>
                  ))}
                </div>
                <textarea value={journalText} onChange={e=>setJournalText(e.target.value)}
                  placeholder={isAr?'اكتب بحرية...':'Write freely...'}
                  style={{width:'100%',border:'2px solid #b8d8ec',borderRadius:12,padding:'12px 14px',fontSize:14,fontFamily:'inherit',outline:'none',resize:'vertical',minHeight:100,color:'#0f2233',marginBottom:12}}/>
                <button onClick={saveJournal} style={{background:'#2a6090',color:'white',border:'none',borderRadius:20,padding:'11px 24px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
                  💾 {isAr?'حفظ المدخل':'Save Entry'}
                </button>
              </div>
              <div style={{background:'#eafaf3',border:'1px solid rgba(42,154,106,.2)',borderRadius:12,padding:'12px 16px',fontSize:12,color:'#1a6a4a'}}>
                🔒 {isAr?'مدخلاتك خاصة ومشفرة. مختصك يستطيع قراءتها لمساعدتك بشكل أفضل.':'Your entries are private and encrypted. Your specialist can read them to better support you.'}
              </div>
            </div>
          )}

          {/* ═══ PROFILE ═══ */}
          {activePage==='profile' && (
            <div>
              <div style={{background:'linear-gradient(135deg,#1a3a5c,#2a6090)',borderRadius:18,padding:28,marginBottom:20,display:'flex',alignItems:'center',gap:20,color:'white',flexWrap:'wrap'}}>
                <div style={{width:72,height:72,borderRadius:'50%',background:'rgba(255,255,255,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,fontWeight:700,border:'3px solid rgba(255,255,255,.25)',flexShrink:0}}>
                  {profile?.preferred_name?.[0]?.toUpperCase() || '👤'}
                </div>
                <div>
                  <h2 style={{fontSize:20,fontWeight:700,marginBottom:4}}>{profile?.preferred_name}</h2>
                  <p style={{opacity:.75,fontSize:13}}>{isAr?'عميل — وصال الدولية':'Client — Wesal International'}</p>
                  <div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}>
                    <span style={{background:'rgba(255,255,255,.15)',fontSize:11,fontWeight:600,padding:'4px 12px',borderRadius:16}}>🔒 {isAr?'موثق':'Verified'}</span>
                    <span style={{background:'rgba(255,255,255,.15)',fontSize:11,fontWeight:600,padding:'4px 12px',borderRadius:16}}>{bookings.length} {isAr?'جلسات':'Sessions'}</span>
                  </div>
                </div>
              </div>

              <div style={{background:'white',borderRadius:16,padding:24,boxShadow:'0 4px 16px rgba(26,58,92,.07)'}}>
                <h3 style={{fontSize:14,fontWeight:700,color:'#1a3a5c',marginBottom:20}}>{isAr?'المعلومات الشخصية':'Personal Information'}</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                  {[
                    {label:isAr?'الاسم المفضل':'Preferred Name', value:profile?.preferred_name},
                    {label:isAr?'نوع الخدمة':'Service Type', value:profile?.service_type==='social'?(isAr?'إرشاد اجتماعي':'Social Counseling'):profile?.service_type==='addiction'?(isAr?'تأهيل وإدمان':'Rehab & Addiction'):'—'},
                    {label:isAr?'اللغة المفضلة':'Language', value:profile?.language==='ar'?(isAr?'العربية':'Arabic'):profile?.language==='en'?(isAr?'الإنجليزية':'English'):(isAr?'كلتاهما':'Both')},
                    {label:isAr?'المختص المعين':'Assigned Specialist', value:'Khalaf Jalal Alenizi'},
                  ].map((f,i)=>(
                    <div key={i}>
                      <div style={{fontSize:11,fontWeight:600,color:'#7a9ab8',marginBottom:4}}>{f.label}</div>
                      <div style={{fontSize:14,fontWeight:500,color:'#1a3a5c'}}>{f.value || '—'}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:24,paddingTop:20,borderTop:'1px solid #eef4fa',display:'flex',gap:10,flexWrap:'wrap'}}>
                  <button style={{background:'#fef0f0',color:'#e05050',border:'1px solid rgba(224,80,80,.2)',padding:'9px 18px',borderRadius:18,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
                    🗑️ {isAr?'طلب حذف البيانات':'Request Data Deletion'}
                  </button>
                  <button onClick={logout} style={{background:'#eef4fa',color:'#2a6090',border:'1px solid #b8d8ec',padding:'9px 18px',borderRadius:18,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
                    {isAr?'تسجيل الخروج':'Sign Out'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
