'use client'
import { useState } from 'react'

export default function HomePage() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const [menuOpen, setMenuOpen] = useState(false)
  const isAr = lang === 'ar'

  const t = {
    nav_services:   isAr ? 'الخدمات'        : 'Services',
    nav_how:        isAr ? 'كيف يعمل'       : 'How It Works',
    nav_specialist: isAr ? 'المختص'          : 'Our Specialist',
    nav_contact:    isAr ? 'تواصل'           : 'Contact',
    nav_book:       isAr ? 'احجز الآن'       : 'Book Now',
    badge:          isAr ? 'ممارسة مرخصة ومعتمدة' : 'Licensed & Certified Practice',
    hero_h1a:       isAr ? 'طريقك نحو'       : 'Your Path to',
    hero_h1b:       isAr ? 'التعافي'          : 'Healing',
    hero_h1c:       isAr ? 'يبدأ هنا'         : 'Starts Here',
    hero_p:         isAr
      ? 'خدمات إرشاد نفسي واجتماعي احترافية عبر الإنترنت — سرية وإنسانية ومتاحة من أي مكان.'
      : 'Professional online counseling and behavioral rehabilitation — confidential, compassionate, accessible from anywhere.',
    book_btn:       isAr ? '📅 احجز جلسة'    : '📅 Book a Session',
    learn_btn:      isAr ? 'اعرف أكثر ←'    : 'Learn More →',
    trust1:         isAr ? 'سرية تامة'        : '100% Confidential',
    trust2:         isAr ? 'معتمد من المجلس الكندي' : 'Canadian Board Certified',
    trust3:         isAr ? 'عربي وإنجليزي'   : 'Arabic & English',
    how_label:      isAr ? 'خطوات بسيطة'     : 'Simple Process',
    how_title:      isAr ? 'كيف تعمل الخدمة' : 'How It Works',
    how_sub:        isAr ? 'ثلاث خطوات بسيطة لجلستك الأولى.' : 'Three simple steps to your first session.',
    step1_t:        isAr ? 'اختر الخدمة'     : 'Choose Your Service',
    step1_p:        isAr ? 'اختر بين الإرشاد الاجتماعي أو إعادة التأهيل، ثم أكمل نموذجاً سرياً.' : 'Choose between Social Counseling or Rehab, then fill a short confidential form.',
    step2_t:        isAr ? 'احجز وادفع'      : 'Book & Pay',
    step2_p:        isAr ? 'اختر تاريخاً وطريقتك المفضلة وأكمل الدفع بأمان.' : 'Pick a date, choose your method (video or WhatsApp), and pay securely.',
    step3_t:        isAr ? 'ابدأ رحلتك'      : 'Start Your Journey',
    step3_p:        isAr ? 'احضر جلستك وتابع تقدمك على لوحتك الخاصة.' : 'Attend your session and track your progress on your private dashboard.',
    svc_label:      isAr ? 'ما نقدمه'        : 'What We Offer',
    svc_title:      isAr ? 'خدماتنا'          : 'Our Services',
    svc1_t:         isAr ? 'الإرشاد الاجتماعي' : 'Social Counseling',
    svc1_p:         isAr ? 'إرشاد مهني لتحديات الحياة والعلاقات والضغوط والقلق والمشكلات الأسرية.' : 'Professional guidance for life challenges, relationships, stress, anxiety, and family issues.',
    svc1_f1:        isAr ? 'الإرشاد الأسري والعلائقي' : 'Relationship & family counseling',
    svc1_f2:        isAr ? 'إدارة التوتر والقلق'       : 'Stress & anxiety management',
    svc1_f3:        isAr ? 'التطوير الشخصي'            : 'Personal development coaching',
    svc1_f4:        isAr ? 'جلسة فيديو أو واتساب'      : 'Video call or WhatsApp session',
    svc2_t:         isAr ? 'التأهيل السلوكي وعلاج الإدمان' : 'Behavioral Rehab & Addiction',
    svc2_p:         isAr ? 'برامج تعافٍ منظمة للإدمان السلوكي والمخدرات مع دعم مستمر.' : 'Structured recovery for behavioral and substance addictions with ongoing support.',
    svc2_f1:        isAr ? 'إدمان المواد'              : 'Substance addiction counseling',
    svc2_f2:        isAr ? 'الإدمان السلوكي'           : 'Behavioral addiction (screens, gambling)',
    svc2_f3:        isAr ? 'برنامج تعافٍ منظم'         : 'Structured recovery program',
    svc2_f4:        isAr ? 'دعم مشاركة الأسرة'         : 'Family involvement support',
    book_svc:       isAr ? '📅 احجز جلسة'             : '📅 Book Session',
    privacy_t:      isAr ? 'خصوصيتك مقدسة'            : 'Your Privacy is Sacred',
    privacy_p:      isAr ? 'كل ما تشاركه سري تماماً ولن يُشارك مع أي أحد — حتى أفراد الأسرة. ثقتك هي أساسنا.' : 'Everything you share is strictly confidential and never shared with anyone — not even family members.',
    spec_label:     isAr ? 'مختصك'                    : 'Your Specialist',
    spec_title:     isAr ? 'تعرف على مختصك'           : 'Meet Your Counselor',
    spec_name:      isAr ? 'خلف جلال العنيزي'         : 'Khalaf Jalal Alenizi',
    spec_role:      isAr ? 'مختص تأهيل السلوك وعلاج الإدمان' : 'Behavioral & Addiction Treatment Specialist',
    spec_p:         isAr ? 'مختص معتمد حاصل على دبلوم من المجلس الكندي بتقدير ممتاز 93%. يقدم دعماً إنسانياً قائماً على الأدلة للأفراد الذين يواجهون تحديات اجتماعية وسلوكية وإدمانية.' : 'Canadian Board certified specialist with a Diploma grade of Excellent (93%). Provides compassionate, evidence-based support for social, behavioral, and addiction challenges.',
    method_label:   isAr ? 'اختر كيف تتواصل'          : 'Choose How to Connect',
    method_title:   isAr ? 'طرق الجلسة'               : 'Session Methods',
    m1_t:           isAr ? 'مكالمة فيديو'              : 'Video Call',
    m1_p:           isAr ? 'منصة مشفرة آمنة'           : 'Secure encrypted platform',
    m2_t:           isAr ? 'مكالمة واتساب'             : 'WhatsApp Call',
    m2_p:           isAr ? 'صوتية أو مرئية عبر واتساب' : 'Voice or video via WhatsApp',
    footer_desc:    isAr ? 'خدمات إرشاد نفسي واجتماعي وإعادة تأهيل سلوكي عبر الإنترنت. مرخصة في الكويت.' : 'Professional online counseling and behavioral rehabilitation. Licensed in Kuwait.',
    footer_lic:     isAr ? 'مرخصة من وزارة التجارة والصناعة — الكويت' : 'Licensed by Ministry of Commerce & Industry — Kuwait',
    footer_crn:     isAr ? 'الرقم التجاري: 6169403'   : 'Commercial Reg: 6169403',
    rights:         isAr ? '© 2025 وصال الدولية للاستشارات الاجتماعية' : '© 2025 Wesal International for Social Consultations',
  }

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ fontFamily: isAr ? 'Tajawal, sans-serif' : 'Montserrat, sans-serif' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        :root{
          --blue-dark:#1a3a5c;--blue-mid:#2a6090;--blue-light:#4a90c4;
          --blue-pale:#b8d8ec;--blue-bg:#eef4fa;--green:#2a9a6a;
          --text-mid:#3a5a7a;--text-light:#7a9ab8;
        }
        html{scroll-behavior:smooth;}
        .fade-up{animation:fadeUp .7s ease both;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
        .pulse{animation:pulse 2s infinite;}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.3)}}
        a{transition:opacity .2s;}
        a:hover{opacity:.8;}

        /* ── MOBILE ── */
        @media(max-width:768px){
          .desktop-nav{display:none!important;}
          .mobile-menu-btn{display:flex!important;}
          .hero-grid{grid-template-columns:1fr!important;gap:32px!important;padding:100px 20px 60px!important;}
          .hero-cards{display:none!important;}
          .hero-text h1{font-size:32px!important;}
          .hero-actions{flex-direction:column!important;}
          .hero-actions a{text-align:center;justify-content:center;}
          .trust-row{flex-wrap:wrap;gap:12px!important;}
          .steps-grid{grid-template-columns:1fr!important;}
          .steps-line{display:none!important;}
          .services-grid{grid-template-columns:1fr!important;}
          .methods-grid{grid-template-columns:1fr!important;}
          .specialist-card{grid-template-columns:1fr!important;text-align:center!important;}
          .specialist-avatar{margin:0 auto!important;}
          .spec-badges{justify-content:center!important;}
          .footer-grid{grid-template-columns:1fr!important;gap:32px!important;}
          .footer-bottom{flex-direction:column!important;text-align:center!important;gap:8px!important;}
          .section-pad{padding:60px 20px!important;}
          .privacy-banner{flex-direction:column!important;text-align:center!important;padding:24px!important;}
          .mobile-hero-badge{flex-wrap:wrap;}
        }
        @media(max-width:480px){
          .hero-text h1{font-size:26px!important;}
          nav{padding:12px 20px!important;}
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,background:'rgba(255,255,255,.97)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(74,144,196,.12)',padding:'14px 48px',display:'flex',alignItems:'center',justifyContent:'space-between',boxShadow:'0 2px 20px rgba(26,58,92,.07)'}}>
        <a href="/" style={{display:'flex',alignItems:'center',gap:12,textDecoration:'none'}}>
          <svg width="38" height="38" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="38" fill="#eef4fa"/>
            <clipPath id="lc"><circle cx="40" cy="40" r="35"/></clipPath>
            <path d="M40 8 L40 26 Q35 26 33 30 Q31 35 36 37 Q41 39 40 40 L18 40 L18 22 Q23 22 25 18 Q27 13 22 11 Q17 9 18 8Z" fill="#2a6090" clipPath="url(#lc)"/>
            <path d="M40 8 L62 8 Q61 9 56 11 Q51 13 53 18 Q55 22 60 22 L62 40 L40 40 Q39 39 44 37 Q49 35 47 30 Q45 26 40 26Z" fill="#4a90c4" clipPath="url(#lc)"/>
            <path d="M18 40 L40 40 Q40 41 36 43 Q31 45 33 50 Q35 54 40 54 L40 72 L18 72 Q18 62 23 60 Q28 58 26 53 Q24 48 18 50Z" fill="#7ab5d8" clipPath="url(#lc)"/>
            <path d="M40 40 L62 40 Q56 38 54 43 Q52 48 57 53 Q62 58 62 72 L40 72 L40 54 Q45 54 47 50 Q49 45 44 43 Q39 41 40 40Z" fill="#b8d8ec" clipPath="url(#lc)"/>
          </svg>
          <div>
            <div style={{fontWeight:800,fontSize:14,color:'#1a3a5c',letterSpacing:'1.5px'}}>WESAL</div>
            <div style={{fontSize:8,fontWeight:500,color:'#4a90c4',letterSpacing:'2px',textTransform:'uppercase'}}>International</div>
          </div>
        </a>

        {/* Desktop nav */}
        <div className="desktop-nav" style={{display:'flex',gap:28}}>
          {[['#services',t.nav_services],['#how',t.nav_how],['#specialist',t.nav_specialist],['#contact',t.nav_contact]].map(([href,label])=>(
            <a key={href} href={href} style={{textDecoration:'none',fontSize:13,fontWeight:500,color:'#3a5a7a'}}>{label}</a>
          ))}
        </div>

        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <button onClick={()=>setLang(isAr?'en':'ar')} style={{background:'#eef4fa',border:'1px solid #b8d8ec',color:'#2a6090',fontSize:12,fontWeight:600,padding:'7px 14px',borderRadius:20,cursor:'pointer',fontFamily:'inherit'}}>
            {isAr ? 'English' : 'العربية'}
          </button>
          <a href="/login" style={{background:'white',color:'#2a6090',padding:'9px 18px',borderRadius:25,fontSize:13,fontWeight:600,textDecoration:'none',border:'2px solid #b8d8ec'}}>
            {isAr ? 'دخول' : 'Login'}
          </a>
          <a href="/book" style={{background:'#2a6090',color:'white',padding:'9px 20px',borderRadius:25,fontSize:13,fontWeight:600,textDecoration:'none'}}>
            {t.nav_book}
          </a>
          {/* Mobile menu button */}
          <button className="mobile-menu-btn" onClick={()=>setMenuOpen(!menuOpen)} style={{display:'none',background:'none',border:'none',cursor:'pointer',fontSize:22,color:'#1a3a5c',padding:4}}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{position:'fixed',top:64,left:0,right:0,zIndex:99,background:'white',borderBottom:'1px solid #eef4fa',padding:'20px',display:'flex',flexDirection:'column',gap:16,boxShadow:'0 8px 24px rgba(26,58,92,.1)'}}>
          {[['#services',t.nav_services],['#how',t.nav_how],['#specialist',t.nav_specialist],['#contact',t.nav_contact]].map(([href,label])=>(
            <a key={href} href={href} onClick={()=>setMenuOpen(false)} style={{textDecoration:'none',fontSize:15,fontWeight:600,color:'#1a3a5c',padding:'8px 0',borderBottom:'1px solid #eef4fa'}}>{label}</a>
          ))}
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{minHeight:'100vh',background:'linear-gradient(145deg,#eef4fa 0%,#dceef8 40%,#f0f7ff 100%)',display:'flex',alignItems:'center',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,pointerEvents:'none'}}>
          <div style={{position:'absolute',width:500,height:500,top:-100,right:-100,borderRadius:'50%',background:'radial-gradient(circle,rgba(74,144,196,.08) 0%,transparent 70%)'}}/>
          <div style={{position:'absolute',width:350,height:350,bottom:-50,left:-50,borderRadius:'50%',background:'radial-gradient(circle,rgba(74,144,196,.06) 0%,transparent 70%)'}}/>
        </div>

        <div className="hero-grid" style={{maxWidth:1200,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:60,alignItems:'center',width:'100%',padding:'120px 48px 80px'}}>
          <div className="fade-up hero-text">
            <div className="mobile-hero-badge" style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(74,144,196,.1)',border:'1px solid rgba(74,144,196,.25)',color:'#2a6090',fontSize:11,fontWeight:600,padding:'6px 14px',borderRadius:20,letterSpacing:'2px',textTransform:'uppercase',marginBottom:24}}>
              <span className="pulse" style={{width:6,height:6,borderRadius:'50%',background:'#2a9a6a',display:'inline-block'}}/>
              {t.badge}
            </div>
            <h1 style={{fontFamily:isAr?'Tajawal,sans-serif':'Playfair Display,serif',fontSize:'clamp(28px,4vw,52px)',fontWeight:isAr?800:600,lineHeight:1.2,color:'#1a3a5c',marginBottom:20}}>
              {t.hero_h1a} <em style={{fontStyle:'italic',color:'#4a90c4'}}>{t.hero_h1b}</em> {t.hero_h1c}
            </h1>
            <p style={{fontSize:15,lineHeight:1.8,color:'#3a5a7a',maxWidth:480,marginBottom:32}}>{t.hero_p}</p>
            <div className="hero-actions" style={{display:'flex',gap:14,flexWrap:'wrap',marginBottom:28}}>
              <a href="/book" style={{display:'inline-flex',alignItems:'center',gap:8,background:'#2a6090',color:'white',padding:'13px 28px',borderRadius:30,fontSize:14,fontWeight:600,textDecoration:'none',boxShadow:'0 6px 20px rgba(42,96,144,.3)'}}>
                {t.book_btn}
              </a>
              <a href="#services" style={{display:'inline-flex',alignItems:'center',gap:8,background:'white',color:'#2a6090',padding:'13px 28px',borderRadius:30,fontSize:14,fontWeight:600,textDecoration:'none',border:'2px solid #b8d8ec'}}>
                {t.learn_btn}
              </a>
            </div>
            <div className="trust-row" style={{display:'flex',alignItems:'center',gap:16,paddingTop:20,borderTop:'1px solid rgba(74,144,196,.15)'}}>
              {[['🔒',t.trust1],['🏅',t.trust2],['🌐',t.trust3]].map(([icon,label])=>(
                <div key={label as string} style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'#7a9ab8',fontWeight:500}}>
                  <span style={{fontSize:15}}>{icon}</span>{label}
                </div>
              ))}
            </div>
          </div>

          {/* Floating cards - hidden on mobile */}
          <div className="hero-cards" style={{position:'relative',width:340,height:400,margin:'0 auto'}}>
            {[
              {top:0,left:0,rotate:'-3deg',icon:'🧠',en:'Social Counseling',ar:'الإرشاد الاجتماعي',tag:'VIDEO CALL'},
              {top:80,right:0,rotate:'2deg',icon:'🌱',en:'Addiction Rehab',ar:'علاج الإدمان',tag:'WHATSAPP'},
              {bottom:0,left:20,rotate:'-1deg',icon:'✅',en:'Progress Tracking',ar:'متابعة التقدم',tag:'PRIVATE'},
            ].map((card,i)=>(
              <div key={i} style={{position:'absolute',background:'white',borderRadius:18,padding:24,boxShadow:'0 16px 48px rgba(26,58,92,.14)',top:card.top,left:card.left,right:card.right,bottom:card.bottom,width:260,transform:`rotate(${card.rotate})`}}>
                <div style={{fontSize:28,marginBottom:10}}>{card.icon}</div>
                <div style={{fontSize:14,fontWeight:700,color:'#1a3a5c',marginBottom:4}}>{isAr ? card.ar : card.en}</div>
                <span style={{display:'inline-block',background:'#eef4fa',color:'#2a6090',fontSize:10,fontWeight:600,padding:'3px 10px',borderRadius:10,letterSpacing:1}}>{card.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="section-pad" style={{padding:'80px 48px',background:'white'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <p style={{fontSize:11,fontWeight:600,letterSpacing:4,textTransform:'uppercase',color:'#4a90c4',marginBottom:10}}>{t.how_label}</p>
          <h2 style={{fontFamily:isAr?'Tajawal,sans-serif':'Playfair Display,serif',fontSize:'clamp(24px,3vw,40px)',fontWeight:isAr?800:600,color:'#1a3a5c',marginBottom:14}}>{t.how_title}</h2>
          <p style={{fontSize:14,color:'#3a5a7a',lineHeight:1.7,maxWidth:520,marginBottom:50}}>{t.how_sub}</p>
          <div className="steps-grid" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:32,position:'relative'}}>
            <div className="steps-line" style={{position:'absolute',top:34,left:'10%',right:'10%',height:2,background:'linear-gradient(to right,#b8d8ec,#4a90c4,#b8d8ec)'}}/>
            {[[1,t.step1_t,t.step1_p],[2,t.step2_t,t.step2_p],[3,t.step3_t,t.step3_p]].map(([num,title,desc])=>(
              <div key={num as number} style={{display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',position:'relative',zIndex:1,padding:'0 16px'}}>
                <div style={{width:68,height:68,borderRadius:'50%',background:'white',border:'3px solid #b8d8ec',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:700,color:'#2a6090',marginBottom:20,boxShadow:'0 4px 16px rgba(74,144,196,.15)'}}>{num}</div>
                <h3 style={{fontSize:15,fontWeight:700,color:'#1a3a5c',marginBottom:8}}>{title}</h3>
                <p style={{fontSize:13,color:'#3a5a7a',lineHeight:1.7}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="section-pad" style={{padding:'80px 48px',background:'#f7fafd'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <p style={{fontSize:11,fontWeight:600,letterSpacing:4,textTransform:'uppercase',color:'#4a90c4',marginBottom:10}}>{t.svc_label}</p>
          <h2 style={{fontFamily:isAr?'Tajawal,sans-serif':'Playfair Display,serif',fontSize:'clamp(24px,3vw,40px)',fontWeight:isAr?800:600,color:'#1a3a5c',marginBottom:48}}>{t.svc_title}</h2>
          <div className="services-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,marginBottom:24}}>
            {[
              {gradient:'linear-gradient(135deg,#1a3a5c,#2a6090)',icon:'🧠',title:t.svc1_t,desc:t.svc1_p,features:[t.svc1_f1,t.svc1_f2,t.svc1_f3,t.svc1_f4],btnColor:'#2a6090'},
              {gradient:'linear-gradient(135deg,#1a4a3a,#2a8060)',icon:'🌱',title:t.svc2_t,desc:t.svc2_p,features:[t.svc2_f1,t.svc2_f2,t.svc2_f3,t.svc2_f4],btnColor:'#2a8060'},
            ].map((svc,i)=>(
              <div key={i} style={{background:'white',borderRadius:20,overflow:'hidden',boxShadow:'0 4px 24px rgba(26,58,92,.08)',border:'1px solid rgba(74,144,196,.08)'}}>
                <div style={{padding:'32px 32px 28px',background:svc.gradient}}>
                  <span style={{fontSize:36,display:'block',marginBottom:12}}>{svc.icon}</span>
                  <h3 style={{fontSize:18,fontWeight:700,color:'white',marginBottom:10}}>{svc.title}</h3>
                  <p style={{fontSize:13,color:'rgba(255,255,255,.75)',lineHeight:1.6}}>{svc.desc}</p>
                </div>
                <div style={{padding:28}}>
                  <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:10,marginBottom:20}}>
                    {svc.features.map((f,j)=>(
                      <li key={j} style={{display:'flex',alignItems:'center',gap:10,fontSize:13,color:'#3a5a7a'}}>
                        <span style={{width:20,height:20,borderRadius:'50%',background:'#eef4fa',color:'#2a6090',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,flexShrink:0}}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a href="/book" style={{display:'block',background:svc.btnColor,color:'white',borderRadius:12,padding:13,fontSize:13,fontWeight:600,textAlign:'center',textDecoration:'none'}}>
                    {t.book_svc}
                  </a>
                </div>
              </div>
            ))}
          </div>
          <div className="privacy-banner" style={{background:'#f0f7ff',border:'1px solid rgba(74,144,196,.2)',borderRadius:16,padding:'28px 36px',display:'flex',alignItems:'center',gap:20}}>
            <span style={{fontSize:40,flexShrink:0}}>🔒</span>
            <div>
              <h3 style={{fontSize:16,fontWeight:700,color:'#1a3a5c',marginBottom:6}}>{t.privacy_t}</h3>
              <p style={{fontSize:13,color:'#3a5a7a',lineHeight:1.7}}>{t.privacy_p}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SESSION METHODS ── */}
      <section className="section-pad" style={{padding:'80px 48px',background:'linear-gradient(135deg,#1a3a5c 0%,#1a4a6a 100%)'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <p style={{fontSize:11,fontWeight:600,letterSpacing:4,textTransform:'uppercase',color:'rgba(255,255,255,.5)',marginBottom:10}}>{t.method_label}</p>
          <h2 style={{fontFamily:isAr?'Tajawal,sans-serif':'Playfair Display,serif',fontSize:'clamp(24px,3vw,40px)',fontWeight:isAr?800:600,color:'white',marginBottom:48}}>{t.method_title}</h2>
          <div className="methods-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            {[{icon:'🎥',title:t.m1_t,desc:t.m1_p,badge:'SECURE · ENCRYPTED'},{icon:'💬',title:t.m2_t,desc:t.m2_p,badge:'EASY · FAMILIAR'}].map((m,i)=>(
              <div key={i} style={{background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.12)',borderRadius:18,padding:'36px 28px',textAlign:'center'}}>
                <span style={{fontSize:44,display:'block',marginBottom:16}}>{m.icon}</span>
                <h3 style={{fontSize:18,fontWeight:700,color:'white',marginBottom:10}}>{m.title}</h3>
                <p style={{fontSize:13,color:'rgba(255,255,255,.6)',lineHeight:1.6,marginBottom:16}}>{m.desc}</p>
                <span style={{display:'inline-block',background:'rgba(74,144,196,.3)',color:'#b8d8ec',fontSize:10,fontWeight:600,padding:'4px 12px',borderRadius:10,letterSpacing:'1.5px'}}>{m.badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECIALIST ── */}
      <section id="specialist" className="section-pad" style={{padding:'80px 48px',background:'white'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <p style={{fontSize:11,fontWeight:600,letterSpacing:4,textTransform:'uppercase',color:'#4a90c4',marginBottom:10}}>{t.spec_label}</p>
          <h2 style={{fontFamily:isAr?'Tajawal,sans-serif':'Playfair Display,serif',fontSize:'clamp(24px,3vw,40px)',fontWeight:isAr?800:600,color:'#1a3a5c',marginBottom:36}}>{t.spec_title}</h2>
          <div className="specialist-card" style={{display:'grid',gridTemplateColumns:'auto 1fr',gap:40,alignItems:'center',background:'white',borderRadius:20,padding:'40px',boxShadow:'0 4px 24px rgba(26,58,92,.08)',border:'1px solid rgba(74,144,196,.08)'}}>
            <div className="specialist-avatar" style={{width:140,height:140,borderRadius:'50%',background:'linear-gradient(135deg,#4a90c4,#1a3a5c)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:48,boxShadow:'0 8px 24px rgba(42,96,144,.25)',flexShrink:0}}>👨‍⚕️</div>
            <div>
              <h3 style={{fontSize:22,fontWeight:700,color:'#1a3a5c',marginBottom:4}}>{t.spec_name}</h3>
              <p style={{fontSize:13,color:'#4a90c4',fontWeight:500,marginBottom:16}}>{t.spec_role}</p>
              <div className="spec-badges" style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:16}}>
                {[['🍁','Canadian Board Certified'],['📋','License: K000746J/AT'],['⭐','Grade: Excellent 93%'],['📅','Certified: March 2024']].map(([icon,label])=>(
                  <span key={label as string} style={{display:'inline-flex',alignItems:'center',gap:5,background:'#eef4fa',border:'1px solid #b8d8ec',color:'#2a6090',fontSize:11,fontWeight:600,padding:'5px 12px',borderRadius:16}}>
                    {icon} {label}
                  </span>
                ))}
              </div>
              <p style={{fontSize:13,color:'#3a5a7a',lineHeight:1.8}}>{t.spec_p}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="contact" style={{background:'#1a3a5c',color:'rgba(255,255,255,.7)',padding:'56px 48px 28px'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div className="footer-grid" style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:40,marginBottom:40}}>
            <div>
              <div style={{fontSize:16,fontWeight:800,color:'white',letterSpacing:1,marginBottom:4}}>WESAL INTERNATIONAL</div>
              <div style={{fontSize:9,letterSpacing:3,color:'#b8d8ec',textTransform:'uppercase',marginBottom:14}}>Social Consultations</div>
              <p style={{fontSize:12,lineHeight:1.8,maxWidth:260,marginBottom:14}}>{t.footer_desc}</p>
              <p style={{fontSize:13,marginBottom:6}}>📞 <a href="tel:+96593331533" style={{color:'rgba(255,255,255,.7)',textDecoration:'none'}}>+96593331533</a></p>
              <p style={{fontSize:13,marginBottom:6}}>✉️ <a href="mailto:khalaf-j@hotmail.com" style={{color:'rgba(255,255,255,.7)',textDecoration:'none'}}>khalaf-j@hotmail.com</a></p>
              <p style={{fontSize:12,marginTop:10,color:'rgba(255,255,255,.5)'}}>🏢 {t.footer_crn}</p>
            </div>
            <div>
              <h4 style={{fontSize:11,fontWeight:600,letterSpacing:2,textTransform:'uppercase',color:'white',marginBottom:16}}>{t.nav_services}</h4>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {[t.svc1_t,t.svc2_t,t.nav_book].map(s=>(
                  <a key={s as string} href="/book" style={{color:'rgba(255,255,255,.6)',textDecoration:'none',fontSize:13}}>{s}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{fontSize:11,fontWeight:600,letterSpacing:2,textTransform:'uppercase',color:'white',marginBottom:16}}>{t.nav_contact}</h4>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {[t.privacy_t,'FAQ',isAr?'واتساب':'WhatsApp'].map(s=>(
                  <a key={s as string} href="#" style={{color:'rgba(255,255,255,.6)',textDecoration:'none',fontSize:13}}>{s}</a>
                ))}
              </div>
            </div>
          </div>
          <div className="footer-bottom" style={{borderTop:'1px solid rgba(255,255,255,.1)',paddingTop:20,display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:11,color:'rgba(255,255,255,.4)',flexWrap:'wrap',gap:8}}>
            <span>{t.rights}</span>
            <span>{t.footer_lic}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
