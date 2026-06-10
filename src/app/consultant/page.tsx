'use client'
import { useState, useEffect } from 'react'

type Client = { id:string; preferred_name:string; service_type:string|null; language:string; whatsapp:string|null; email:string|null; age:number|null; gender:string|null; created_at:string }
type Booking = { id:string; client_id:string; service_type:string; method:string; duration_minutes:number; price_kwd:number; scheduled_at:string; status:string; booking_ref:string; profiles?:{preferred_name:string} }
type Survey = { id:string; answers:Record<string,unknown>; stress_score:number|null; created_at:string }
type Note = { id:string; content:string; created_at:string }

export default function ConsultantPortal() {
  const [lang, setLang]           = useState<'ar'|'en'>('ar')
  const [page, setPage]           = useState('dashboard')
  const [loading, setLoading]     = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [clients, setClients]     = useState<Client[]>([])
  const [bookings, setBookings]   = useState<Booking[]>([])
  const [selClient, setSelClient] = useState<Client|null>(null)
  const [clientBookings, setClientBookings] = useState<Booking[]>([])
  const [clientSurvey, setClientSurvey]     = useState<Survey|null>(null)
  const [clientNotes, setClientNotes]       = useState<Note[]>([])
  const [newNote, setNewNote]     = useState('')
  const [aiMessages, setAiMessages] = useState<{role:string;text:string}[]>([{role:'ai',text:'مرحباً خلف! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟\n\nHello Khalaf! I\'m your AI assistant. How can I help?'}])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiInput, setAiInput]     = useState('')
  const isAr = lang === 'ar'

  useEffect(() => { loadData() }, [])

  async function getSB() {
    const { createClient } = await import('@supabase/supabase-js')
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  }

  async function loadData() {
    try {
      const sb = await getSB()
      const { data: { session } } = await sb.auth.getSession()
      if (!session?.user) { window.location.href = '/login'; return }

      // Verify role via API (bypasses RLS)
      const res = await fetch('/api/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id })
      })
      const { role } = await res.json()
      if (role !== 'consultant') { window.location.href = '/dashboard'; return }

      // Load clients via API (bypasses RLS)
      const clientsRes = await fetch('/api/consultant/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id })
      })
      const clientsData = await clientsRes.json()
      if (clientsData.clients) setClients(clientsData.clients)
      if (clientsData.bookings) setBookings(clientsData.bookings)

    } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function openClient(client: Client) {
    setSelClient(client)
    setPage('client-profile')
    setClientBookings([])
    setClientSurvey(null)
    setClientNotes([])

    const res = await fetch('/api/consultant/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: client.id })
    })
    const data = await res.json()
    if (data.clientBookings) setClientBookings(data.clientBookings)
    if (data.survey) setClientSurvey(data.survey)
    if (data.notes) setClientNotes(data.notes)
  }

  async function saveNote() {
    if (!newNote.trim() || !selClient) return
    const sb = await getSB()
    const { data: { session } } = await sb.auth.getSession()
    if (!session?.user) return
    const { data } = await sb.from('session_notes').insert({
      booking_id: clientBookings[0]?.id || null,
      consultant_id: session.user.id,
      client_id: selClient.id,
      content: newNote,
      is_ai_assisted: false,
    }).select().single()
    if (data) { setClientNotes(n => [data, ...n]); setNewNote('') }
  }

  async function askAI(question?: string) {
    const q = question || aiInput.trim()
    if (!q) return
    setAiInput('')
    setAiLoading(true)
    setAiMessages(m => [...m, { role:'user', text:q }])
    try {
      const context = selClient ? `Client: ${selClient.preferred_name}, Service: ${selClient.service_type}, Sessions: ${clientBookings.length}, Stress: ${clientSurvey?.stress_score}/10, Reason: ${clientSurvey?.answers?.reason || 'N/A'}` : `Clients: ${clients.length}, Bookings: ${bookings.length}`
      const res = await fetch('/api/ai', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'ask', question:q, clientContext:context }) })
      const data = await res.json()
      setAiMessages(m => [...m, { role:'ai', text: data.result || 'Error getting response' }])
    } catch {
      setAiMessages(m => [...m, { role:'ai', text: 'Could not connect to AI assistant.' }])
    }
    setAiLoading(false)
  }

  async function logout() {
    const sb = await getSB()
    await sb.auth.signOut()
    window.location.href = '/'
  }

  const todayBookings    = bookings.filter(b => new Date(b.scheduled_at).toDateString() === new Date().toDateString())
  const upcomingBookings = bookings.filter(b => new Date(b.scheduled_at) > new Date() && b.status === 'confirmed')

  const navItems = [
    { id:'dashboard', icon:'🏠', en:'Dashboard',    ar:'لوحة التحكم' },
    { id:'clients',   icon:'👥', en:'All Clients',  ar:'جميع العملاء' },
    { id:'schedule',  icon:'📅', en:'Schedule',     ar:'الجدول' },
    { id:'ai',        icon:'🤖', en:'AI Assistant', ar:'المساعد الذكي' },
  ]

  const inp  = {width:'100%',border:'2px solid #b8d8ec',borderRadius:10,padding:'11px 14px',fontSize:13,fontFamily:'inherit',outline:'none',color:'#0f2233',background:'white'} as React.CSSProperties
  const card = {background:'white',borderRadius:16,padding:20,boxShadow:'0 4px 16px rgba(26,58,92,.07)',marginBottom:16} as React.CSSProperties

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#eef4fa',fontFamily:'Tajawal,sans-serif'}}>
      <div style={{textAlign:'center'}}><div style={{fontSize:36,marginBottom:12}}>⏳</div><p style={{color:'#2a6090',fontWeight:600}}>{isAr?'جارٍ التحميل...':'Loading...'}</p></div>
    </div>
  )

  return (
    <div dir={isAr?'rtl':'ltr'} style={{display:'flex',minHeight:'100vh',fontFamily:isAr?'Tajawal,sans-serif':'Montserrat,sans-serif',background:'#f7fafd'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=Montserrat:wght@400;500;600;700&display=swap');*{margin:0;padding:0;box-sizing:border-box;}.sidebar{position:fixed;top:0;width:250px;min-height:100vh;background:linear-gradient(180deg,#0a1a2a,#1a3a5c);display:flex;flex-direction:column;z-index:50;transition:transform .3s;}@media(max-width:768px){.sidebar{transform:translateX(${isAr?'100%':'-100%'})}.sidebar.open{transform:translateX(0)}.mc{margin-left:0!important;margin-right:0!important;}}.ai-bubble{white-space:pre-wrap;word-break:break-word;}`}</style>

      {sidebarOpen && <div onClick={()=>setSidebarOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:49}}/>}

      <aside className={`sidebar${sidebarOpen?' open':''}`} style={{[isAr?'right':'left']:0}}>
        <div style={{padding:'18px 14px',borderBottom:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',gap:10}}>
          <svg width="34" height="34" viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="38" fill="rgba(255,255,255,.08)"/><clipPath id="cs"><circle cx="40" cy="40" r="35"/></clipPath><path d="M40 8 L40 26 Q35 26 33 30 Q31 35 36 37 Q41 39 40 40 L18 40 L18 22 Q23 22 25 18 Q27 13 22 11 Q17 9 18 8Z" fill="#4a90c4" clipPath="url(#cs)"/><path d="M40 8 L62 8 Q61 9 56 11 Q51 13 53 18 Q55 22 60 22 L62 40 L40 40 Q39 39 44 37 Q49 35 47 30 Q45 26 40 26Z" fill="#7ab5d8" clipPath="url(#cs)"/><path d="M18 40 L40 40 Q40 41 36 43 Q31 45 33 50 Q35 54 40 54 L40 72 L18 72 Q18 62 23 60 Q28 58 26 53 Q24 48 18 50Z" fill="#b8d8ec" clipPath="url(#cs)"/><path d="M40 40 L62 40 Q56 38 54 43 Q52 48 57 53 Q62 58 62 72 L40 72 L40 54 Q45 54 47 50 Q49 45 44 43 Q39 41 40 40Z" fill="rgba(255,255,255,.2)" clipPath="url(#cs)"/></svg>
          <div><div style={{fontWeight:800,fontSize:12,color:'white',letterSpacing:1}}>WESAL</div><div style={{fontSize:8,color:'#b8d8ec',letterSpacing:'2px',textTransform:'uppercase'}}>{isAr?'بوابة المختص':'Consultant Portal'}</div></div>
        </div>
        <div style={{padding:'12px 14px',borderBottom:'1px solid rgba(255,255,255,.07)',display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#4a90c4,#1a3a5c)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,color:'white',flexShrink:0}}>👨‍⚕️</div>
          <div><div style={{fontSize:12,fontWeight:700,color:'white'}}>Khalaf J. Alenizi</div><div style={{fontSize:9,color:'#4aba8a',marginTop:2,display:'flex',alignItems:'center',gap:4}}><span style={{width:5,height:5,borderRadius:'50%',background:'#4aba8a',display:'inline-block'}}/>{isAr?'متصل':'Online'}</div></div>
        </div>
        <nav style={{flex:1,padding:'6px 0'}}>
          {navItems.map(item=>(
            <div key={item.id} onClick={()=>{setPage(item.id);setSelClient(null);setSidebarOpen(false)}}
              style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',cursor:'pointer',color:page===item.id?'white':'rgba(255,255,255,.55)',fontSize:13,fontWeight:500,background:page===item.id?'rgba(255,255,255,.1)':'transparent',[isAr?'borderRight':'borderLeft']:`3px solid ${page===item.id?'#4a90c4':'transparent'}`,transition:'all .2s'}}>
              <span style={{fontSize:15}}>{item.icon}</span><span>{isAr?item.ar:item.en}</span>
              {item.id==='clients'&&clients.length>0&&<span style={{marginLeft:'auto',background:'#4a90c4',color:'white',fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:8}}>{clients.length}</span>}
            </div>
          ))}
        </nav>
        <div style={{padding:12,borderTop:'1px solid rgba(255,255,255,.08)',display:'flex',flexDirection:'column',gap:8}}>
          <a href="/" style={{display:'block',background:'rgba(255,255,255,.07)',color:'rgba(255,255,255,.6)',borderRadius:10,padding:'8px',fontSize:12,textAlign:'center',textDecoration:'none'}}>🌐 {isAr?'عرض الموقع':'View Site'}</a>
          <button onClick={logout} style={{background:'rgba(255,255,255,.07)',border:'none',color:'rgba(255,255,255,.5)',borderRadius:10,padding:'8px',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>{isAr?'تسجيل الخروج':'Sign Out'}</button>
        </div>
      </aside>

      <div className="mc" style={{flex:1,[isAr?'marginRight':'marginLeft']:250}}>
        <div style={{background:'white',borderBottom:'1px solid rgba(74,144,196,.1)',padding:'13px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:40,boxShadow:'0 2px 10px rgba(26,58,92,.05)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <button onClick={()=>setSidebarOpen(!sidebarOpen)} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#1a3a5c',padding:4}}>☰</button>
            <div>
              <h2 style={{fontSize:16,fontWeight:700,color:'#1a3a5c'}}>{page==='client-profile'&&selClient?selClient.preferred_name:navItems.find(n=>n.id===page)?.[isAr?'ar':'en']||'Portal'}</h2>
              <p style={{fontSize:11,color:'#7a9ab8',marginTop:1}}>{new Date().toLocaleDateString(isAr?'ar-KW':'en-US',{weekday:'long',month:'long',day:'numeric'})} · {todayBookings.length} {isAr?'جلسات اليوم':'sessions today'}</p>
            </div>
          </div>
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <div style={{display:'flex',alignItems:'center',gap:6,background:'#eef0ff',border:'1px solid rgba(90,122,255,.2)',color:'#5a7aff',fontSize:11,fontWeight:700,padding:'5px 12px',borderRadius:12}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'#5a7aff'}}/>AI Active
            </div>
            <button onClick={()=>setLang(isAr?'en':'ar')} style={{background:'#eef4fa',border:'1px solid #b8d8ec',color:'#2a6090',fontSize:11,fontWeight:600,padding:'6px 12px',borderRadius:14,cursor:'pointer',fontFamily:'inherit'}}>{isAr?'English':'العربية'}</button>
          </div>
        </div>

        <div style={{padding:20}}>

          {/* DASHBOARD */}
          {page==='dashboard'&&(
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:14,marginBottom:20}}>
                {[{icon:'👥',num:clients.length,label:isAr?'إجمالي العملاء':'Total Clients',bg:'#eef4fa'},{icon:'📅',num:upcomingBookings.length,label:isAr?'جلسات قادمة':'Upcoming',bg:'#eafaf3'},{icon:'🗓️',num:todayBookings.length,label:isAr?'جلسات اليوم':'Today',bg:'#fff8e8'},{icon:'💰',num:bookings.filter(b=>b.status==='completed').length*25,label:isAr?'إيرادات تقديرية':'Est. Revenue KWD',bg:'#f0ecff'}].map((s,i)=>(
                  <div key={i} style={{background:'white',borderRadius:14,padding:18,boxShadow:'0 4px 14px rgba(26,58,92,.07)',display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:44,height:44,borderRadius:10,background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{s.icon}</div>
                    <div><div style={{fontSize:24,fontWeight:800,color:'#1a3a5c',lineHeight:1}}>{s.num}</div><div style={{fontSize:10,color:'#7a9ab8',marginTop:3}}>{s.label}</div></div>
                  </div>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                <div style={card}>
                  <h3 style={{fontSize:14,fontWeight:700,color:'#1a3a5c',marginBottom:14}}>{isAr?'جلسات اليوم':'Today\'s Sessions'}</h3>
                  {todayBookings.length===0?<div style={{textAlign:'center',padding:'16px 0',color:'#7a9ab8',fontSize:13}}>{isAr?'لا توجد جلسات اليوم':'No sessions today'}</div>:
                  todayBookings.map(b=>(
                    <div key={b.id} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:'1px solid #eef4fa'}}>
                      <div style={{width:38,height:38,borderRadius:8,background:'#2a6090',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:10,fontWeight:700,flexShrink:0,textAlign:'center',lineHeight:1.2,padding:4}}>
                        {new Date(b.scheduled_at).toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'})}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:600,color:'#1a3a5c'}}>{(b.profiles as {preferred_name:string}|undefined)?.preferred_name||'Client'}</div>
                        <div style={{fontSize:11,color:'#7a9ab8'}}>{b.method==='video'?'🎥':'💬'} {b.duration_minutes}{isAr?' دق':' min'}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={card}>
                  <h3 style={{fontSize:14,fontWeight:700,color:'#1a3a5c',marginBottom:14}}>{isAr?'أحدث العملاء':'Recent Clients'}</h3>
                  {clients.length===0?<div style={{textAlign:'center',padding:'16px 0',color:'#7a9ab8',fontSize:13}}>{isAr?'لا يوجد عملاء بعد':'No clients yet'}</div>:
                  clients.slice(0,5).map(c=>(
                    <div key={c.id} onClick={()=>openClient(c)} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:'1px solid #eef4fa',cursor:'pointer'}}>
                      <div style={{width:34,height:34,borderRadius:'50%',background:'linear-gradient(135deg,#4a90c4,#2a6090)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:14,fontWeight:700,flexShrink:0}}>{c.preferred_name[0]?.toUpperCase()}</div>
                      <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:'#1a3a5c'}}>{c.preferred_name}</div><div style={{fontSize:11,color:'#7a9ab8'}}>{c.service_type==='social'?(isAr?'إرشاد':'Social'):(isAr?'تأهيل':'Rehab')}</div></div>
                      <span style={{color:'#b8d8ec'}}>›</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ALL CLIENTS */}
          {page==='clients'&&(
            <div>
              <h3 style={{fontSize:15,fontWeight:700,color:'#1a3a5c',marginBottom:14}}>{isAr?`جميع العملاء (${clients.length})`:`All Clients (${clients.length})`}</h3>
              {clients.length===0?<div style={{...card,textAlign:'center',padding:40}}><div style={{fontSize:40,marginBottom:12}}>👥</div><p style={{color:'#7a9ab8'}}>{isAr?'لا يوجد عملاء بعد':'No clients yet'}</p></div>:
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {clients.map(c=>(
                  <div key={c.id} onClick={()=>openClient(c)} style={{...card,display:'flex',alignItems:'center',gap:14,cursor:'pointer',marginBottom:0}}>
                    <div style={{width:48,height:48,borderRadius:'50%',background:'linear-gradient(135deg,#4a90c4,#1a3a5c)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:18,fontWeight:700,flexShrink:0}}>{c.preferred_name[0]?.toUpperCase()}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:700,color:'#1a3a5c',marginBottom:3}}>{c.preferred_name}</div>
                      <div style={{fontSize:12,color:'#7a9ab8'}}>{c.service_type==='social'?(isAr?'إرشاد اجتماعي':'Social Counseling'):(isAr?'تأهيل وعلاج إدمان':'Rehab & Addiction')}{c.age?` · ${c.age}${isAr?' سنة':' yrs'}`:''}</div>
                    </div>
                    <span style={{fontSize:16,color:'#b8d8ec'}}>›</span>
                  </div>
                ))}
              </div>}
            </div>
          )}

          {/* CLIENT PROFILE */}
          {page==='client-profile'&&selClient&&(
            <div>
              <button onClick={()=>{setPage('clients');setSelClient(null)}} style={{background:'none',border:'none',color:'#7a9ab8',fontSize:13,cursor:'pointer',fontFamily:'inherit',marginBottom:14,display:'flex',alignItems:'center',gap:6,fontWeight:600}}>{isAr?'‹ العودة':'← Back'}</button>
              <div style={{background:'linear-gradient(135deg,#1a3a5c,#2a6090)',borderRadius:16,padding:22,marginBottom:14,display:'flex',alignItems:'center',gap:16,color:'white',flexWrap:'wrap'}}>
                <div style={{width:58,height:58,borderRadius:'50%',background:'rgba(255,255,255,.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:700,border:'3px solid rgba(255,255,255,.25)',flexShrink:0}}>{selClient.preferred_name[0]?.toUpperCase()}</div>
                <div>
                  <h2 style={{fontSize:18,fontWeight:700,marginBottom:4}}>{selClient.preferred_name}</h2>
                  <p style={{opacity:.75,fontSize:12,marginBottom:8}}>{selClient.service_type==='social'?(isAr?'إرشاد اجتماعي':'Social Counseling'):(isAr?'تأهيل وإدمان':'Rehab & Addiction')}{selClient.whatsapp?` · ${selClient.whatsapp}`:''}</p>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                    <span style={{background:'rgba(255,255,255,.15)',fontSize:10,fontWeight:600,padding:'3px 10px',borderRadius:14}}>{clientBookings.length} {isAr?'جلسات':'Sessions'}</span>
                    {clientSurvey?.stress_score&&<span style={{background:'rgba(224,80,80,.3)',fontSize:10,fontWeight:600,padding:'3px 10px',borderRadius:14}}>⚡ {isAr?`توتر ${clientSurvey.stress_score}/10`:`Stress ${clientSurvey.stress_score}/10`}</span>}
                  </div>
                </div>
                {selClient.whatsapp&&<a href={`https://wa.me/${selClient.whatsapp.replace(/\D/g,'')}`} target="_blank" style={{marginLeft:'auto',background:'#25d366',color:'white',padding:'7px 14px',borderRadius:16,fontSize:12,fontWeight:600,textDecoration:'none'}}>💬 WhatsApp</a>}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div style={card}>
                  <h3 style={{fontSize:13,fontWeight:700,color:'#1a3a5c',marginBottom:12}}>{isAr?'استبيان القبول':'Intake Survey'}</h3>
                  {clientSurvey?<div style={{display:'flex',flexDirection:'column',gap:8}}>
                    {[[isAr?'السبب':'Reason',clientSurvey.answers?.reason as string],[isAr?'التوتر':'Stress',`${clientSurvey.stress_score}/10`],[isAr?'المدة':'Duration',clientSurvey.answers?.duration as string],[isAr?'المجالات':'Affects',(clientSurvey.answers?.affects as string[]||[]).join(', ')],[isAr?'الدعم':'Support',clientSurvey.answers?.support as string]].filter(([,v])=>v).map(([k,v])=>(
                      <div key={k as string} style={{padding:'7px 0',borderBottom:'1px solid #eef4fa'}}>
                        <div style={{fontSize:10,fontWeight:600,color:'#7a9ab8',marginBottom:2,textTransform:'uppercase'}}>{k}</div>
                        <div style={{fontSize:12,color:'#1a3a5c'}}>{v as string}</div>
                      </div>
                    ))}
                  </div>:<p style={{fontSize:13,color:'#7a9ab8'}}>{isAr?'لا يوجد استبيان':'No survey yet'}</p>}
                </div>
                <div style={card}>
                  <h3 style={{fontSize:13,fontWeight:700,color:'#1a3a5c',marginBottom:12}}>{isAr?'الجلسات':'Sessions'}</h3>
                  {clientBookings.length===0?<p style={{fontSize:13,color:'#7a9ab8'}}>{isAr?'لا توجد جلسات':'No sessions yet'}</p>:
                  clientBookings.map(b=>{
                    const c=b.status==='confirmed'?{bg:'#eef4fa',c:'#2a6090'}:b.status==='completed'?{bg:'#eafaf3',c:'#2a9a6a'}:{bg:'#fef0f0',c:'#e05050'}
                    return <div key={b.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid #eef4fa'}}>
                      <div style={{width:34,height:34,borderRadius:8,background:c.c,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'white',flexShrink:0}}>
                        <div style={{fontSize:13,fontWeight:800,lineHeight:1}}>{new Date(b.scheduled_at).getDate()}</div>
                        <div style={{fontSize:8}}>{new Date(b.scheduled_at).toLocaleString('en',{month:'short'}).toUpperCase()}</div>
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:600,color:'#1a3a5c'}}>{b.method==='video'?'🎥':'💬'} {b.duration_minutes}{isAr?' دق':' min'} · {b.price_kwd} KWD</div>
                        <div style={{fontSize:10,color:'#7a9ab8'}}>{b.booking_ref}</div>
                      </div>
                      <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:10,background:c.bg,color:c.c}}>{b.status==='confirmed'?(isAr?'قادم':'Up'):b.status==='completed'?(isAr?'مكتمل':'Done'):(isAr?'ملغي':'Cancel')}</span>
                    </div>
                  })}
                </div>
              </div>
              <div style={card}>
                <h3 style={{fontSize:13,fontWeight:700,color:'#1a3a5c',marginBottom:10}}>{isAr?'ملاحظات الجلسة (سرية)':'Session Notes (Private)'}</h3>
                <textarea value={newNote} onChange={e=>setNewNote(e.target.value)} placeholder={isAr?'اكتب ملاحظاتك هنا...':'Write session notes here...'} style={{...inp,resize:'vertical',minHeight:70,marginBottom:8}}/>
                <div style={{display:'flex',gap:8,marginBottom:14}}>
                  <button onClick={saveNote} style={{background:'#2a6090',color:'white',border:'none',borderRadius:16,padding:'8px 18px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>💾 {isAr?'حفظ':'Save'}</button>
                  <button onClick={()=>askAI(`Format this as a clinical session note: ${newNote}`)} style={{background:'#eef0ff',color:'#5a7aff',border:'1px solid rgba(90,122,255,.2)',borderRadius:16,padding:'8px 14px',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>🤖 {isAr?'تنسيق ذكي':'AI Format'}</button>
                </div>
                {clientNotes.map(n=>(
                  <div key={n.id} style={{background:'#f7fafd',border:'1px solid #eef4fa',borderRadius:10,padding:12,marginBottom:8}}>
                    <div style={{fontSize:10,color:'#7a9ab8',marginBottom:4}}>{new Date(n.created_at).toLocaleDateString(isAr?'ar-KW':'en-US',{year:'numeric',month:'long',day:'numeric'})}</div>
                    <div style={{fontSize:13,color:'#3a5a7a',lineHeight:1.6}}>{n.content}</div>
                  </div>
                ))}
              </div>
              {/* AI for client */}
              <div style={{background:'linear-gradient(135deg,#0e1830,#1a2a4a)',borderRadius:14,overflow:'hidden'}}>
                <div style={{padding:'13px 16px',borderBottom:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',gap:8}}><span style={{fontSize:18}}>🤖</span><span style={{fontSize:13,fontWeight:700,color:'white'}}>{isAr?'مساعد ذكي':'AI Assistant'}</span></div>
                <div style={{padding:14,display:'flex',flexDirection:'column',gap:8,maxHeight:260,overflowY:'auto'}}>
                  {aiMessages.slice(-6).map((m,i)=>(
                    <div key={i} style={{display:'flex',gap:8,flexDirection:m.role==='user'?'row-reverse':'row',alignItems:'flex-start'}}>
                      <div style={{width:24,height:24,borderRadius:'50%',background:m.role==='user'?'#2a6090':'rgba(90,122,255,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,flexShrink:0}}>{m.role==='user'?'👨‍⚕️':'🤖'}</div>
                      <div className="ai-bubble" style={{maxWidth:'80%',padding:'9px 13px',borderRadius:11,fontSize:12,lineHeight:1.6,background:m.role==='user'?'#2a6090':'rgba(90,122,255,.1)',color:'rgba(255,255,255,.9)'}}>{m.text}</div>
                    </div>
                  ))}
                  {aiLoading&&<div style={{display:'flex',gap:4,padding:'8px 12px',background:'rgba(90,122,255,.1)',borderRadius:10,width:'fit-content'}}>{[0,1,2].map(i=><span key={i} style={{width:5,height:5,borderRadius:'50%',background:'#5a7aff',display:'inline-block'}}/>)}</div>}
                </div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap',padding:'0 12px 8px'}}>
                  {[isAr?'📋 موجز قبل الجلسة':'📋 Pre-session brief',isAr?'💡 اقترح أسئلة':'💡 Suggest questions',isAr?'⚠️ تحليل المخاطر':'⚠️ Risk analysis'].map(s=>(
                    <button key={s} onClick={()=>askAI(s)} style={{background:'rgba(90,122,255,.1)',border:'1px solid rgba(90,122,255,.2)',color:'rgba(255,255,255,.7)',fontSize:11,padding:'5px 10px',borderRadius:7,cursor:'pointer',fontFamily:'inherit'}}>{s}</button>
                  ))}
                </div>
                <div style={{padding:'8px 12px 12px',borderTop:'1px solid rgba(255,255,255,.06)',display:'flex',gap:8}}>
                  <input value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyPress={e=>e.key==='Enter'&&askAI()} placeholder={isAr?'اسأل عن هذا العميل...':'Ask about this client...'} style={{flex:1,background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.1)',borderRadius:9,padding:'8px 12px',color:'white',fontSize:12,fontFamily:'inherit',outline:'none'}}/>
                  <button onClick={()=>askAI()} style={{background:'#5a7aff',border:'none',borderRadius:9,padding:'8px 13px',color:'white',cursor:'pointer',fontSize:16}}>↑</button>
                </div>
              </div>
            </div>
          )}

          {/* SCHEDULE */}
          {page==='schedule'&&(
            <div>
              <h3 style={{fontSize:15,fontWeight:700,color:'#1a3a5c',marginBottom:14}}>{isAr?'جميع المواعيد':'All Bookings'}</h3>
              {bookings.length===0?<div style={{...card,textAlign:'center',padding:36}}><div style={{fontSize:36,marginBottom:10}}>📅</div><p style={{color:'#7a9ab8'}}>{isAr?'لا توجد مواعيد':'No bookings yet'}</p></div>:
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {bookings.map(b=>{
                  const sc=b.status==='confirmed'?{bg:'#eef4fa',c:'#2a6090',lbl:isAr?'قادم':'Up'}:b.status==='completed'?{bg:'#eafaf3',c:'#2a9a6a',lbl:isAr?'مكتملة':'Done'}:{bg:'#fef0f0',c:'#e05050',lbl:isAr?'ملغاة':'Cancel'}
                  return <div key={b.id} style={{...card,display:'flex',alignItems:'center',gap:12,marginBottom:0,flexWrap:'wrap'}}>
                    <div style={{width:48,height:48,borderRadius:10,background:sc.c,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'white',flexShrink:0}}>
                      <div style={{fontSize:17,fontWeight:800,lineHeight:1}}>{new Date(b.scheduled_at).getDate()}</div>
                      <div style={{fontSize:9,opacity:.8}}>{new Date(b.scheduled_at).toLocaleString('en',{month:'short'}).toUpperCase()}</div>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:'#1a3a5c',marginBottom:2}}>{(b.profiles as {preferred_name:string}|undefined)?.preferred_name||'Client'} — {b.service_type==='social'?(isAr?'إرشاد':'Social'):(isAr?'تأهيل':'Rehab')}</div>
                      <div style={{fontSize:11,color:'#7a9ab8'}}>{new Date(b.scheduled_at).toLocaleTimeString(isAr?'ar-KW':'en-US',{hour:'2-digit',minute:'2-digit'})} · {b.method==='video'?'🎥 Video':'💬 WA'} · {b.duration_minutes}{isAr?' دق':' min'} · {b.price_kwd} KWD</div>
                    </div>
                    <span style={{fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:14,background:sc.bg,color:sc.c}}>{sc.lbl}</span>
                  </div>
                })}
              </div>}
            </div>
          )}

          {/* AI PAGE */}
          {page==='ai'&&(
            <div style={{maxWidth:680}}>
              <div style={{background:'linear-gradient(135deg,#0e1830,#1a2a4a)',borderRadius:16,overflow:'hidden',marginBottom:14}}>
                <div style={{padding:'15px 18px',borderBottom:'1px solid rgba(255,255,255,.08)',display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:22}}>🤖</span>
                  <div><div style={{fontSize:14,fontWeight:700,color:'white'}}>Wesal AI Assistant</div><div style={{fontSize:10,color:'rgba(255,255,255,.4)',letterSpacing:1}}>POWERED BY CLAUDE</div></div>
                  <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:5,fontSize:10,color:'#4aba8a',fontWeight:600}}><span style={{width:6,height:6,borderRadius:'50%',background:'#4aba8a'}}/>Online</div>
                </div>
                <div style={{padding:14,display:'flex',flexDirection:'column',gap:10,maxHeight:420,overflowY:'auto'}}>
                  {aiMessages.map((m,i)=>(
                    <div key={i} style={{display:'flex',gap:8,flexDirection:m.role==='user'?'row-reverse':'row',alignItems:'flex-start'}}>
                      <div style={{width:26,height:26,borderRadius:'50%',background:m.role==='user'?'#2a6090':'rgba(90,122,255,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0}}>{m.role==='user'?'👨‍⚕️':'🤖'}</div>
                      <div className="ai-bubble" style={{maxWidth:'82%',padding:'10px 14px',borderRadius:12,fontSize:13,lineHeight:1.7,background:m.role==='user'?'#2a6090':'rgba(90,122,255,.1)',color:'rgba(255,255,255,.9)'}}>{m.text}</div>
                    </div>
                  ))}
                  {aiLoading&&<div style={{display:'flex',gap:5,padding:'9px 13px',background:'rgba(90,122,255,.1)',borderRadius:11,width:'fit-content'}}>{[0,1,2].map(i=><span key={i} style={{width:5,height:5,borderRadius:'50%',background:'#5a7aff',display:'inline-block'}}/>)}</div>}
                </div>
                <div style={{display:'flex',gap:7,flexWrap:'wrap',padding:'0 13px 9px'}}>
                  {[isAr?'🔍 أي عميل يحتاج انتباهاً؟':'🔍 Which client needs attention?',isAr?'📊 تقرير الأسبوع':'📊 Weekly report',isAr?'💡 تقنيات العلاج المعرفي':'💡 CBT techniques',isAr?'⚠️ فحص مؤشرات الخطر':'⚠️ Check risk indicators'].map(s=>(
                    <button key={s} onClick={()=>askAI(s)} style={{background:'rgba(90,122,255,.1)',border:'1px solid rgba(90,122,255,.2)',color:'rgba(255,255,255,.7)',fontSize:11,padding:'6px 12px',borderRadius:8,cursor:'pointer',fontFamily:'inherit'}}>{s}</button>
                  ))}
                </div>
                <div style={{padding:'9px 13px 13px',borderTop:'1px solid rgba(255,255,255,.06)',display:'flex',gap:8}}>
                  <input value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyPress={e=>e.key==='Enter'&&askAI()} placeholder={isAr?'اسأل المساعد الذكي...':'Ask AI assistant...'} style={{flex:1,background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.1)',borderRadius:9,padding:'9px 13px',color:'white',fontSize:13,fontFamily:'inherit',outline:'none'}}/>
                  <button onClick={()=>askAI()} style={{background:'#5a7aff',border:'none',borderRadius:9,padding:'9px 15px',color:'white',cursor:'pointer',fontSize:17}}>↑</button>
                </div>
              </div>
              <div style={{background:'#eef0ff',border:'1px solid rgba(90,122,255,.2)',borderRadius:12,padding:'13px 15px',fontSize:12,color:'#3a4a8a',lineHeight:1.7}}>
                🤖 {isAr?'المساعد الذكي مدعوم بتقنية Claude من Anthropic. أداة دعم للمختص وليس بديلاً عنه.':'AI Assistant powered by Claude (Anthropic). A support tool for the consultant, not a replacement.'}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
