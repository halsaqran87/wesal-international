'use client'
import { useState, useEffect } from 'react'

type Profile = { preferred_name: string; service_type: string | null; language: string; role: string }
type Booking = { id: string; scheduled_at: string; service_type: string; method: string; status: string; booking_ref: string; duration_minutes: number }

export default function DashboardPage() {
  const [lang, setLang]           = useState<'ar'|'en'>('ar')
  const [profile, setProfile]     = useState<Profile|null>(null)
  const [userName, setUserName]   = useState('')
  const [bookings, setBookings]   = useState<Booking[]>([])
  const [moodCount, setMoodCount] = useState(0)
  const [todayMood, setTodayMood] = useState<number|null>(null)
  const [journalText, setJournalText] = useState('')
  const [activePage, setActivePage]   = useState('dashboard')
  const [loading, setLoading]     = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isAr = lang === 'ar'

  useEffect(() => {
    async function load() {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const sb = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Get current session
        const { data: { session } } = await sb.auth.getSession()
        if (!session?.user) { window.location.href = '/login'; return }

        const userId = session.user.id

        // Try to get profile using the session token
        const { data: p, error: pErr } = await sb
          .from('profiles')
          .select('preferred_name, service_type, language, role')
          .eq('id', userId)
          .single()

        if (p && !pErr) {
          setProfile(p)
          setUserName(p.preferred_name)
          if (p.language === 'en') setLang('en')
          // Redirect consultant to their portal
          if (p.role === 'consultant') { window.location.href = '/consultant'; return }
        } else {
          // Fallback: use email prefix as name
          const emailName = session.user.email?.split('@')[0] || 'User'
          setUserName(emailName)
        }

        // Get bookings
        const { data: b } = await sb
          .from('bookings')
          .select('id, scheduled_at, service_type, method, status, booking_ref, duration_minutes')
          .eq('client_id', userId)
          .order('scheduled_at', { ascending: false })
          .limit(20)
        if (b) setBookings(b)

        // Get mood count
        const { count } = await sb
          .from('mood_entries')
          .select('*', { count: 'exact', head: true })
          .eq('client_id', userId)
        if (count) setMoodCount(count)

      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function saveMood(mood: number) {
    setTodayMood(mood)
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      const { data: { session } } = await sb.auth.getSession()
      if (session?.user) {
        await sb.from('mood_entries').insert({ client_id: session.user.id, mood })
        setMoodCount(c => c + 1)
      }
    } catch {}
  }

  async function saveJournal() {
    if (!journalText.trim()) return
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      const { data: { session } } = await sb.auth.getSession()
      if (session?.user) {
        await sb.from('journal_entries').insert({
          client_id: session.user.id,
          content: journalText,
          mood: todayMood ? ['😔','😐','🙂','😄'][todayMood-1] : null
        })
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
  const moodEmojis  = ['😔','😐','🙂','😄']
  const moodLabels  = isAr ? ['منخفض','عادي','جيد','رائع'] : ['Low','Okay','Good','Great']

  const navItems = [
    { id:'dashboard',    icon:'🏠', en:'Dashboard',       ar:'لوحة التحكم' },
    { id:'appointments', icon:'📅', en:'My Appointments', ar:'مواعيدي' },
    { id:'journal',      icon:'📓', en:'My Journal',      ar:'مذكراتي' },
    { id:'profile',      icon:'👤', en:'My Profile',      ar:'ملفي' },
  ]

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#eef4fa',fontFamily:'Tajawal,sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:36,marginBottom:12,animation:'spin 1s linear infinite'}}>⏳</div>
        <p style={{color:'#2a6090',fontWeight:600,fontSize:14}}>{isAr?'جارٍ التحميل...':'Loading...'}</p>
      </div>
    </div>
  )

  const displayName = userName || (isAr ? 'المستخدم' : 'User')

  return (
    <div dir={isAr?'rtl':'ltr'} style={{display:'flex',minHeight:'100vh',fontFamily:isAr?'Tajawal,sans-serif':'Montserrat,sans-serif',background:'#f7fafd'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=Montserrat:wght@400;500;600;700&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        .sidebar{position:fixed;top:0;width:240px;min-height:100vh;background:linear-gradient(180deg,#0f2233,#1a3a5c);display:flex;flex-direction:column;z-index:50;transition:transform .3s;}
        @media(max-width:768px){
          .sidebar{transform:translateX(${isAr?'100%':'-100%'});}
          .sidebar.open{transform:translateX(0);}
          .main-wrap{margin-left:0!important;margin-right:0!important;}
        }
      `}</style>

      {sidebarOpen && <div onClick={()=>setSidebarOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.4)',zIndex:49}}/>}

      {/* ── SIDEBAR ── */}
      <aside className={`sidebar${sidebarOpen?' open':''}`} style={{[isAr?'right':'left']:0}}>
        <div style={{padding:'18px 14px',borderBottom:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',gap:10}}>
          <svg width="32" height="32" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="38" fill="rgba(255,255,255,.08)"/>
            <clipPath id="sl"><circle cx="40" cy="40" r="35"/></clipPath>
            <path d="M40 8 L40 26 Q35 26 33 30 Q31 35 36 37 Q41 39 40 40 L18 40 L18 22 Q23 22 25 18 Q27 13 22 11 Q17 9 18 8Z" fill="#4a90c4" clipPath="url(#sl)"/>
            <path d="M40 8 L62 8 Q61 9 56 11 Q51 13 53 18 Q55 22 60 22 L62 40 L40 40 Q39 39 44 37 Q49 35 47 30 Q45 26 40 26Z" fill="#7ab5d8" clipPath="url(#sl)"/>
            <path d="M18 40 L40 40 Q40 41 36 43 Q31 45 33 50 Q35 54 40 54 L40 72 L18 72 Q18 62 23 60 Q28 58 26 53 Q24 48 18 50Z" fill="#b8d8ec" clipPath="url(#sl)"/>
            <path d="M40 40 L62 40 Q56 38 54 43 Q52 48 57 53 Q62 58 62 72 L40 72 L40 54 Q45 54 47 50 Q49 45 44 43 Q39 41 40 40Z" fill="rgba(255,255,255,.2)" clipPath="url(#sl)"/>
          </svg>
          <div><div style={{fontWeight:800,fontSize:12,color:'white',letterSpacing:1}}>WESAL</div><div style={{fontSize:8,color:'#b8d8ec',letterSpacing:'2px',textTransform:'uppercase'}}>{isAr?'بوابة العميل':'Client Portal'}</div></div>
        </div>

        <div style={{padding:'12px 14px',borderBottom:'1px solid rgba(255,255,255,.07)',display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#4a90c4,#2a6090)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:700,color:'white',flexShrink:0}}>
            {displayName[0]?.toUpperCase()}
          </div>
          <div><div style={{fontSize:13,fontWeight:600,color:'white',lineHeight:1.2}}>{displayName}</div><div style={{fontSize:10,color:'#b8d8ec',marginTop:3}}>{isAr?'عميل':'Client'}</div></div>
        </div>

        <nav style={{flex:1,padding:'6px 0'}}>
          {navItems.map(item=>(
            <div key={item.id} onClick={()=>{setActivePage(item.id);setSidebarOpen(false)}}
              style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',cursor:'pointer',color:activePage===item.id?'white':'rgba(255,255,255,.55)',fontSize:13,fontWeight:500,background:activePage===item.id?'rgba(255,255,255,.1)':'transparent',[isAr?'borderRight':'borderLeft']:`3px solid ${activePage===item.id?'#4a90c4':'transparent'}`,transition:'all .2s'}}>
              <span style={{fontSize:15}}>{item.icon}</span>
              <span>{isAr?item.ar:item.en}</span>
            </div>
          ))}
        </nav>

        <div style={{padding:12,borderTop:'1px solid rgba(255,255,255,.08)',display:'flex',flexDirection:'column',gap:8}}>
          <a href="/book" style={{display:'block',background:'#4a90c4',color:'white',borderRadius:10,padding:'10px',fontSize:13,fontWeight:600,textAlign:'center',textDecoration:'none'}}>
            ＋ {isAr?'حجز جلسة جديدة':'Book New Session'}
          </a>
          <button onClick={logout} style={{background:'rgba(255,255,255,.07)',border:'none',color:'rgba(255,255,255,.5)',borderRadius:10,padding:'8px',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
            {isAr?'تسجيل الخروج':'Sign Out'}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="main-wrap" style={{flex:1,[isAr?'marginRight':'marginLeft']:240}}>
        {/* Topbar */}
        <div style={{background:'white',borderBottom:'1px solid rgba(74,144,196,.1)',padding:'13px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:40,boxShadow:'0 2px 10px rgba(26,58,92,.05)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <button onClick={()=>setSidebarOpen(!sidebarOpen)} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#1a3a5c',padding:4}}>☰</button>
            <div>
              <h2 style={{fontSize:16,fontWeight:700,color:'#1a3a5c'}}>{navItems.find(s=>s.id===activePage)?.[isAr?'ar':'en']}</h2>
              <p style={{fontSize:11,color:'#7a9ab8',marginTop:1}}>{isAr?`مرحباً، ${displayName}`:`Welcome, ${displayName}`}</p>
            </div>
          </div>
          <button onClick={()=>setLang(isAr?'en':'ar')} style={{background:'#eef4fa',border:'1px solid #b8d8ec',color:'#2a6090',fontSize:11,fontWeight:600,padding:'6px 12px',borderRadius:14,cursor:'pointer',fontFamily:'inherit'}}>
            {isAr?'English':'العربية'}
          </button>
        </div>

        <div style={{padding:20}}>

          {/* ═══ DASHBOARD HOME ═══ */}
          {activePage==='dashboard' && <>
            {/* Stats */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:14,marginBottom:20}}>
              {[
                {icon:'📅',num:bookings.length,label:isAr?'إجمالي الجلسات':'Total Sessions',bg:'#eef4fa'},
                {icon:'⏳',num:upcoming.length,label:isAr?'جلسات قادمة':'Upcoming',bg:'#eafaf3'},
                {icon:'✅',num:bookings.filter(b=>b.status==='completed').length,label:isAr?'مكتملة':'Completed',bg:'#f0f7ff'},
                {icon:'😊',num:moodCount,label:isAr?'تسجيلات المزاج':'Mood Logs',bg:'#fdf6e8'},
              ].map((s,i)=>(
                <div key={i} style={{background:'white',borderRadius:14,padding:18,boxShadow:'0 4px 14px rgba(26,58,92,.07)',display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:44,height:44,borderRadius:10,background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{s.icon}</div>
                  <div><div style={{fontSize:24,fontWeight:800,color:'#1a3a5c',lineHeight:1}}>{s.num}</div><div style={{fontSize:11,color:'#7a9ab8',marginTop:3}}>{s.label}</div></div>
                </div>
              ))}
            </div>

            {/* Next session or book CTA */}
            {upcoming.length > 0 ? (
              <div style={{background:'linear-gradient(135deg,#1a3a5c,#2a6090)',borderRadius:16,padding:24,marginBottom:20,color:'white'}}>
                <div style={{fontSize:10,fontWeight:600,letterSpacing:2,opacity:.6,textTransform:'uppercase',marginBottom:8}}>{isAr?'الجلسة القادمة':'NEXT SESSION'}</div>
                <h3 style={{fontSize:17,fontWeight:700,marginBottom:8}}>
                  {upcoming[0].service_type==='social'?(isAr?'إرشاد اجتماعي':'Social Counseling'):(isAr?'تأهيل وعلاج إدمان':'Rehab & Addiction')}
                </h3>
                <p style={{opacity:.8,fontSize:13,marginBottom:14}}>
                  📅 {new Date(upcoming[0].scheduled_at).toLocaleDateString(isAr?'ar-KW':'en-US',{weekday:'long',month:'long',day:'numeric'})}
                  {' · '}
                  {new Date(upcoming[0].scheduled_at).toLocaleTimeString(isAr?'ar-KW':'en-US',{hour:'2-digit',minute:'2-digit'})}
                </p>
                <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                  <span style={{background:'rgba(255,255,255,.12)',padding:'4px 12px',borderRadius:16,fontSize:12,fontWeight:600}}>
                    {upcoming[0].method==='video'?(isAr?'🎥 مكالمة فيديو':'🎥 Video Call'):(isAr?'💬 واتساب':'💬 WhatsApp')}
                  </span>
                  <span style={{background:'rgba(255,255,255,.12)',padding:'4px 12px',borderRadius:16,fontSize:12,fontWeight:600}}>
                    ⏱️ {upcoming[0].duration_minutes} {isAr?'دقيقة':'min'}
                  </span>
                  <span style={{background:'rgba(255,255,255,.12)',padding:'4px 12px',borderRadius:16,fontSize:12,fontWeight:600}}>
                    🔖 {upcoming[0].booking_ref}
                  </span>
                </div>
                <a href="/book" style={{display:'inline-block',background:'white',color:'#1a3a5c',padding:'9px 20px',borderRadius:18,fontSize:13,fontWeight:700,textDecoration:'none',marginTop:16}}>
                  {isAr?'🎥 انضم للجلسة':'🎥 Join Session'}
                </a>
              </div>
            ) : (
              <div style={{background:'linear-gradient(135deg,#1a3a5c,#2a6090)',borderRadius:16,padding:24,marginBottom:20,color:'white',textAlign:'center'}}>
                <div style={{fontSize:32,marginBottom:10}}>📅</div>
                <h3 style={{fontSize:17,fontWeight:700,marginBottom:6}}>{isAr?'لا توجد جلسات قادمة':'No Upcoming Sessions'}</h3>
                <p style={{opacity:.7,fontSize:13,marginBottom:14}}>{isAr?'احجز جلستك الأولى الآن':'Book your first session now'}</p>
                <a href="/book" style={{display:'inline-block',background:'white',color:'#1a3a5c',padding:'10px 24px',borderRadius:18,fontSize:13,fontWeight:700,textDecoration:'none'}}>
                  {isAr?'احجز الآن':'Book Now'}
                </a>
              </div>
            )}

            {/* Mood */}
            <div style={{background:'white',borderRadius:14,padding:20,boxShadow:'0 4px 14px rgba(26,58,92,.07)',marginBottom:20}}>
              <h3 style={{fontSize:14,fontWeight:700,color:'#1a3a5c',marginBottom:3}}>{isAr?'تسجيل مزاج اليوم':'Today\'s Mood Check-In'}</h3>
              <p style={{fontSize:12,color:'#7a9ab8',marginBottom:14}}>{isAr?'كيف تشعر الآن؟':'How are you feeling right now?'}</p>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {moodEmojis.map((emoji,i)=>(
                  <button key={i} onClick={()=>saveMood(i+1)}
                    style={{flex:1,minWidth:60,padding:'11px 6px',border:`2px solid ${todayMood===i+1?'#2a6090':'#b8d8ec'}`,borderRadius:12,background:todayMood===i+1?'#eef4fa':'white',cursor:'pointer',textAlign:'center',fontFamily:'inherit',transition:'all .2s'}}>
                    <div style={{fontSize:22,marginBottom:4}}>{emoji}</div>
                    <div style={{fontSize:10,fontWeight:600,color:todayMood===i+1?'#2a6090':'#7a9ab8'}}>{moodLabels[i]}</div>
                  </button>
                ))}
              </div>
              {todayMood && <p style={{fontSize:12,color:'#2a9a6a',marginTop:10,fontWeight:600}}>✓ {isAr?'تم تسجيل مزاجك':'Mood saved'}</p>}
            </div>

            <div style={{background:'#eafaf3',border:'1px solid rgba(42,154,106,.2)',borderRadius:12,padding:'14px 16px',display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontSize:20}}>🔒</span>
              <p style={{fontSize:12,color:'#1a6a4a',lineHeight:1.6}}>{isAr?'جميع بياناتك ومذكراتك وجلساتك سرية تماماً ولن تُشارك مع أي شخص.':'All your data, journals, and sessions are strictly confidential and never shared.'}</p>
            </div>
          </>}

          {/* ═══ APPOINTMENTS ═══ */}
          {activePage==='appointments' && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <h3 style={{fontSize:15,fontWeight:700,color:'#1a3a5c'}}>{isAr?'جميع المواعيد':'All Appointments'}</h3>
                <a href="/book" style={{background:'#2a6090',color:'white',padding:'8px 18px',borderRadius:18,fontSize:12,fontWeight:600,textDecoration:'none'}}>＋ {isAr?'حجز جديد':'New Booking'}</a>
              </div>
              {bookings.length===0 ? (
                <div style={{background:'white',borderRadius:14,padding:40,textAlign:'center',boxShadow:'0 4px 14px rgba(26,58,92,.07)'}}>
                  <div style={{fontSize:40,marginBottom:12}}>📅</div>
                  <h4 style={{fontSize:15,fontWeight:600,color:'#1a3a5c',marginBottom:6}}>{isAr?'لا توجد مواعيد بعد':'No appointments yet'}</h4>
                  <a href="/book" style={{display:'inline-block',background:'#2a6090',color:'white',padding:'10px 22px',borderRadius:18,fontSize:13,fontWeight:600,textDecoration:'none',marginTop:10}}>
                    {isAr?'احجز الآن':'Book Now'}
                  </a>
                </div>
              ) : (
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {bookings.map(b=>{
                    const sc = b.status==='confirmed'||b.status==='pending' ? {bg:'#eef4fa',c:'#2a6090',lbl:isAr?'قادم':'Upcoming'}
                             : b.status==='completed' ? {bg:'#eafaf3',c:'#2a9a6a',lbl:isAr?'مكتملة':'Completed'}
                             : {bg:'#fef0f0',c:'#e05050',lbl:isAr?'ملغاة':'Cancelled'}
                    return (
                      <div key={b.id} style={{background:'white',borderRadius:12,padding:16,boxShadow:'0 4px 14px rgba(26,58,92,.07)',display:'flex',alignItems:'center',gap:14,flexWrap:'wrap'}}>
                        <div style={{width:48,height:48,borderRadius:10,background:sc.c,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'white',flexShrink:0}}>
                          <div style={{fontSize:17,fontWeight:800,lineHeight:1}}>{new Date(b.scheduled_at).getDate()}</div>
                          <div style={{fontSize:8,fontWeight:600,opacity:.8}}>{new Date(b.scheduled_at).toLocaleString('en',{month:'short'}).toUpperCase()}</div>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:700,color:'#1a3a5c',marginBottom:3}}>
                            {b.service_type==='social'?(isAr?'إرشاد اجتماعي':'Social Counseling'):(isAr?'تأهيل وعلاج إدمان':'Rehab & Addiction')}
                            {' · '}{b.method==='video'?(isAr?'فيديو':'Video'):(isAr?'واتساب':'WhatsApp')}
                          </div>
                          <div style={{fontSize:11,color:'#7a9ab8'}}>
                            {new Date(b.scheduled_at).toLocaleTimeString(isAr?'ar-KW':'en-US',{hour:'2-digit',minute:'2-digit'})}
                            {' · '}{b.duration_minutes}{isAr?' دق':' min'}
                            {' · '}{b.booking_ref}
                          </div>
                        </div>
                        <span style={{background:sc.bg,color:sc.c,fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:16}}>{sc.lbl}</span>
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
              <div style={{background:'white',borderRadius:14,padding:20,boxShadow:'0 4px 14px rgba(26,58,92,.07)',marginBottom:16}}>
                <h3 style={{fontSize:14,fontWeight:700,color:'#1a3a5c',marginBottom:3}}>{isAr?'كتابة مدخل جديد':'Write a New Entry'}</h3>
                <p style={{fontSize:12,color:'#7a9ab8',marginBottom:12}}>{isAr?'مساحتك الخاصة — يراها مختصك فقط':'Your private space — only your specialist can see this'}</p>
                <div style={{display:'flex',gap:8,marginBottom:12}}>
                  {moodEmojis.map((emoji,i)=>(
                    <button key={i} onClick={()=>setTodayMood(i+1)}
                      style={{flex:1,padding:'8px 4px',border:`2px solid ${todayMood===i+1?'#2a6090':'#b8d8ec'}`,borderRadius:10,background:todayMood===i+1?'#eef4fa':'white',cursor:'pointer',fontSize:20,fontFamily:'inherit'}}>
                      {emoji}
                    </button>
                  ))}
                </div>
                <textarea value={journalText} onChange={e=>setJournalText(e.target.value)}
                  placeholder={isAr?'اكتب بحرية...':'Write freely...'}
                  style={{width:'100%',border:'2px solid #b8d8ec',borderRadius:10,padding:'11px 13px',fontSize:13,fontFamily:'inherit',outline:'none',resize:'vertical',minHeight:90,color:'#0f2233',marginBottom:10}}/>
                <button onClick={saveJournal} style={{background:'#2a6090',color:'white',border:'none',borderRadius:18,padding:'10px 22px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
                  💾 {isAr?'حفظ المدخل':'Save Entry'}
                </button>
              </div>
              <div style={{background:'#eafaf3',border:'1px solid rgba(42,154,106,.2)',borderRadius:10,padding:'11px 14px',fontSize:12,color:'#1a6a4a'}}>
                🔒 {isAr?'مدخلاتك خاصة ومشفرة. مختصك يستطيع قراءتها لمساعدتك بشكل أفضل.':'Your entries are private. Your specialist can read them to better support you.'}
              </div>
            </div>
          )}

          {/* ═══ PROFILE ═══ */}
          {activePage==='profile' && (
            <div>
              <div style={{background:'linear-gradient(135deg,#1a3a5c,#2a6090)',borderRadius:16,padding:24,marginBottom:16,display:'flex',alignItems:'center',gap:18,color:'white',flexWrap:'wrap'}}>
                <div style={{width:64,height:64,borderRadius:'50%',background:'rgba(255,255,255,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:700,border:'3px solid rgba(255,255,255,.25)',flexShrink:0}}>
                  {displayName[0]?.toUpperCase()}
                </div>
                <div>
                  <h2 style={{fontSize:18,fontWeight:700,marginBottom:4}}>{displayName}</h2>
                  <p style={{opacity:.75,fontSize:13}}>{isAr?'عميل — وصال الدولية':'Client — Wesal International'}</p>
                  <div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}>
                    <span style={{background:'rgba(255,255,255,.15)',fontSize:10,fontWeight:600,padding:'3px 10px',borderRadius:14}}>🔒 {isAr?'موثق':'Verified'}</span>
                    <span style={{background:'rgba(255,255,255,.15)',fontSize:10,fontWeight:600,padding:'3px 10px',borderRadius:14}}>{bookings.length} {isAr?'جلسات':'Sessions'}</span>
                  </div>
                </div>
              </div>
              <div style={{background:'white',borderRadius:14,padding:20,boxShadow:'0 4px 14px rgba(26,58,92,.07)'}}>
                <h3 style={{fontSize:14,fontWeight:700,color:'#1a3a5c',marginBottom:16}}>{isAr?'المعلومات الشخصية':'Personal Information'}</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:20}}>
                  {[
                    {label:isAr?'الاسم المفضل':'Preferred Name', value:displayName},
                    {label:isAr?'نوع الخدمة':'Service Type', value:profile?.service_type==='social'?(isAr?'إرشاد اجتماعي':'Social Counseling'):profile?.service_type==='addiction'?(isAr?'تأهيل وإدمان':'Rehab & Addiction'):'—'},
                    {label:isAr?'اللغة المفضلة':'Language', value:profile?.language==='ar'?(isAr?'العربية':'Arabic'):profile?.language==='en'?(isAr?'الإنجليزية':'English'):(isAr?'كلتاهما':'Both')},
                    {label:isAr?'المختص المعين':'Assigned Specialist', value:'Khalaf Jalal Alenizi'},
                  ].map((f,i)=>(
                    <div key={i}>
                      <div style={{fontSize:10,fontWeight:600,color:'#7a9ab8',marginBottom:4,textTransform:'uppercase',letterSpacing:.5}}>{f.label}</div>
                      <div style={{fontSize:14,fontWeight:500,color:'#1a3a5c'}}>{f.value || '—'}</div>
                    </div>
                  ))}
                </div>
                <div style={{paddingTop:16,borderTop:'1px solid #eef4fa',display:'flex',gap:10,flexWrap:'wrap'}}>
                  <button style={{background:'#fef0f0',color:'#e05050',border:'1px solid rgba(224,80,80,.2)',padding:'8px 16px',borderRadius:16,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
                    🗑️ {isAr?'طلب حذف البيانات':'Request Data Deletion'}
                  </button>
                  <button onClick={logout} style={{background:'#eef4fa',color:'#2a6090',border:'1px solid #b8d8ec',padding:'8px 16px',borderRadius:16,fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
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
