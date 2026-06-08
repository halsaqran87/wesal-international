export default function RootPage() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#eef4fa',
      fontFamily: 'Montserrat, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#1a3a5c', fontSize: '32px', fontWeight: 800 }}>
          WESAL INTERNATIONAL
        </h1>
        <p style={{ color: '#4a90c4', marginTop: '8px', letterSpacing: '3px' }}>
          SOCIAL CONSULTATIONS
        </p>
        <p style={{ color: '#7a9ab8', marginTop: '24px', fontSize: '14px' }}>
          🚀 Website launching soon
        </p>
      </div>
    </main>
  )
}