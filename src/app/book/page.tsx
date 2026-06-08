'use client'
import { useState, useEffect } from 'react'

type Step = 1|2|3|4|5|6

export default function BookPage() {
  const [lang, setLang]   = useState<'ar'|'en'>('ar')
  const [step, setStep]   = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId]   = useState<string|null>(null)
  const [bookingRef, setBookingRef] = useState('')
  const isAr = lang === 'ar'

  // Form state
  const [service,  setService]  = useState<'social'|'addiction'|''>('')
  const [method,   setMethod]   = useState<'video'|'whatsapp'>('video')
  const [duration, setDuration] = useState<30|60|90>(60)
  const [price,    setPrice]    = useState(25)
  const [selDate,  setSelDate]  = useState<Date|null>(null)
  const [selTime,  setSelTime]  = useState('')
  const [calYear,  setCalYear]  = useState(new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(new Date().getMonth())

  // Personal info
  const [name,      setName]      = useState('')
  const [age,       setAge]       = useState('')
  const [gender,    setGender]    = useState('')
  const [whatsapp,  setWhatsapp]  = useState('')
  const [email,     setEmail]     = useState('')
  const [pLang,     setPLang]     = useState('ar')
  const [prevCounsel, setPrevCounsel] = useState('no')

  // Survey
  const [reason,    setReason]    = useState('')
  const [duration2, setDuration2] = useState('months')
  const [stressScore, setStressScore] = useState(0)
  const [support,   setSupport]   = useState('somewhat')
  const [meds,      setMeds]      = useState('no')
  const [affects,   setAffects]   = useState<string[]>([])
  const [outcome,   setOutcome]   = useState('')

  useEffect(() => {
    async function checkAuth() {
      const { createClient } = await import('@supabase/supabase-js')
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      const { data: { session } } = await sb.auth.getSession()
      if (session?.user) {
        setUserId(session.user.id)
        // Pre-fill name from profile
        const { data: p } = await sb.from('profiles').select('preferred_name,whatsapp,email,language').eq('id', session.user.id).single()
        if (p) {
          setName(p.preferred_name || '')
          setWhatsapp(p.whatsapp || '')
          setEmail(p.email || '')
          setPLang(p.language || 'ar')
          if (p.language === 'en') setLang('en')
        }
      }
    }
    checkAuth()
  }, [])

  const prices = { 30: 15, 60: 25, 90: 35 }

  function selectDuration(d: 30|60|90) {
    setDuration(d)
    setPrice(prices[d])
  }

  // Calendar
  const monthNames    = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const monthNamesAr  = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']
  const dayNames      = ['Su','Mo','Tu','We','Th','Fr','Sa']
  const dayNamesAr    = ['أح','اث','ثل','أر','خم','جم','سب']
  const today         = new Date(); today.setHours(0,0,0,0)

  function calDays() {
    const first = new Date(calYear, calMonth, 1).getDay()
    const total = new Date(calYear, calMonth+1, 0).getDate()
    const cells = []
    for (let i=0; i<first; i++) cells.push(null)
    for (let d=1; d<=total; d++) cells.push(d)
    return cells
  }

  const timeSlots = ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM','8:00 PM']
  const bookedSlots = ['11:00 AM','4:00 PM'] // demo

  async function submitBooking() {
    if (!userId) { window.location.href = '/login'; return }
    if (!selDate || !selTime) return
    setLoading(true)

    try {
      const { createClient } = await import('@supabase/supabase-js')
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

      // Get consultant ID
      const { data: consultant } = await sb.from('profiles').select('id').eq('role','consultant').single()
      if (!consultant) { setLoading(false); return }

      // Build scheduled datetime
      const [time, ampm] = selTime.split(' ')
      const [h, m] = time.split(':').map(Number)
      const hours = ampm === 'PM' && h !== 12 ? h + 12 : ampm === 'AM' && h === 12 ? 0 : h
      const scheduled = new Date(selDate)
      scheduled.setHours(hours, m, 0, 0)

      // Create booking
      const ref = `WSL-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000+1000))}`
      const { data: booking, error } = await sb.from('bookings').insert({
        client_id:        userId,
        consultant_id:    consultant.id,
        service_type:     service,
        method:           method,
        duration_minutes: duration,
        price_kwd:        price,
        scheduled_at:     scheduled.toISOString(),
        status:           'confirmed',
        booking_ref:      ref,
        payment_status:   'pending',
      }).select().single()

      if (error) throw error

      // Save survey
      await sb.from('surveys').insert({
        client_id:   userId,
        booking_id:  booking.id,
        type:        'intake',
        stress_score: stressScore,
        answers: {
          reason, duration: duration2, affects, support, meds,
          outcome, prev_counseling: prevCounsel,
        }
      })

      // Update profile name if not set
      await sb.from('profiles').update({
        preferred_name: name,
        whatsapp:       whatsapp || null,
        email:          email || null,
        service_type:   service,
      }).eq('id', userId)

      setBookingRef(ref)
      setStep(6)
    } catch (e) {
      console.error(e)
      alert(isAr ? 'حدث خطأ، حاول مرة أخرى' : 'An error occurred, please try again')
    }
    setLoading(false)
  }

  // Styles
  const card   = {background:'white',borderRadius:16,padding:24,boxShadow:'0 4px 20px rgba(26,58,92,.08)',border:'1px solid rgba(74,144,196,.08)',marginBottom:16} as React.CSSProperties
  const inp    = {width:'100%',border:'2px solid #b8d8ec',borderRadius:10,padding:'11px 14px',fontSize:14,fontFamily:'inherit',outline:'none',color:'#0f2233',background:'white',transition:'border-color .2s'} as React.CSSProperties
  const lbl    = {fontSize:12,fontWeight:600,color:'#3a5a7a',display:'block',marginBottom:6} as React.CSSProperties
  const btnNext = {background:'#2a6090',color:'white',border:'none',borderRadius:25,padding:'13px 32px',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 14px rgba(42,96,144,.3)'} as React.CSSProperties
  const btnBack = {background:'white',color:'#2a6090',border:'2px solid #b8d8ec',borderRadius:25,padding:'12px 28px',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:'inherit'} as React.CSSProperties

  const stepLabels = isAr
    ? ['الخدمة','الموعد','معلوماتك','الاستبيان','الدفع','تأكيد']
    : ['Service','Schedule','Your Info','Survey','Payment','Done']

  return (
    <div dir={isAr?'rtl':'ltr'} style={{minHeight:'100vh',background:'#f7fafd',fontFamily:isAr?'Tajawal,sans-serif':'Montserrat,sans-serif'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=Montserrat:wght@400;500;600;700&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>

      {/* Navbar */}
      <nav style={{background:'white',borderBottom:'1px solid rgba(74,144,196,.12)',padding:'13px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',boxShadow:'0 2px 10px rgba(26,58,92,.05)',position:'sticky',top:0,zIndex:50}}>
        <a href="/" style={{display:'flex',alignItems:'center',gap:10,textDecoration:'none'}}>
          <svg width="36" height="36" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="38" fill="#eef4fa"/>
            <clipPath id="nb"><circle cx="40" cy="40" r="35"/></clipPath>
            <path d="M40 8 L40 26 Q35 26 33 30 Q31 35 36 37 Q41 39 40 40 L18 40 L18 22 Q23 22 25 18 Q27 13 22 11 Q17 9 18 8Z" fill="#2a6090" clipPath="url(#nb)"/>
            <path d="M40 8 L62 8 Q61 9 56 11 Q51 13 53 18 Q55 22 60 22 L62 40 L40 40 Q39 39 44 37 Q49 35 47 30 Q45 26 40 26Z" fill="#4a90c4" clipPath="url(#nb)"/>
            <path d="M18 40 L40 40 Q40 41 36 43 Q31 45 33 50 Q35 54 40 54 L40 72 L18 72 Q18 62 23 60 Q28 58 26 53 Q24 48 18 50Z" fill="#7ab5d8" clipPath="url(#nb)"/>
            <path d="M40 40 L62 40 Q56 38 54 43 Q52 48 57 53 Q62 58 62 72 L40 72 L40 54 Q45 54 47 50 Q49 45 44 43 Q39 41 40 40Z" fill="#b8d8ec" clipPath="url(#nb)"/>
          </svg>
          <div><div style={{fontWeight:800,fontSize:13,color:'#1a3a5c',letterSpacing:'1px'}}>WESAL</div><div style={{fontSize:8,color:'#4a90c4',letterSpacing:'2px',textTransform:'uppercase'}}>International</div></div>
        </a>
        <button onClick={()=>setLang(isAr?'en':'ar')} style={{background:'#eef4fa',border:'1px solid #b8d8ec',color:'#2a6090',fontSize:11,fontWeight:600,padding:'6px 14px',borderRadius:16,cursor:'pointer',fontFamily:'inherit'}}>
          {isAr?'English':'العربية'}
        </button>
      </nav>

      {/* Progress bar */}
      {step < 6 && (
        <div style={{background:'white',borderBottom:'1px solid rgba(74,144,196,.1)',padding:'14px 24px'}}>
          <div style={{maxWidth:700,margin:'0 auto',display:'flex',alignItems:'center',gap:4}}>
            {[1,2,3,4,5].map((n,i)=>(
              <div key={n} style={{display:'flex',alignItems:'center',flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
                  <div style={{width:28,height:28,borderRadius:'50%',background:step>n?'#2a9a6a':step===n?'#2a6090':'#eef4fa',border:`2px solid ${step>n?'#2a9a6a':step===n?'#2a6090':'#b8d8ec'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:step>=n?'white':'#7a9ab8',transition:'all .3s',flexShrink:0}}>
                    {step>n?'✓':n}
                  </div>
                  <span style={{fontSize:10,fontWeight:600,color:step>=n?'#2a6090':'#b8d8ec',display:'none',whiteSpace:'nowrap'}}>{stepLabels[i]}</span>
                </div>
                {i<4 && <div style={{flex:1,height:2,background:step>n?'#2a9a6a':'#eef4fa',margin:'0 4px',borderRadius:1,transition:'background .3s'}}/>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{maxWidth:700,margin:'0 auto',padding:'24px 16px 60px'}}>

        {/* ═══ STEP 1: SERVICE ═══ */}
        {step===1 && (
          <div>
            <div style={{marginBottom:24}}>
              <p style={{fontSize:11,fontWeight:600,letterSpacing:3,textTransform:'uppercase',color:'#4a90c4',marginBottom:6}}>{isAr?'الخطوة 1 من 5':'Step 1 of 5'}</p>
              <h2 style={{fontSize:22,fontWeight:800,color:'#1a3a5c',marginBottom:6}}>{isAr?'اختر خدمتك':'Choose Your Service'}</h2>
              <p style={{fontSize:13,color:'#7a9ab8'}}>{isAr?'جميع الجلسات سرية 100%':'All sessions are 100% confidential'}</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:20}}>
              {[
                {id:'social',icon:'🧠',en:'Social Counseling',ar:'الإرشاد الاجتماعي',desc_en:'Relationships, family, stress, anxiety',desc_ar:'العلاقات، الأسرة، التوتر، القلق',price:'15'},
                {id:'addiction',icon:'🌱',en:'Behavioral Rehab & Addiction',ar:'التأهيل السلوكي وعلاج الإدمان',desc_en:'Substance & behavioral addiction',desc_ar:'الإدمان السلوكي والمواد',price:'20'},
              ].map(s=>(
                <div key={s.id} onClick={()=>setService(s.id as 'social'|'addiction')}
                  style={{border:`2px solid ${service===s.id?'#2a6090':'#b8d8ec'}`,borderRadius:14,padding:20,cursor:'pointer',background:service===s.id?'#eef4fa':'white',transition:'all .2s',position:'relative'}}>
                  {service===s.id && <div style={{position:'absolute',top:10,right:10,width:20,height:20,borderRadius:'50%',background:'#2a6090',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700}}>✓</div>}
                  <div style={{fontSize:32,marginBottom:10}}>{s.icon}</div>
                  <div style={{fontSize:14,fontWeight:700,color:'#1a3a5c',marginBottom:6}}>{isAr?s.ar:s.en}</div>
                  <div style={{fontSize:12,color:'#7a9ab8',marginBottom:10,lineHeight:1.5}}>{isAr?s.desc_ar:s.desc_en}</div>
                  <span style={{background:'#1a3a5c',color:'white',fontSize:11,fontWeight:700,padding:'4px 12px',borderRadius:20}}>{isAr?`من ${s.price} د.ك`:`From ${s.price} KWD`}</span>
                </div>
              ))}
            </div>
            <div style={{display:'flex',justifyContent:'flex-end'}}>
              <button onClick={()=>service&&setStep(2)} disabled={!service}
                style={{...btnNext,opacity:service?1:.5,cursor:service?'pointer':'not-allowed'}}>
                {isAr?'متابعة ←':'Continue →'}
              </button>
            </div>
          </div>
        )}

        {/* ═══ STEP 2: SCHEDULE ═══ */}
        {step===2 && (
          <div>
            <div style={{marginBottom:20}}>
              <p style={{fontSize:11,fontWeight:600,letterSpacing:3,textTransform:'uppercase',color:'#4a90c4',marginBottom:6}}>{isAr?'الخطوة 2 من 5':'Step 2 of 5'}</p>
              <h2 style={{fontSize:22,fontWeight:800,color:'#1a3a5c'}}>{isAr?'اختر موعدك':'Choose Your Schedule'}</h2>
            </div>

            {/* Method */}
            <div style={card}>
              <p style={{...lbl,marginBottom:12}}>{isAr?'طريقة الجلسة':'Session Method'}</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {[{id:'video',icon:'🎥',en:'Video Call',ar:'مكالمة فيديو',sub_en:'Secure encrypted',sub_ar:'منصة مشفرة آمنة'},
                  {id:'whatsapp',icon:'💬',en:'WhatsApp',ar:'واتساب',sub_en:'Voice or video',sub_ar:'صوتية أو مرئية'}].map(m=>(
                  <div key={m.id} onClick={()=>setMethod(m.id as 'video'|'whatsapp')}
                    style={{border:`2px solid ${method===m.id?'#2a6090':'#b8d8ec'}`,borderRadius:12,padding:'14px 16px',cursor:'pointer',background:method===m.id?'#eef4fa':'white',display:'flex',alignItems:'center',gap:12,transition:'all .2s'}}>
                    <span style={{fontSize:24}}>{m.icon}</span>
                    <div><div style={{fontSize:13,fontWeight:700,color:'#1a3a5c'}}>{isAr?m.ar:m.en}</div><div style={{fontSize:11,color:'#7a9ab8'}}>{isAr?m.sub_ar:m.sub_en}</div></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div style={card}>
              <p style={{...lbl,marginBottom:12}}>{isAr?'مدة الجلسة':'Session Duration'}</p>
              <div style={{display:'flex',gap:10}}>
                {([30,60,90] as const).map(d=>(
                  <button key={d} onClick={()=>selectDuration(d)}
                    style={{flex:1,border:`2px solid ${duration===d?'#2a6090':'#b8d8ec'}`,borderRadius:12,padding:'13px 8px',background:duration===d?'#eef4fa':'white',cursor:'pointer',fontFamily:'inherit',transition:'all .2s',textAlign:'center'}}>
                    <div style={{fontSize:20,fontWeight:800,color:'#1a3a5c'}}>{d}</div>
                    <div style={{fontSize:11,color:'#7a9ab8',marginBottom:4}}>{isAr?'دقيقة':'min'}</div>
                    <div style={{fontSize:12,fontWeight:700,color:'#2a6090'}}>{prices[d]} KWD</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div style={card}>
              <p style={{...lbl,marginBottom:12}}>{isAr?'اختر التاريخ':'Select Date'}</p>
              <div style={{borderRadius:12,overflow:'hidden',border:'1px solid #eef4fa'}}>
                <div style={{background:'#1a3a5c',padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                  <button onClick={()=>{if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1)}else setCalMonth(m=>m-1)}}
                    style={{background:'none',border:'none',color:'white',fontSize:18,cursor:'pointer',padding:'2px 8px'}}>‹</button>
                  <span style={{color:'white',fontWeight:600,fontSize:14}}>
                    {(isAr?monthNamesAr:monthNames)[calMonth]} {calYear}
                  </span>
                  <button onClick={()=>{if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1)}else setCalMonth(m=>m+1)}}
                    style={{background:'none',border:'none',color:'white',fontSize:18,cursor:'pointer',padding:'2px 8px'}}>›</button>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',background:'#eef4fa'}}>
                  {(isAr?dayNamesAr:dayNames).map(d=>(
                    <div key={d} style={{textAlign:'center',padding:'8px 0',fontSize:10,fontWeight:600,color:'#7a9ab8'}}>{d}</div>
                  ))}
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,padding:8,background:'white'}}>
                  {calDays().map((d,i)=>{
                    if (!d) return <div key={i}/>
                    const thisDate = new Date(calYear, calMonth, d)
                    const isPast = thisDate < today
                    const isSel  = selDate && thisDate.toDateString()===selDate.toDateString()
                    const isTday = thisDate.toDateString()===today.toDateString()
                    return (
                      <div key={i} onClick={()=>!isPast&&setSelDate(thisDate)}
                        style={{aspectRatio:'1',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:8,cursor:isPast?'not-allowed':'pointer',fontSize:13,fontWeight:isTday?700:400,background:isSel?'#2a6090':isTday&&!isSel?'#eef4fa':'transparent',color:isSel?'white':isPast?'#ccc':isTday?'#2a6090':'#3a5a7a',transition:'all .15s'}}>
                        {d}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Time slots */}
            {selDate && (
              <div style={card}>
                <p style={{...lbl,marginBottom:12}}>{isAr?'الأوقات المتاحة':'Available Times'}</p>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
                  {timeSlots.map(t=>{
                    const isBooked = bookedSlots.includes(t)
                    const isSel    = selTime===t
                    return (
                      <button key={t} onClick={()=>!isBooked&&setSelTime(t)} disabled={isBooked}
                        style={{border:`2px solid ${isSel?'#2a6090':isBooked?'#eee':'#b8d8ec'}`,borderRadius:10,padding:'10px 4px',background:isSel?'#2a6090':isBooked?'#f8f8f8':'white',color:isSel?'white':isBooked?'#ccc':'#3a5a7a',cursor:isBooked?'not-allowed':'pointer',fontSize:12,fontWeight:600,fontFamily:'inherit',transition:'all .15s'}}>
                        {t}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div style={{display:'flex',justifyContent:'space-between'}}>
              <button onClick={()=>setStep(1)} style={btnBack}>{isAr?'→ رجوع':'← Back'}</button>
              <button onClick={()=>selDate&&selTime&&setStep(3)} disabled={!selDate||!selTime}
                style={{...btnNext,opacity:selDate&&selTime?1:.5,cursor:selDate&&selTime?'pointer':'not-allowed'}}>
                {isAr?'متابعة ←':'Continue →'}
              </button>
            </div>
          </div>
        )}

        {/* ═══ STEP 3: PERSONAL INFO ═══ */}
        {step===3 && (
          <div>
            <div style={{marginBottom:20}}>
              <p style={{fontSize:11,fontWeight:600,letterSpacing:3,textTransform:'uppercase',color:'#4a90c4',marginBottom:6}}>{isAr?'الخطوة 3 من 5':'Step 3 of 5'}</p>
              <h2 style={{fontSize:22,fontWeight:800,color:'#1a3a5c'}}>{isAr?'معلوماتك الشخصية':'Your Information'}</h2>
            </div>

            <div style={{background:'#eafaf3',border:'1px solid rgba(42,154,106,.2)',borderRadius:12,padding:'12px 16px',marginBottom:16,display:'flex',gap:10,alignItems:'flex-start'}}>
              <span style={{fontSize:18,flexShrink:0}}>🔒</span>
              <p style={{fontSize:12,color:'#1a6a4a',lineHeight:1.7}}>{isAr?'يمكنك استخدام اسم مستعار. بياناتك سرية ولن تُشارك مع أحد — حتى أفراد الأسرة.':'You may use a nickname. Your data is private and never shared — not even with family.'}</p>
            </div>

            <div style={card}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div style={{gridColumn:'1/-1'}}>
                  <label style={lbl}>{isAr?'الاسم المفضل أو اسم مستعار':'Preferred Name or Nickname'} <span style={{color:'#e05050'}}>*</span></label>
                  <input style={inp} value={name} onChange={e=>setName(e.target.value)} placeholder={isAr?'اسمك أو اسم مستعار':'Your name or nickname'}
                    onFocus={e=>e.target.style.borderColor='#2a6090'} onBlur={e=>e.target.style.borderColor='#b8d8ec'}/>
                </div>
                <div>
                  <label style={lbl}>{isAr?'العمر':'Age'}</label>
                  <input style={inp} type="number" min="16" max="99" value={age} onChange={e=>setAge(e.target.value)} placeholder="25"
                    onFocus={e=>e.target.style.borderColor='#2a6090'} onBlur={e=>e.target.style.borderColor='#b8d8ec'}/>
                </div>
                <div>
                  <label style={lbl}>{isAr?'الجنس':'Gender'}</label>
                  <select style={{...inp,height:46}} value={gender} onChange={e=>setGender(e.target.value)}>
                    <option value="">{isAr?'اختر...':'Select...'}</option>
                    <option value="male">{isAr?'ذكر':'Male'}</option>
                    <option value="female">{isAr?'أنثى':'Female'}</option>
                    <option value="prefer-not">{isAr?'أفضل عدم الإفصاح':'Prefer not to say'}</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>{isAr?'رقم واتساب':'WhatsApp'} <span style={{color:'#e05050'}}>*</span></label>
                  <input style={inp} type="tel" value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="+965 XXXX XXXX"
                    onFocus={e=>e.target.style.borderColor='#2a6090'} onBlur={e=>e.target.style.borderColor='#b8d8ec'}/>
                </div>
                <div>
                  <label style={lbl}>{isAr?'البريد الإلكتروني':'Email'}</label>
                  <input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="example@email.com"
                    onFocus={e=>e.target.style.borderColor='#2a6090'} onBlur={e=>e.target.style.borderColor='#b8d8ec'}/>
                </div>
                <div>
                  <label style={lbl}>{isAr?'اللغة المفضلة':'Preferred Language'}</label>
                  <select style={{...inp,height:46}} value={pLang} onChange={e=>setPLang(e.target.value)}>
                    <option value="ar">{isAr?'العربية':'Arabic'}</option>
                    <option value="en">{isAr?'الإنجليزية':'English'}</option>
                    <option value="both">{isAr?'كلتاهما':'Both'}</option>
                  </select>
                </div>
                <div style={{gridColumn:'1/-1'}}>
                  <label style={lbl}>{isAr?'هل سبق لك تلقي إرشاد؟':'Previous counseling experience?'}</label>
                  <select style={{...inp,height:46}} value={prevCounsel} onChange={e=>setPrevCounsel(e.target.value)}>
                    <option value="no">{isAr?'لا، هذه أول مرة':'No, this is my first time'}</option>
                    <option value="yes">{isAr?'نعم':'Yes'}</option>
                    <option value="prefer-not">{isAr?'أفضل عدم الإفصاح':'Prefer not to say'}</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{display:'flex',justifyContent:'space-between'}}>
              <button onClick={()=>setStep(2)} style={btnBack}>{isAr?'→ رجوع':'← Back'}</button>
              <button onClick={()=>name&&setStep(4)} disabled={!name}
                style={{...btnNext,opacity:name?1:.5,cursor:name?'pointer':'not-allowed'}}>
                {isAr?'متابعة ←':'Continue →'}
              </button>
            </div>
          </div>
        )}

        {/* ═══ STEP 4: SURVEY ═══ */}
        {step===4 && (
          <div>
            <div style={{marginBottom:20}}>
              <p style={{fontSize:11,fontWeight:600,letterSpacing:3,textTransform:'uppercase',color:'#4a90c4',marginBottom:6}}>{isAr?'الخطوة 4 من 5':'Step 4 of 5'}</p>
              <h2 style={{fontSize:22,fontWeight:800,color:'#1a3a5c'}}>{isAr?'استبيان القبول السري':'Confidential Intake Survey'}</h2>
            </div>

            <div style={{background:'#eafaf3',border:'1px solid rgba(42,154,106,.2)',borderRadius:12,padding:'12px 16px',marginBottom:16,display:'flex',gap:10,alignItems:'flex-start'}}>
              <span style={{fontSize:18,flexShrink:0}}>🔒</span>
              <p style={{fontSize:12,color:'#1a6a4a',lineHeight:1.7}}>{isAr?'إجاباتك لا يراها سوى مختصك المعين ولن تُشارك مع أي شخص آخر.':'Your answers are only visible to your assigned specialist and never shared.'}</p>
            </div>

            <div style={card}>
              <div style={{display:'flex',flexDirection:'column',gap:18}}>
                <div>
                  <label style={lbl}>{isAr?'ما الذي أحضرك إلى هنا اليوم؟':'What brings you here today?'} <span style={{color:'#e05050'}}>*</span></label>
                  <textarea value={reason} onChange={e=>setReason(e.target.value)}
                    placeholder={isAr?'شارك ما تشعر بالراحة في ذكره...':'Share as much or as little as you\'re comfortable with...'}
                    style={{...inp,resize:'vertical',minHeight:80}}
                    onFocus={e=>e.target.style.borderColor='#2a6090'} onBlur={e=>e.target.style.borderColor='#b8d8ec'}/>
                </div>

                <div>
                  <label style={lbl}>{isAr?'مستوى التوتر الحالي (1 = هادئ، 10 = متوتر جداً)':'Current stress level (1 = calm, 10 = very stressed)'}</label>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                    {[1,2,3,4,5,6,7,8,9,10].map(n=>(
                      <button key={n} onClick={()=>setStressScore(n)}
                        style={{flex:1,minWidth:36,padding:'9px 4px',border:`2px solid ${stressScore===n?'#2a6090':'#b8d8ec'}`,borderRadius:8,background:stressScore===n?'#2a6090':'white',color:stressScore===n?'white':'#3a5a7a',cursor:'pointer',fontSize:13,fontWeight:600,fontFamily:'inherit',transition:'all .15s'}}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={lbl}>{isAr?'منذ متى وأنت تعاني من هذا؟':'How long have you been experiencing this?'}</label>
                  <select style={{...inp,height:46}} value={duration2} onChange={e=>setDuration2(e.target.value)}>
                    <option value="recent">{isAr?'أقل من شهر':'Less than 1 month'}</option>
                    <option value="months">{isAr?'من 1 إلى 6 أشهر':'1 to 6 months'}</option>
                    <option value="long">{isAr?'أكثر من 6 أشهر':'More than 6 months'}</option>
                    <option value="years">{isAr?'عدة سنوات':'Several years'}</option>
                  </select>
                </div>

                <div>
                  <label style={{...lbl,marginBottom:10}}>{isAr?'كيف يؤثر هذا على حياتك؟':'How is this affecting your life?'}</label>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                    {[['work',isAr?'العمل/الدراسة':'Work/Studies'],['family',isAr?'العلاقات الأسرية':'Family'],['sleep',isAr?'النوم':'Sleep'],['social',isAr?'الحياة الاجتماعية':'Social life'],['health',isAr?'الصحة الجسدية':'Physical health'],['mental',isAr?'الصحة النفسية':'Mental wellbeing']].map(([v,label])=>(
                      <div key={v} onClick={()=>setAffects(a=>a.includes(v)?a.filter(x=>x!==v):[...a,v])}
                        style={{display:'flex',alignItems:'center',gap:10,border:`2px solid ${affects.includes(v)?'#2a6090':'#b8d8ec'}`,borderRadius:10,padding:'11px 14px',cursor:'pointer',background:affects.includes(v)?'#eef4fa':'white',transition:'all .15s'}}>
                        <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${affects.includes(v)?'#2a6090':'#b8d8ec'}`,background:affects.includes(v)?'#2a6090':'white',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                          {affects.includes(v)&&<span style={{color:'white',fontSize:10,fontWeight:700}}>✓</span>}
                        </div>
                        <span style={{fontSize:12,fontWeight:500,color:'#3a5a7a'}}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={lbl}>{isAr?'هل لديك نظام دعم في المنزل؟':'Do you have a support system at home?'}</label>
                  <select style={{...inp,height:46}} value={support} onChange={e=>setSupport(e.target.value)}>
                    <option value="yes">{isAr?'نعم، دعم قوي':'Yes, strong support'}</option>
                    <option value="somewhat">{isAr?'نوعاً ما':'Somewhat'}</option>
                    <option value="no">{isAr?'لا':'No'}</option>
                    <option value="prefer-not">{isAr?'أفضل عدم الإفصاح':'Prefer not to say'}</option>
                  </select>
                </div>

                <div>
                  <label style={lbl}>{isAr?'ما النتيجة التي تأمل في تحقيقها؟':'What outcome are you hoping for?'}</label>
                  <textarea value={outcome} onChange={e=>setOutcome(e.target.value)}
                    placeholder={isAr?'صف أهدافك أو توقعاتك...':'Describe your goals or expectations...'}
                    style={{...inp,resize:'vertical',minHeight:70}}
                    onFocus={e=>e.target.style.borderColor='#2a6090'} onBlur={e=>e.target.style.borderColor='#b8d8ec'}/>
                </div>
              </div>
            </div>

            <div style={{display:'flex',justifyContent:'space-between'}}>
              <button onClick={()=>setStep(3)} style={btnBack}>{isAr?'→ رجوع':'← Back'}</button>
              <button onClick={()=>reason&&setStep(5)} disabled={!reason}
                style={{...btnNext,opacity:reason?1:.5,cursor:reason?'pointer':'not-allowed'}}>
                {isAr?'متابعة ←':'Continue →'}
              </button>
            </div>
          </div>
        )}

        {/* ═══ STEP 5: PAYMENT ═══ */}
        {step===5 && (
          <div>
            <div style={{marginBottom:20}}>
              <p style={{fontSize:11,fontWeight:600,letterSpacing:3,textTransform:'uppercase',color:'#4a90c4',marginBottom:6}}>{isAr?'الخطوة 5 من 5':'Step 5 of 5'}</p>
              <h2 style={{fontSize:22,fontWeight:800,color:'#1a3a5c'}}>{isAr?'تأكيد الحجز والدفع':'Confirm & Pay'}</h2>
            </div>

            {/* Order summary */}
            <div style={card}>
              <h3 style={{fontSize:14,fontWeight:700,color:'#1a3a5c',marginBottom:16}}>{isAr?'ملخص الحجز':'Booking Summary'}</h3>
              {[
                [isAr?'الخدمة':'Service', service==='social'?(isAr?'الإرشاد الاجتماعي':'Social Counseling'):(isAr?'التأهيل وعلاج الإدمان':'Rehab & Addiction')],
                [isAr?'التاريخ':'Date', selDate?.toLocaleDateString(isAr?'ar-KW':'en-US',{weekday:'long',month:'long',day:'numeric'})],
                [isAr?'الوقت':'Time', selTime],
                [isAr?'المدة':'Duration', `${duration} ${isAr?'دقيقة':'min'}`],
                [isAr?'الطريقة':'Method', method==='video'?(isAr?'مكالمة فيديو':'Video Call'):(isAr?'واتساب':'WhatsApp')],
                [isAr?'المختص':'Specialist', 'Khalaf Jalal Alenizi'],
              ].map(([k,v])=>(
                <div key={k as string} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #eef4fa',fontSize:13}}>
                  <span style={{color:'#7a9ab8',fontWeight:500}}>{k}</span>
                  <span style={{color:'#1a3a5c',fontWeight:600}}>{v}</span>
                </div>
              ))}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 0 0',marginTop:8,borderTop:'2px solid #eef4fa'}}>
                <span style={{fontSize:16,fontWeight:700,color:'#1a3a5c'}}>{isAr?'الإجمالي':'Total'}</span>
                <span style={{fontSize:24,fontWeight:800,color:'#2a6090'}}>{price} KWD</span>
              </div>
            </div>

            {/* Payment info */}
            <div style={{background:'#eafaf3',border:'1px solid rgba(42,154,106,.2)',borderRadius:12,padding:'14px 16px',marginBottom:16,display:'flex',gap:10,alignItems:'flex-start'}}>
              <span style={{fontSize:18,flexShrink:0}}>🔐</span>
              <p style={{fontSize:12,color:'#1a6a4a',lineHeight:1.7}}>
                {isAr
                  ? 'سيتم معالجة دفعتك بشكل آمن. يحق لك استرداد كامل المبلغ إذا ألغيت قبل 24 ساعة.'
                  : 'Payment processed securely via Tap Payments. Full refund if cancelled 24+ hours before.'}
              </p>
            </div>

            {/* Payment note - Tap Payments coming soon */}
            <div style={{...card,textAlign:'center',padding:28}}>
              <div style={{fontSize:36,marginBottom:12}}>💳</div>
              <h3 style={{fontSize:16,fontWeight:700,color:'#1a3a5c',marginBottom:8}}>{isAr?'خيارات الدفع':'Payment Options'}</h3>
              <p style={{fontSize:13,color:'#7a9ab8',marginBottom:16,lineHeight:1.6}}>
                {isAr
                  ? 'بوابة الدفع عبر Tap Payments (KNET، بطاقات ائتمان) قيد التفعيل. حالياً سيتم تأكيد حجزك مباشرة.'
                  : 'Tap Payments (KNET, credit cards) is being activated. For now your booking will be confirmed directly.'}
              </p>
              <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap',marginBottom:8}}>
                {['💳 KNET','💳 Visa','💳 Mastercard','📱 Apple Pay'].map(p=>(
                  <span key={p} style={{background:'#eef4fa',border:'1px solid #b8d8ec',color:'#2a6090',fontSize:12,fontWeight:600,padding:'6px 14px',borderRadius:20}}>{p}</span>
                ))}
              </div>
            </div>

            <div style={{display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
              <button onClick={()=>setStep(4)} style={btnBack}>{isAr?'→ رجوع':'← Back'}</button>
              <button onClick={submitBooking} disabled={loading}
                style={{...btnNext,background:loading?'#b8d8ec':'#2a9a6a',boxShadow:'0 4px 14px rgba(42,154,106,.3)',cursor:loading?'not-allowed':'pointer'}}>
                {loading?(isAr?'جارٍ الحجز...':'Booking...'):(isAr?'🔒 تأكيد الحجز':'🔒 Confirm Booking')}
              </button>
            </div>
          </div>
        )}

        {/* ═══ STEP 6: CONFIRMATION ═══ */}
        {step===6 && (
          <div style={{textAlign:'center',padding:'20px 0'}}>
            <div style={{background:'white',borderRadius:20,padding:40,boxShadow:'0 8px 32px rgba(26,58,92,.12)'}}>
              <div style={{fontSize:64,marginBottom:20,animation:'bounce .6s ease'}}>✅</div>
              <h2 style={{fontSize:26,fontWeight:800,color:'#1a3a5c',marginBottom:10}}>{isAr?'تم تأكيد الحجز!':'Booking Confirmed!'}</h2>
              <p style={{fontSize:14,color:'#7a9ab8',lineHeight:1.8,maxWidth:440,margin:'0 auto 28px'}}>
                {isAr
                  ? 'تم حجز جلستك بنجاح. ستتلقى تأكيداً عبر واتساب والبريد الإلكتروني قريباً.'
                  : 'Your session has been booked. You will receive a confirmation via WhatsApp and email shortly.'}
              </p>

              <div style={{background:'#eef4fa',borderRadius:14,padding:20,marginBottom:24,textAlign:isAr?'right':'left'}}>
                {[
                  [isAr?'رقم الحجز':'Booking Ref', bookingRef],
                  [isAr?'الخدمة':'Service', service==='social'?(isAr?'الإرشاد الاجتماعي':'Social Counseling'):(isAr?'التأهيل':'Rehab & Addiction')],
                  [isAr?'التاريخ والوقت':'Date & Time', `${selDate?.toLocaleDateString(isAr?'ar-KW':'en-US',{month:'long',day:'numeric'})} — ${selTime}`],
                  [isAr?'الطريقة':'Method', method==='video'?(isAr?'مكالمة فيديو':'Video Call'):'WhatsApp'],
                  [isAr?'المختص':'Specialist', 'Khalaf Jalal Alenizi'],
                  [isAr?'المبلغ':'Amount', `${price} KWD`],
                ].map(([k,v])=>(
                  <div key={k as string} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid rgba(74,144,196,.15)',fontSize:13}}>
                    <span style={{color:'#7a9ab8',fontWeight:500}}>{k}</span>
                    <span style={{color:'#1a3a5c',fontWeight:700}}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
                <a href="/dashboard" style={{...btnNext,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:8}}>
                  🏠 {isAr?'لوحة التحكم':'My Dashboard'}
                </a>
                <button onClick={()=>{setStep(1);setService('');setSelDate(null);setSelTime('');setReason('');setStressScore(0)}} style={btnBack}>
                  {isAr?'حجز جلسة أخرى':'Book Another'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
