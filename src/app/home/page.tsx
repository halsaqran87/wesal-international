'use client'
import { useState } from 'react'

export default function HomePage() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar')
  const isAr = lang === 'ar'

  const t = {
    nav_services:    isAr ? 'الخدمات'        : 'Services',
    nav_how:         isAr ? 'كيف يعمل'       : 'How It Works',
    nav_specialist:  isAr ? 'المختص'          : 'Our Specialist',
    nav_contact:     isAr ? 'تواصل'           : 'Contact',
    nav_book:        isAr ? 'احجز الآن'       : 'Book Now',
    badge:           isAr ? 'ممارسة مرخصة ومعتمدة' : 'Licensed & Certified Practice',
    hero_h1a:        isAr ? 'طريقك نحو'       : 'Your Path to',
    hero_h1b:        isAr ? 'التعافي'          : 'Healing',
    hero_h1c:        isAr ? 'يبدأ هنا'         : 'Starts Here',
    hero_p:          isAr
      ? 'خدمات إرشاد نفسي واجتماعي احترافية عبر الإنترنت — سرية وإنسانية ومتاحة من أي مكان.'
      : 'Professional online counseling and behavioral rehabilitation — confidential, compassionate, accessible from anywhere.',
    book_btn:        isAr ? '📅 احجز جلسة'    : '📅 Book a Session',
    learn_btn:       isAr ? 'اعرف أكثر ←'    : 'Learn More →',
    trust1:          isAr ? 'سرية تامة'        : '100% Confidential',
    trust2:          isAr ? 'معتمد من المجلس الكندي' : 'Canadian Board Certified',
    trust3:          isAr ? 'عربي وإنجليزي'   : 'Arabic & English',
    how_label:       isAr ? 'خطوات بسيطة'     : 'Simple Process',
    how_title:       isAr ? 'كيف تعمل الخدمة' : 'How It Works',
    how_sub:         isAr
      ? 'ثلاث خطوات بسيطة لجلستك الأولى.'
      : 'Three simple steps to your first session.',
    step1_t:         isAr ? 'اختر الخدمة'     : 'Choose Your Service',
    step1_p:         isAr
      ? 'اختر بين الإرشاد الاجتماعي أو إعادة التأهيل، ثم أكمل نموذجاً سرياً.'
      : 'Choose between Social Counseling or Rehab, then fill a short confidential form.',
    step2_t:         isAr ? 'احجز وادفع'      : 'Book & Pay',
    step2_p:         isAr
      ? 'اختر تاريخاً وطريقتك المفضلة وأكمل الدفع بأمان.'
      : 'Pick a date, choose your method (video or WhatsApp), and pay securely.',
    step3_t:         isAr ? 'ابدأ رحلتك'      : 'Start Your Journey',
    step3_p:         isAr
      ? 'احضر جلستك وتابع تقدمك على لوحتك الخاصة.'
      : 'Attend your session and track your progress on your private dashboard.',
    svc_label:       isAr ? 'ما نقدمه'        : 'What We Offer',
    svc_title:       isAr ? 'خدماتنا'          : 'Our Services',
    svc1_t:          isAr ? 'الإرشاد الاجتماعي' : 'Social Counseling',
    svc1_p:          isAr
      ? 'إرشاد مهني لتحديات الحياة والعلاقات والضغوط والقلق والمشكلات الأسرية.'
      : 'Professional guidance for life challenges, relationships, stress, anxiety, and family issues.',
    svc1_f1:         isAr ? 'الإرشاد الأسري والعلائقي' : 'Relationship & family counseling',
    svc1_f2:         isAr ? 'إدارة التوتر والقلق'       : 'Stress & anxiety management',
    svc1_f3:         isAr ? 'التطوير الشخصي'            : 'Personal development coaching',
    svc1_f4:         isAr ? 'جلسة فيديو أو واتساب'      : 'Video call or WhatsApp session',
    svc2_t:          isAr ? 'التأهيل السلوكي وعلاج الإدمان' : 'Behavioral Rehab & Addiction',
    svc2_p:          isAr
      ? 'برامج تعافٍ منظمة للإدمان السلوكي والمخدرات مع دعم مستمر.'
      : 'Structured recovery for behavioral and substance addictions with ongoing support.',
    svc2_f1:         isAr ? 'إدمان المواد'              : 'Substance addiction counseling',
    svc2_f2:         isAr ? 'الإدمان السلوكي'           : 'Behavioral addiction (screens, gambling)',
    svc2_f3:         isAr ? 'برنامج تعافٍ منظم'         : 'Structured recovery program',
    svc2_f4:         isAr ? 'دعم مشاركة الأسرة'         : 'Family involvement support',
    book_svc:        isAr ? '📅 احجز جلسة'             : '📅 Book Session',
    privacy_t:       isAr ? 'خصوصيتك مقدسة'            : 'Your Privacy is Sacred',
    privacy_p:       isAr
      ? 'كل ما تشاركه سري تماماً ولن يُشارك مع أي أحد — حتى أفراد الأسرة. ثقتك هي أساسنا.'
      : 'Everything you share is strictly confidential and never shared with anyone — not even family members.',
    spec_label:      isAr ? 'مختصك'                    : 'Your Specialist',
    spec_title:      isAr ? 'تعرف على مختصك'           : 'Meet Your Counselor',
    spec_name:       isAr ? 'خلف جلال العنيزي'         : 'Khalaf Jalal Alenizi',
    spec_role:       isAr ? 'مختص تأهيل السلوك وعلاج الإدمان' : 'Behavioral & Addiction Treatment Specialist',
    spec_p:          isAr
      ? 'مختص معتمد حاصل على دبلوم من المجلس الكندي بتقدير ممتاز 93%. يقدم دعماً إنسانياً قائماً على الأدلة للأفراد الذين يواجهون تحديات اجتماعية وسلوكية وإدمانية.'
      : 'Canadian Board certified specialist with a Diploma grade of Excellent (93%). Provides compassionate, evidence-based support for social, behavioral, and addiction challenges.',
    method_label:    isAr ? 'اختر كيف تتواصل'          : 'Choose How to Connect',
    method_title:    isAr ? 'طرق الجلسة'               : 'Session Methods',
    m1_t:            isAr ? 'مكالمة فيديو'              : 'Video Call',
    m1_p:            isAr ? 'منصة مشفرة آمنة'           : 'Secure encrypted platform',
    m2_t:            isAr ? 'مكالمة واتساب'             : 'WhatsApp Call',
    m2_p:            isAr ? 'صوتية أو مرئية عبر واتساب' : 'Voice or video via WhatsApp',
    footer_desc:     isAr
      ? 'خدمات إرشاد نفسي واجتماعي وإعادة تأهيل سلوكي عبر الإنترنت. مرخصة في الكويت.'
      : 'Professional online counseling and behavioral rehabilitation. Licensed in Kuwait.',
    footer_lic:      isAr
      ? 'مرخصة من وزارة التجارة والصناعة — الكويت'
      : 'Licensed by Ministry of Commerce & Industry — Kuwait',
    rights:          isAr
      ? '© 2025 وصال الدولية للاستشارات الاجتماعية'
      : '© 2025 Wesal International for Social Consultations',
  }

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ fontFamily: isAr ? 'Tajawal, sans-serif' : 'Montserrat, sans-serif' }}>

      {/* ── GOOGLE FONTS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        :root{
          --blue-dark:#1a3a5c;--blue-mid:#2a6090;--blue-light:#4a90c4;
          --blue-pale:#b8d8ec;--blue-bg:#eef4fa;--green:#2a9a6a;
          --text-mid:#3a5a7a;--text-light:#7a9ab8;--shadow:0 8px 40px rgba(26,58,92,.10);
        }
        html{scroll-behavior:smooth;}
        .fade-up{animation:fadeUp .7s ease both;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
        .pulse{animation:pulse 2s infinite;}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.3)}}
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,background:'rgba(255,255,255,.97)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(74,144,196,.12)',padding:'14px 48px',display:'flex',alignItems:'center',justifyContent:'space-between',boxShadow:'0 2px 20px rgba(26,58,92,.07)'}}>
        <a href="/" style={{display:'flex',alignItems:'center',gap:12,textDecoration:'none'}}>
          <svg width="40" height="40" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="38" fill="#eef4fa"/>
            <clipPath id="lc"><circle cx="40" cy="40" r="35"/></clipPath>
            <path d="M40 8 L40 26 Q35 26 33 30 Q31 35 36 37 Q41 39 40 40 L18 40 L18 22 Q23 22 25 18 Q27 13 22 11 Q17 9 18 8Z" fill="#2a6090" clipPath="url(#lc)"/>
            <path d="M40 8 L62 8 Q61 9 56 11 Q51 13 53 18 Q55 22 60 22 L62 40 L40 40 Q39 39 44 37 Q49 35 47 30 Q45 26 40 26Z" fill="#4a90c4" clipPath="url(#lc)"/>
            <path d="M18 40 L40 40 Q40 41 36 43 Q31 45 33 50 Q35 54 40 54 L40 72 L18 72 Q18 62 23 60 Q28 58 26 53 Q24 48 18 50Z" fill="#7ab5d8" clipPath="url(#lc)"/>
            <path d="M40 40 L62 40 Q56 38 54 43 Q52 48 57 53 Q62 58 62 72 L40 72 L40 54 Q45 54 47 50 Q49 45 44 43 Q39 41 40 40Z" fill="#b8d8ec" clipPath="url(#lc)"/>
          </svg>
          <div>
            <div style={{fontWeight:800,fontSize:14,color:'var(--blue-dark)',letterSpacing:'1.5px'}}>WESAL</div>
            <div style={{fontSize:8,fontWeight:500,color:'var(--blue-light)',letterSpacing:'2px',textTransform:'uppercase'}}>International</div>
          </div>
        </a>

        <div style={{display:'flex',gap:32,listStyle:'none'}}>
          {[['#services',t.nav_services],['#how',t.nav_how],['#specialist',t.nav_specialist],['#contact',t.nav_contact]].map(([href,label])=>(
            <a key={href} href={href} style={{textDecoration:'none',fontSize:13,fontWeight:500,color:'var(--text-mid)'}}>{label}</a>
          ))}
        </div>

        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <button onClick={()=>setLang(isAr?'en':'ar')} style={{background:'var(--blue-bg)',border:'1px solid var(--blue-pale)',color:'var(--blue-mid)',fontSize:12,fontWeight:600,padding:'7px 16px',borderRadius:20,cursor:'pointer',fontFamily:'inherit'}}>
            {isAr ? 'English' : 'العربية'}
          </button>
          <a href="/book" style={{background:'var(--blue-mid)',color:'white',padding:'10px 24px',borderRadius:25,fontSize:13,fontWeight:600,textDecoration:'none',boxShadow:'0 4px 15px rgba(42,96,144,.3)'}}>
            {t.nav_book}
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{minHeight:'100vh',background:'linear-gradient(145deg,#eef4fa 0%,#dceef8 40%,#f0f7ff 100%)',display:'flex',alignItems:'center',padding:'120px 48px 80px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,pointerEvents:'none'}}>
          <div style={{position:'absolute',width:600,height:600,top:-100,right:-100,borderRadius:'50%',background:'radial-gradient(circle,rgba(74,144,196,.08) 0%,transparent 70%)'}}/>
          <div style={{position:'absolute',width:400,height:400,bottom:-50,left:-50,borderRadius:'50%',background:'radial-gradient(circle,rgba(74,144,196,.06) 0%,transparent 70%)'}}/>
        </div>

        <div style={{maxWidth:1200,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:80,alignItems:'center',width:'100%'}}>
          <div className="fade-up">
            <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'rgba(74,144,196,.1)',border:'1px solid rgba(74,144,196,.25)',color:'var(--blue-mid)',fontSize:11,fontWeight:600,padding:'6px 16px',borderRadius:20,letterSpacing:'2px',textTransform:'uppercase',marginBottom:28}}>
              <span className="pulse" style={{width:6,height:6,borderRadius:'50%',background:'#2a9a6a',display:'inline-block'}}/>
              {t.badge}
            </div>

            <h1 style={{fontFamily:isAr?'Tajawal,sans-serif':'Playfair Display,serif',fontSize:'clamp(36px,4vw,56px)',fontWeight:isAr?800:600,lineHeight:1.2,color:'var(--blue-dark)',marginBottom:24}}>
              {t.hero_h1a} <em style={{fontStyle:'italic',color:'var(--blue-light)'}}>{t.hero_h1b}</em> {t.hero_h1c}
            </h1>

            <p style={{fontSize:16,lineHeight:1.8,color:'var(--text-mid)',maxWidth:480,marginBottom:40}}>{t.hero_p}</p>

            <div style={{display:'flex',gap:16,flexWrap:'wrap',marginBottom:32}}>
              <a href="/book" style={{display:'inline-flex',alignItems:'center',gap:10,background:'var(--blue-mid)',color:'white',padding:'15px 32px',borderRadius:30,fontSize:14,fontWeight:600,textDecoration:'none',boxShadow:'0 6px 25px rgba(42,96,144,.35)'}}>
                {t.book_btn}
              </a>
              <a href="#services" style={{display:'inline-flex',alignItems:'center',gap:10,background:'white',color:'var(--blue-mid)',padding:'15px 32px',borderRadius:30,fontSize:14,fontWeight:600,textDecoration:'none',border:'2px solid var(--blue-pale)'}}>
                {t.learn_btn}
              </a>
            </div>

            <div style={{display:'flex',alignItems:'center',gap:20,paddingTop:24,borderTop:'1px solid rgba(74,144,196,.15)'}}>
              {[['🔒',t.trust1],['🏅',t.trust2],['🌐',t.trust3]].map(([icon,label])=>(
                <div key={label as string} style={{display:'flex',alignItems:'center',gap:8,fontSize:12,color:'var(--text-light)',fontWeight:500}}>
                  <span style={{fontSize:16}}>{icon}</span>{label}
                </div>
              ))}
            </div>
          </div>

          {/* Cards */}
          <div style={{position:'relative',width:360,height:440}}>
            {[
              {top:0,left:0,rotate:'-3deg',icon:'🧠',en:'Social Counseling',ar:'الإرشاد الاجتماعي',tag:'VIDEO CALL'},
              {top:80,right:0,rotate:'2deg',icon:'🌱',en:'Addiction Rehab',ar:'علاج الإدمان',tag:'WHATSAPP'},
              {bottom:0,left:30,rotate:'-1deg',icon:'✅',en:'Progress Tracking',ar:'متابعة التقدم',tag:'PRIVATE'},
            ].map((card,i)=>(
              <div key={i} style={{position:'absolute',background:'white',borderRadius:20,padding:28,boxShadow:'0 20px 60px rgba(26,58,92,.15)',transition:'transform .3s',top:card.top,left:card.left,right:card.right,bottom:card.bottom,width:290,transform:`rotate(${card.rotate})`}}>
                <div style={{fontSize:32,marginBottom:12}}>{card.icon}</div>
                <div style={{fontSize:15,fontWeight:700,color:'var(--blue-dark)',marginBottom:4}}>{isAr ? card.ar : card.en}</div>
                <div style={{display:'inline-block',background:'var(--blue-bg)',color:'var(--blue-mid)',fontSize:10,fontWeight:600,padding:'4px 10px',borderRadius:10,marginTop:8,letterSpacing:1}}>{card.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{padding:'100px 48px',background:'white'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <p style={{fontSize:11,fontWeight:600,letterSpacing:4,textTransform:'uppercase',color:'var(--blue-light)',marginBottom:12}}>{t.how_label}</p>
          <h2 style={{fontFamily:isAr?'Tajawal,sans-serif':'Playfair Display,serif',fontSize:'clamp(28px,3vw,42px)',fontWeight:isAr?800:600,color:'var(--blue-dark)',marginBottom:16}}>{t.how_title}</h2>
          <p style={{fontSize:15,color:'var(--text-mid)',lineHeight:1.7,maxWidth:560,marginBottom:60}}>{t.how_sub}</p>

          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:40,position:'relative'}}>
            <div style={{position:'absolute',top:36,left:'10%',right:'10%',height:2,background:'linear-gradient(to right,var(--blue-pale),var(--blue-light),var(--blue-pale))'}}/>
            {[[1,t.step1_t,t.step1_p],[2,t.step2_t,t.step2_p],[3,t.step3_t,t.step3_p]].map(([num,title,desc])=>(
              <div key={num as number} style={{display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',position:'relative',zIndex:1,padding:'0 20px'}}>
                <div style={{width:72,height:72,borderRadius:'50%',background:'white',border:'3px solid var(--blue-pale)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Playfair Display,serif',fontSize:24,fontWeight:600,color:'var(--blue-mid)',marginBottom:24,boxShadow:'0 4px 20px rgba(74,144,196,.15)'}}>{num}</div>
                <h3 style={{fontSize:16,fontWeight:700,color:'var(--blue-dark)',marginBottom:10}}>{title}</h3>
                <p style={{fontSize:13,color:'var(--text-mid)',lineHeight:1.7}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" style={{padding:'100px 48px',background:'#f7fafd'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <p style={{fontSize:11,fontWeight:600,letterSpacing:4,textTransform:'uppercase',color:'var(--blue-light)',marginBottom:12}}>{t.svc_label}</p>
          <h2 style={{fontFamily:isAr?'Tajawal,sans-serif':'Playfair Display,serif',fontSize:'clamp(28px,3vw,42px)',fontWeight:isAr?800:600,color:'var(--blue-dark)',marginBottom:60}}>{t.svc_title}</h2>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:32,marginBottom:32}}>
            {[
              {gradient:'linear-gradient(135deg,#1a3a5c,#2a6090)',icon:'🧠',title:t.svc1_t,desc:t.svc1_p,features:[t.svc1_f1,t.svc1_f2,t.svc1_f3,t.svc1_f4],btnColor:'var(--blue-mid)'},
              {gradient:'linear-gradient(135deg,#1a4a3a,#2a8060)',icon:'🌱',title:t.svc2_t,desc:t.svc2_p,features:[t.svc2_f1,t.svc2_f2,t.svc2_f3,t.svc2_f4],btnColor:'#2a8060'},
            ].map((svc,i)=>(
              <div key={i} style={{background:'white',borderRadius:24,overflow:'hidden',boxShadow:'var(--shadow)',border:'1px solid rgba(74,144,196,.08)'}}>
                <div style={{padding:40,background:svc.gradient,position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',bottom:-30,right:-30,width:120,height:120,borderRadius:'50%',background:'rgba(255,255,255,.06)'}}/>
                  <span style={{fontSize:42,display:'block',marginBottom:16}}>{svc.icon}</span>
                  <h3 style={{fontSize:22,fontWeight:700,color:'white',marginBottom:12}}>{svc.title}</h3>
                  <p style={{fontSize:13,color:'rgba(255,255,255,.75)',lineHeight:1.6}}>{svc.desc}</p>
                </div>
                <div style={{padding:32}}>
                  <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:12,marginBottom:24}}>
                    {svc.features.map((f,j)=>(
                      <li key={j} style={{display:'flex',alignItems:'center',gap:12,fontSize:13,color:'var(--text-mid)',fontWeight:500}}>
                        <span style={{width:22,height:22,borderRadius:'50%',background:'var(--blue-bg)',color:'var(--blue-mid)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,flexShrink:0}}>✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a href="/book" style={{display:'block',background:svc.btnColor,color:'white',border:'none',borderRadius:12,padding:14,fontSize:13,fontWeight:600,cursor:'pointer',textAlign:'center',textDecoration:'none'}}>
                    {t.book_svc}
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Privacy banner */}
          <div style={{background:'#f0f7ff',border:'1px solid rgba(74,144,196,.2)',borderRadius:20,padding:'32px 40px',display:'flex',alignItems:'center',gap:24}}>
            <span style={{fontSize:48,flexShrink:0}}>🔒</span>
            <div>
              <h3 style={{fontSize:18,fontWeight:700,color:'var(--blue-dark)',marginBottom:8}}>{t.privacy_t}</h3>
              <p style={{fontSize:14,color:'var(--text-mid)',lineHeight:1.7}}>{t.privacy_p}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SESSION METHODS ── */}
      <section style={{padding:'100px 48px',background:'linear-gradient(135deg,#1a3a5c 0%,#1a4a6a 100%)'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <p style={{fontSize:11,fontWeight:600,letterSpacing:4,textTransform:'uppercase',color:'rgba(255,255,255,.5)',marginBottom:12}}>{t.method_label}</p>
          <h2 style={{fontFamily:isAr?'Tajawal,sans-serif':'Playfair Display,serif',fontSize:'clamp(28px,3vw,42px)',fontWeight:isAr?800:600,color:'white',marginBottom:60}}>{t.method_title}</h2>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
            {[{icon:'🎥',title:t.m1_t,desc:t.m1_p,badge:'SECURE · ENCRYPTED'},{icon:'💬',title:t.m2_t,desc:t.m2_p,badge:'EASY · FAMILIAR'}].map((m,i)=>(
              <div key={i} style={{background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.12)',borderRadius:20,padding:40,textAlign:'center',cursor:'pointer'}}>
                <span style={{fontSize:48,display:'block',marginBottom:20}}>{m.icon}</span>
                <h3 style={{fontSize:20,fontWeight:700,color:'white',marginBottom:12}}>{m.title}</h3>
                <p style={{fontSize:13,color:'rgba(255,255,255,.6)',lineHeight:1.6,marginBottom:16}}>{m.desc}</p>
                <span style={{display:'inline-block',background:'rgba(74,144,196,.3)',color:'var(--blue-pale)',fontSize:10,fontWeight:600,padding:'4px 12px',borderRadius:10,letterSpacing:'1.5px'}}>{m.badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECIALIST ── */}
      <section id="specialist" style={{padding:'100px 48px',background:'white'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <p style={{fontSize:11,fontWeight:600,letterSpacing:4,textTransform:'uppercase',color:'var(--blue-light)',marginBottom:12}}>{t.spec_label}</p>
          <h2 style={{fontFamily:isAr?'Tajawal,sans-serif':'Playfair Display,serif',fontSize:'clamp(28px,3vw,42px)',fontWeight:isAr?800:600,color:'var(--blue-dark)',marginBottom:40}}>{t.spec_title}</h2>

          <div style={{display:'grid',gridTemplateColumns:'auto 1fr',gap:48,alignItems:'center',background:'white',borderRadius:24,padding:48,boxShadow:'var(--shadow)',border:'1px solid rgba(74,144,196,.08)'}}>
            <div style={{width:160,height:160,borderRadius:'50%',background:'linear-gradient(135deg,#4a90c4,#1a3a5c)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:56,boxShadow:'0 8px 30px rgba(42,96,144,.3)',flexShrink:0}}>👨‍⚕️</div>
            <div>
              <h3 style={{fontSize:26,fontWeight:700,color:'var(--blue-dark)',marginBottom:4}}>{t.spec_name}</h3>
              <p style={{fontSize:14,color:'var(--blue-light)',fontWeight:500,marginBottom:20,letterSpacing:'.5px'}}>{t.spec_role}</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:10,marginBottom:20}}>
                {[['🍁','Canadian Board Certified'],['📋','License: K000746J/AT'],['⭐','Grade: Excellent — 93%'],['📅','Certified: March 2024']].map(([icon,label])=>(
                  <span key={label as string} style={{display:'inline-flex',alignItems:'center',gap:6,background:'var(--blue-bg)',border:'1px solid var(--blue-pale)',color:'var(--blue-mid)',fontSize:11,fontWeight:600,padding:'6px 14px',borderRadius:20}}>
                    {icon} {label}
                  </span>
                ))}
              </div>
              <p style={{fontSize:14,color:'var(--text-mid)',lineHeight:1.8}}>{t.spec_p}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="contact" style={{background:'var(--blue-dark)',color:'rgba(255,255,255,.7)',padding:'60px 48px 32px'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:48,marginBottom:48}}>
            <div>
              <div style={{fontSize:18,fontWeight:800,color:'white',letterSpacing:1,marginBottom:4}}>WESAL INTERNATIONAL</div>
              <div style={{fontSize:10,letterSpacing:3,color:'var(--blue-pale)',textTransform:'uppercase',marginBottom:16}}>Social Consultations</div>
              <p style={{fontSize:13,lineHeight:1.8,maxWidth:260,marginBottom:16}}>{t.footer_desc}</p>
              <p style={{fontSize:13}}>📞 +965 9333 1533</p>
              <p style={{fontSize:13}}>✉️ khalaf-j@hotmail.com</p>
            </div>
            <div>
              <h4 style={{fontSize:12,fontWeight:600,letterSpacing:2,textTransform:'uppercase',color:'white',marginBottom:20}}>{t.nav_services}</h4>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {[t.svc1_t,t.svc2_t,t.nav_book].map(s=>(
                  <a key={s as string} href="/book" style={{color:'rgba(255,255,255,.6)',textDecoration:'none',fontSize:13}}>{s}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{fontSize:12,fontWeight:600,letterSpacing:2,textTransform:'uppercase',color:'white',marginBottom:20}}>{t.nav_contact}</h4>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {[t.privacy_t,'FAQ','WhatsApp'].map(s=>(
                  <a key={s as string} href="#" style={{color:'rgba(255,255,255,.6)',textDecoration:'none',fontSize:13}}>{s}</a>
                ))}
              </div>
            </div>
          </div>
          <div style={{borderTop:'1px solid rgba(255,255,255,.1)',paddingTop:24,display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:12,color:'rgba(255,255,255,.4)',flexWrap:'wrap',gap:12}}>
            <span>{t.rights}</span>
            <span>{t.footer_lic}</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
