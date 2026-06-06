import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Wesal International — Social Consultations',
  description: 'Online social counseling and behavioral rehabilitation services. Confidential, certified, bilingual (Arabic & English). Kuwait.',
  keywords: ['counseling', 'Kuwait', 'social consultations', 'addiction treatment', 'استشارات اجتماعية', 'علاج الإدمان'],
  openGraph: {
    title: 'Wesal International',
    description: 'Confidential online counseling — Arabic & English',
    url: 'https://wesal-international.com',
    siteName: 'Wesal International',
    locale: 'ar_KW',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className="font-arabic bg-off-white text-blue-dark antialiased">
        {children}
      </body>
    </html>
  )
}
