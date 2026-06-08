'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [lang, setLang]       = useState<'ar'|'en'>('ar')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const isAr = lang === 'ar'

  const t = {
    title:       isAr ? 'تسجيل الدخول'           : 'Sign In',
    subtitle:    isAr ? 'مرحباً بعودتك إلى وصال' : 'Welcome back to Wesal',
    email:       isAr ? 'البريد الإلكتروني'       : 'Email Address',
    password:    isAr ? 'كلمة المرور'             : 'Password',
    forgot:      isAr ? 'نسيت كلمة المرور؟'      : 'Forgot password?',
    btn:         isAr ? 'تسجيل الدخول'            : 'Sign In',
    loading:     isAr ? 'جارٍ الدخول...'          : 'Signing in...',
    no_account:  isAr ? 'ليس لديك حساب؟'         : "Don't have an account?",
    register:    isAr ? 'إنشاء حساب'              : 'Create Account',
    privacy:     isAr ? '🔒 جلساتك سرية تماماً ومحمية' : '🔒 Your sessions are fully confidential and protected',
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })

    if (err) {
      setError(isAr ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password')
      setLoading(false)
      return
    }

    // Check role and redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role === 'consultant') {
      window.location.href = '/consultant'
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div dir={isAr?'rtl':'ltr'} style={{minHeight:'100vh',background:'linear-gradient(145deg,#eef4fa,#dceef8)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,fontFamily:isAr?'Tajawal,sans-serif':'Montserrat,sans-serif'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=Montserrat:wght@400;500;600;700&display=swap');*{margin:0;padding:0;box-sizing:border-box;}`}</style>

      <div style={{width:'100%',maxWidth:440}}>

        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:32}}>
          <a href="/" style={{display:'inline-flex',alignItems:'center',gap:12,textDecoration:'none',justifyContent:'center'}}>
            <svg width="44" height="44" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="38" fill="#eef4fa"/>
              <clipPath id="lc"><circle cx="40" cy="40" r="35"/></clipPath>
              <path d="M40 8 L40 26 Q35 26 33 30 Q31 35 36 37 Q41 39 40 40 L18 40 L18 22 Q23 22 25 18 Q27 13 22 11 Q17 9 18 8Z" fill="#2a6090" clipPath="url(#lc)"/>
              <path d="M40 8 L62 8 Q61 9 56 11 Q51 13 53 18 Q55 22 60 22 L62 40 L40 40 Q39 39 44 37 Q49 35 47 30 Q45 26 40 26Z" fill="#4a90c4" clipPath="url(#lc)"/>
              <path d="M18 40 L40 40 Q40 41 36 43 Q31 45 33 50 Q35 54 40 54 L40 72 L18 72 Q18 62 23 60 Q28 58 26 53 Q24 48 18 50Z" fill="#7ab5d8" clipPath="url(#lc)"/>
              <path d="M40 40 L62 40 Q56 38 54 43 Q52 48 57 53 Q62 58 62 72 L40 72 L40 54 Q45 54 47 50 Q49 45 44 43 Q39 41 40 40Z" fill="#b8d8ec" clipPath="url(#lc)"/>
            </svg>
            <div style={{textAlign:isAr?'right':'left'}}>
              <div style={{fontWeight:800,fontSize:15,color:'#1a3a5c',letterSpacing:'1.5px'}}>WESAL</div>
              <div style={{fontSize:9,color:'#4a90c4',letterSpacing:'2px',textTransform:'uppercase'}}>International</div>
            </div>
          </a>
        </div>

        {/* Card */}
        <div style={{background:'white',borderRadius:24,padding:40,boxShadow:'0 12px 48px rgba(26,58,92,.13)',border:'1px solid rgba(74,144,196,.08)'}}>
          <div style={{marginBottom:28,textAlign:'center'}}>
            <h1 style={{fontSize:26,fontWeight:800,color:'#1a3a5c',marginBottom:6}}>{t.title}</h1>
            <p style={{fontSize:14,color:'#7a9ab8'}}>{t.subtitle}</p>
          </div>

          {error && (
            <div style={{background:'#fef0f0',border:'1px solid rgba(224,80,80,.2)',borderRadius:10,padding:'12px 16px',marginBottom:20,fontSize:13,color:'#e05050',textAlign:'center'}}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:18}}>
            <div>
              <label style={{fontSize:12,fontWeight:600,color:'#3a5a7a',display:'block',marginBottom:6}}>{t.email}</label>
              <input
                type="email" required value={email}
                onChange={e=>setEmail(e.target.value)}
                placeholder="example@email.com"
                style={{width:'100%',border:'2px solid #b8d8ec',borderRadius:12,padding:'12px 16px',fontSize:14,fontFamily:'inherit',outline:'none',transition:'border-color .2s',color:'#0f2233'}}
                onFocus={e=>e.target.style.borderColor='#2a6090'}
                onBlur={e=>e.target.style.borderColor='#b8d8ec'}
              />
            </div>

            <div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <label style={{fontSize:12,fontWeight:600,color:'#3a5a7a'}}>{t.password}</label>
                <a href="/forgot-password" style={{fontSize:12,color:'#4a90c4',textDecoration:'none'}}>{t.forgot}</a>
              </div>
              <input
                type="password" required value={password}
                onChange={e=>setPassword(e.target.value)}
                placeholder="••••••••"
                style={{width:'100%',border:'2px solid #b8d8ec',borderRadius:12,padding:'12px 16px',fontSize:14,fontFamily:'inherit',outline:'none',transition:'border-color .2s',color:'#0f2233'}}
                onFocus={e=>e.target.style.borderColor='#2a6090'}
                onBlur={e=>e.target.style.borderColor='#b8d8ec'}
              />
            </div>

            <button
              type="submit" disabled={loading}
              style={{background:loading?'#b8d8ec':'#2a6090',color:'white',border:'none',borderRadius:25,padding:'14px',fontSize:15,fontWeight:700,cursor:loading?'not-allowed':'pointer',fontFamily:'inherit',transition:'all .2s',marginTop:4,boxShadow:'0 4px 15px rgba(42,96,144,.3)'}}>
              {loading ? t.loading : t.btn}
            </button>
          </form>

          <div style={{textAlign:'center',marginTop:24,fontSize:13,color:'#7a9ab8'}}>
            {t.no_account}{' '}
            <a href="/register" style={{color:'#2a6090',fontWeight:700,textDecoration:'none'}}>{t.register}</a>
          </div>
        </div>

        {/* Privacy note */}
        <div style={{textAlign:'center',marginTop:20,fontSize:12,color:'#7a9ab8'}}>{t.privacy}</div>

        {/* Lang toggle */}
        <div style={{textAlign:'center',marginTop:16}}>
          <button onClick={()=>setLang(isAr?'en':'ar')} style={{background:'none',border:'1px solid #b8d8ec',color:'#4a90c4',fontSize:12,fontWeight:600,padding:'6px 16px',borderRadius:16,cursor:'pointer',fontFamily:'inherit'}}>
            {isAr?'English':'العربية'}
          </button>
        </div>
      </div>
    </div>
  )
}
