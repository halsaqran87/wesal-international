'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
  const [lang, setLang]         = useState<'ar'|'en'>('ar')
  const [step, setStep]         = useState(1)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const isAr = lang === 'ar'

  const [form, setForm] = useState({
    preferred_name: '',
    email: '',
    password: '',
    confirm_password: '',
    age: '',
    gender: '',
    nationality: '',
    whatsapp: '',
    language: 'ar',
    service_type: '',
    prev_counseling: 'no',
  })

  const set = (k: string, v: string) => setForm(f => ({...f, [k]: v}))

  const t = {
    title:     isAr ? 'إنشاء حساب جديد'    : 'Create Your Account',
    subtitle:  isAr ? 'ابدأ رحلتك مع وصال' : 'Start your journey with Wesal',
    step1:     isAr ? 'بيانات الدخول'       : 'Account Details',
    step2:     isAr ? 'معلوماتك'            : 'Your Info',
    next:      isAr ? 'التالي ←'            : 'Next →',
    back:      isAr ? '→ رجوع'             : '← Back',
    submit:    isAr ? 'إنشاء الحساب'        : 'Create Account',
    loading:   isAr ? 'جارٍ الإنشاء...'    : 'Creating account...',
    has_account: isAr ? 'لديك حساب بالفعل؟' : 'Already have an account?',
    login:     isAr ? 'تسجيل الدخول'       : 'Sign In',
    privacy:   isAr ? '🔒 معلوماتك سرية تماماً ولن تُشارك مع أي أحد' : '🔒 Your information is completely private and never shared',
    f_name:    isAr ? 'الاسم المفضل أو اسم مستعار' : 'Preferred Name or Nickname',
    f_email:   isAr ? 'البريد الإلكتروني'  : 'Email Address',
    f_pass:    isAr ? 'كلمة المرور'        : 'Password',
    f_confirm: isAr ? 'تأكيد كلمة المرور' : 'Confirm Password',
    f_age:     isAr ? 'العمر'               : 'Age',
    f_gender:  isAr ? 'الجنس'              : 'Gender',
    f_nat:     isAr ? 'الجنسية'            : 'Nationality',
    f_wa:      isAr ? 'رقم واتساب'         : 'WhatsApp Number',
    f_lang:    isAr ? 'اللغة المفضلة'      : 'Preferred Language',
    f_svc:     isAr ? 'نوع الخدمة'         : 'Service Type',
    g_male:    isAr ? 'ذكر'                : 'Male',
    g_female:  isAr ? 'أنثى'              : 'Female',
    g_pref:    isAr ? 'أفضل عدم الإفصاح'  : 'Prefer not to say',
    l_ar:      isAr ? 'العربية'            : 'Arabic',
    l_en:      isAr ? 'الإنجليزية'         : 'English',
    l_both:    isAr ? 'كلتاهما'            : 'Both',
    s_social:  isAr ? 'الإرشاد الاجتماعي' : 'Social Counseling',
    s_addict:  isAr ? 'التأهيل وعلاج الإدمان' : 'Rehabilitation & Addiction',
  }

  const inputStyle = {
    width:'100%',border:'2px solid #b8d8ec',borderRadius:12,
    padding:'12px 16px',fontSize:14,fontFamily:'inherit',
    outline:'none',color:'#0f2233',background:'white',
  }
  const labelStyle = {fontSize:12,fontWeight:600,color:'#3a5a7a',display:'block',marginBottom:6} as React.CSSProperties

  async function handleSubmit() {
    if (form.password !== form.confirm_password) {
      setError(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match')
      return
    }
    setLoading(true); setError('')

    // 1. Create auth user
    const { data, error: authErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })
    if (authErr || !data.user) {
      setError(isAr ? 'حدث خطأ، حاول مرة أخرى' : 'An error occurred, please try again')
      setLoading(false); return
    }

    // 2. Create profile
    const { error: profileErr } = await supabase.from('profiles').insert({
      id: data.user.id,
      preferred_name: form.preferred_name,
      email: form.email,
      age: form.age ? parseInt(form.age) : null,
      gender: form.gender || null,
      nationality: form.nationality || null,
      whatsapp: form.whatsapp || null,
      language: form.language as 'ar'|'en'|'both',
      role: 'client',
      service_type: form.service_type as 'social'|'addiction' || null,
    })

    if (profileErr) {
      setError(isAr ? 'خطأ في إنشاء الملف الشخصي' : 'Error creating profile')
      setLoading(false); return
    }

    window.location.href = '/dashboard'
  }

  return (
    <div dir={isAr?'rtl':'ltr'} style={{minHeight:'100vh',background:'linear-gradient(145deg,#eef4fa,#dceef8)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,fontFamily:isAr?'Tajawal,sans-serif':'Montserrat,sans-serif'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=Montserrat:wght@400;500;600;700&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>

      <div style={{width:'100%',maxWidth:480}}>

        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:28}}>
          <a href="/" style={{display:'inline-flex',alignItems:'center',gap:12,textDecoration:'none',justifyContent:'center'}}>
            <svg width="40" height="40" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="38" fill="#eef4fa"/>
              <clipPath id="lc2"><circle cx="40" cy="40" r="35"/></clipPath>
              <path d="M40 8 L40 26 Q35 26 33 30 Q31 35 36 37 Q41 39 40 40 L18 40 L18 22 Q23 22 25 18 Q27 13 22 11 Q17 9 18 8Z" fill="#2a6090" clipPath="url(#lc2)"/>
              <path d="M40 8 L62 8 Q61 9 56 11 Q51 13 53 18 Q55 22 60 22 L62 40 L40 40 Q39 39 44 37 Q49 35 47 30 Q45 26 40 26Z" fill="#4a90c4" clipPath="url(#lc2)"/>
              <path d="M18 40 L40 40 Q40 41 36 43 Q31 45 33 50 Q35 54 40 54 L40 72 L18 72 Q18 62 23 60 Q28 58 26 53 Q24 48 18 50Z" fill="#7ab5d8" clipPath="url(#lc2)"/>
              <path d="M40 40 L62 40 Q56 38 54 43 Q52 48 57 53 Q62 58 62 72 L40 72 L40 54 Q45 54 47 50 Q49 45 44 43 Q39 41 40 40Z" fill="#b8d8ec" clipPath="url(#lc2)"/>
            </svg>
            <div style={{textAlign:isAr?'right':'left'}}>
              <div style={{fontWeight:800,fontSize:15,color:'#1a3a5c',letterSpacing:'1.5px'}}>WESAL</div>
              <div style={{fontSize:9,color:'#4a90c4',letterSpacing:'2px',textTransform:'uppercase'}}>International</div>
            </div>
          </a>
        </div>

        {/* Progress */}
        <div style={{display:'flex',gap:8,marginBottom:24}}>
          {[1,2].map(n=>(
            <div key={n} style={{flex:1,height:4,borderRadius:2,background:n<=step?'#2a6090':'#b8d8ec',transition:'background .3s'}}/>
          ))}
        </div>

        {/* Card */}
        <div style={{background:'white',borderRadius:24,padding:36,boxShadow:'0 12px 48px rgba(26,58,92,.13)',border:'1px solid rgba(74,144,196,.08)'}}>
          <div style={{marginBottom:24}}>
            <h1 style={{fontSize:24,fontWeight:800,color:'#1a3a5c',marginBottom:4}}>{t.title}</h1>
            <p style={{fontSize:13,color:'#7a9ab8'}}>{t.subtitle}</p>
          </div>

          {error && (
            <div style={{background:'#fef0f0',border:'1px solid rgba(224,80,80,.2)',borderRadius:10,padding:'10px 14px',marginBottom:16,fontSize:13,color:'#e05050'}}>
              ⚠️ {error}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <div>
                <label style={labelStyle}>{t.f_name} <span style={{color:'#e05050'}}>*</span></label>
                <input style={inputStyle} value={form.preferred_name} onChange={e=>set('preferred_name',e.target.value)}
                  placeholder={isAr?'اسمك أو اسم مستعار':'Your name or nickname'}
                  onFocus={e=>e.target.style.borderColor='#2a6090'} onBlur={e=>e.target.style.borderColor='#b8d8ec'}/>
              </div>
              <div>
                <label style={labelStyle}>{t.f_email} <span style={{color:'#e05050'}}>*</span></label>
                <input style={inputStyle} type="email" value={form.email} onChange={e=>set('email',e.target.value)}
                  placeholder="example@email.com"
                  onFocus={e=>e.target.style.borderColor='#2a6090'} onBlur={e=>e.target.style.borderColor='#b8d8ec'}/>
              </div>
              <div>
                <label style={labelStyle}>{t.f_pass} <span style={{color:'#e05050'}}>*</span></label>
                <input style={inputStyle} type="password" value={form.password} onChange={e=>set('password',e.target.value)}
                  placeholder="••••••••"
                  onFocus={e=>e.target.style.borderColor='#2a6090'} onBlur={e=>e.target.style.borderColor='#b8d8ec'}/>
              </div>
              <div>
                <label style={labelStyle}>{t.f_confirm} <span style={{color:'#e05050'}}>*</span></label>
                <input style={inputStyle} type="password" value={form.confirm_password} onChange={e=>set('confirm_password',e.target.value)}
                  placeholder="••••••••"
                  onFocus={e=>e.target.style.borderColor='#2a6090'} onBlur={e=>e.target.style.borderColor='#b8d8ec'}/>
              </div>
              <button onClick={()=>{
                if(!form.preferred_name||!form.email||!form.password||!form.confirm_password){setError(isAr?'يرجى ملء جميع الحقول':'Please fill all fields');return}
                if(form.password!==form.confirm_password){setError(isAr?'كلمتا المرور غير متطابقتين':'Passwords do not match');return}
                setError('');setStep(2)
              }} style={{background:'#2a6090',color:'white',border:'none',borderRadius:25,padding:14,fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'inherit',marginTop:4,boxShadow:'0 4px 15px rgba(42,96,144,.3)'}}>
                {t.next}
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div>
                  <label style={labelStyle}>{t.f_age}</label>
                  <input style={inputStyle} type="number" min="16" max="99" value={form.age} onChange={e=>set('age',e.target.value)}
                    placeholder="25" onFocus={e=>e.target.style.borderColor='#2a6090'} onBlur={e=>e.target.style.borderColor='#b8d8ec'}/>
                </div>
                <div>
                  <label style={labelStyle}>{t.f_gender}</label>
                  <select style={{...inputStyle,height:46}} value={form.gender} onChange={e=>set('gender',e.target.value)}>
                    <option value="">{isAr?'اختر...':'Select...'}</option>
                    <option value="male">{t.g_male}</option>
                    <option value="female">{t.g_female}</option>
                    <option value="prefer-not">{t.g_pref}</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>{t.f_nat}</label>
                <input style={inputStyle} value={form.nationality} onChange={e=>set('nationality',e.target.value)}
                  placeholder={isAr?'مثال: كويتي':'e.g. Kuwaiti'}
                  onFocus={e=>e.target.style.borderColor='#2a6090'} onBlur={e=>e.target.style.borderColor='#b8d8ec'}/>
              </div>
              <div>
                <label style={labelStyle}>{t.f_wa}</label>
                <input style={inputStyle} type="tel" value={form.whatsapp} onChange={e=>set('whatsapp',e.target.value)}
                  placeholder="+965 XXXX XXXX"
                  onFocus={e=>e.target.style.borderColor='#2a6090'} onBlur={e=>e.target.style.borderColor='#b8d8ec'}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div>
                  <label style={labelStyle}>{t.f_lang}</label>
                  <select style={{...inputStyle,height:46}} value={form.language} onChange={e=>set('language',e.target.value)}>
                    <option value="ar">{t.l_ar}</option>
                    <option value="en">{t.l_en}</option>
                    <option value="both">{t.l_both}</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{t.f_svc}</label>
                  <select style={{...inputStyle,height:46}} value={form.service_type} onChange={e=>set('service_type',e.target.value)}>
                    <option value="">{isAr?'اختر...':'Select...'}</option>
                    <option value="social">{t.s_social}</option>
                    <option value="addiction">{t.s_addict}</option>
                  </select>
                </div>
              </div>

              {/* Privacy note */}
              <div style={{background:'#eafaf3',border:'1px solid rgba(42,154,106,.2)',borderRadius:10,padding:'12px 14px',fontSize:12,color:'#1a6a4a'}}>
                🔒 {isAr
                  ? 'يمكنك استخدام اسم مستعار. بياناتك سرية ولن تُشارك مع أحد.'
                  : 'You may use a nickname. Your data is private and never shared.'}
              </div>

              <div style={{display:'flex',gap:10,marginTop:4}}>
                <button onClick={()=>setStep(1)} style={{flex:1,background:'white',color:'#2a6090',border:'2px solid #b8d8ec',borderRadius:25,padding:13,fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}}>
                  {t.back}
                </button>
                <button onClick={handleSubmit} disabled={loading} style={{flex:2,background:loading?'#b8d8ec':'#2a6090',color:'white',border:'none',borderRadius:25,padding:13,fontSize:14,fontWeight:700,cursor:loading?'not-allowed':'pointer',fontFamily:'inherit',boxShadow:'0 4px 15px rgba(42,96,144,.3)'}}>
                  {loading ? t.loading : t.submit}
                </button>
              </div>
            </div>
          )}

          <div style={{textAlign:'center',marginTop:20,fontSize:13,color:'#7a9ab8'}}>
            {t.has_account}{' '}
            <a href="/login" style={{color:'#2a6090',fontWeight:700,textDecoration:'none'}}>{t.login}</a>
          </div>
        </div>

        <div style={{textAlign:'center',marginTop:18,fontSize:12,color:'#7a9ab8'}}>{t.privacy}</div>

        <div style={{textAlign:'center',marginTop:14}}>
          <button onClick={()=>setLang(isAr?'en':'ar')} style={{background:'none',border:'1px solid #b8d8ec',color:'#4a90c4',fontSize:12,fontWeight:600,padding:'6px 16px',borderRadius:16,cursor:'pointer',fontFamily:'inherit'}}>
            {isAr?'English':'العربية'}
          </button>
        </div>
      </div>
    </div>
  )
}
