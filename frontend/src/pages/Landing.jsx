import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  const features = [
    { icon: '⚡', title: 'Live Auctions', desc: 'Real-time countdown timers on every auction' },
    { icon: '🛡', title: 'Bid Shield', desc: 'Last 30s bid extends clock by 60 seconds' },
    { icon: '💬', title: 'Live Support', desc: 'Chat directly with admin in real time' },
    { icon: '🤖', title: 'AI Assistant', desc: 'Smart bot answers all your questions' },
    { icon: '💰', title: 'Credits System', desc: 'Admin assigns credits — fair for everyone' },
    { icon: '📊', title: 'Live Reports', desc: 'Real-time bidding analytics and charts' },
  ]

  return (
    <div style={styles.container}>

      {/* Navbar */}
      <nav style={styles.nav}>
        <div style={styles.navLogo}>GavelX</div>
        <div style={styles.navLinks}>
          <button style={styles.loginBtn} onClick={() => navigate('/login')}>Login</button>
          <button style={styles.registerBtn} onClick={() => navigate('/register')}>Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{
        ...styles.hero,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.8s ease'
      }}>
        <div style={styles.heroBadge}>Live Auction Platform</div>
        <h1 style={styles.heroTitle}>
          Bid Smart.<br />
          <span style={styles.heroHighlight}>Win Big.</span>
        </h1>
        <p style={styles.heroSubtitle}>
          GavelX is a next-generation credit-based auction platform with
          real-time bidding, AI assistance, and live chat support.
        </p>
        <div style={styles.heroButtons}>
          <button
            style={styles.heroPrimaryBtn}
            onClick={() => navigate('/register')}
          >
            Start Bidding Free
          </button>
          <button
            style={styles.heroSecondaryBtn}
            onClick={() => navigate('/login')}
          >
            Sign In
          </button>
        </div>

        {/* Stats row */}
        <div style={styles.statsRow}>
          {[
            { value: '100%', label: 'Fair bidding' },
            { value: 'Live', label: 'Real-time updates' },
            { value: 'AI', label: 'Powered assistant' },
            { value: '24/7', label: 'Admin support' }
          ].map((stat, i) => (
            <div key={i} style={styles.statItem}>
              <div style={styles.statValue}>{stat.value}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div style={styles.featuresSection}>
        <h2 style={styles.sectionTitle}>Everything you need to win</h2>
        <p style={styles.sectionSubtitle}>
          GavelX comes packed with powerful features designed for fair and exciting auctions
        </p>
        <div style={styles.featuresGrid}>
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                ...styles.featureCard,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.6s ease ${i * 0.1}s`
              }}
            >
              <div style={styles.featureIcon}>{f.icon}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={styles.howSection}>
        <h2 style={styles.sectionTitle}>How it works</h2>
        <div style={styles.stepsRow}>
          {[
            { step: '01', title: 'Register', desc: 'Create your free account in seconds' },
            { step: '02', title: 'Get credits', desc: 'Admin assigns bidding credits to you' },
            { step: '03', title: 'Browse auctions', desc: 'Find live auctions with countdowns' },
            { step: '04', title: 'Place bids', desc: 'Use credits to bid and win items' }
          ].map((s, i) => (
            <div key={i} style={styles.stepCard}>
              <div style={styles.stepNumber}>{s.step}</div>
              <h3 style={styles.stepTitle}>{s.title}</h3>
              <p style={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to start bidding?</h2>
        <p style={styles.ctaSubtitle}>Join GavelX today and experience the future of auctions</p>
        <button
          style={styles.ctaBtn}
          onClick={() => navigate('/register')}
        >
          Create Free Account
        </button>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerLogo}>GavelX</div>
        <p style={styles.footerText}>Next-generation auction platform</p>
      </footer>

    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#0a0a0a', color: '#fff' },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 60px', borderBottom: '1px solid #1a1a1a', position: 'sticky', top: 0, background: 'rgba(10,10,10,0.95)', zIndex: 100 },
  navLogo: { fontSize: '24px', fontWeight: 'bold', color: '#f59e0b', letterSpacing: '1px' },
  navLinks: { display: 'flex', gap: '12px' },
  loginBtn: { padding: '10px 24px', background: 'transparent', color: '#fff', border: '1px solid #333', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' },
  registerBtn: { padding: '10px 24px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' },
  hero: { textAlign: 'center', padding: '100px 60px 60px' },
  heroBadge: { display: 'inline-block', background: '#1a1a00', color: '#f59e0b', border: '1px solid #f59e0b', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', marginBottom: '24px' },
  heroTitle: { fontSize: '64px', fontWeight: 'bold', lineHeight: '1.1', marginBottom: '24px', color: '#fff' },
  heroHighlight: { color: '#f59e0b' },
  heroSubtitle: { fontSize: '18px', color: '#888', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.7' },
  heroButtons: { display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '60px' },
  heroPrimaryBtn: { padding: '16px 40px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  heroSecondaryBtn: { padding: '16px 40px', background: 'transparent', color: '#fff', border: '1px solid #333', borderRadius: '10px', fontSize: '16px', cursor: 'pointer' },
  statsRow: { display: 'flex', justifyContent: 'center', gap: '60px', padding: '40px', background: '#111', borderRadius: '16px', maxWidth: '700px', margin: '0 auto', border: '1px solid #1a1a1a' },
  statItem: { textAlign: 'center' },
  statValue: { fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' },
  statLabel: { color: '#888', fontSize: '13px', marginTop: '4px' },
  featuresSection: { padding: '80px 60px', textAlign: 'center' },
  sectionTitle: { fontSize: '36px', fontWeight: 'bold', marginBottom: '16px', color: '#fff' },
  sectionSubtitle: { color: '#888', fontSize: '16px', marginBottom: '48px', maxWidth: '500px', margin: '0 auto 48px' },
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', maxWidth: '900px', margin: '0 auto' },
  featureCard: { background: '#111', border: '1px solid #1a1a1a', borderRadius: '16px', padding: '28px', textAlign: 'left' },
  featureIcon: { fontSize: '28px', marginBottom: '16px' },
  featureTitle: { fontSize: '16px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' },
  featureDesc: { color: '#888', fontSize: '14px', lineHeight: '1.6' },
  howSection: { padding: '80px 60px', background: '#080808', textAlign: 'center' },
  stepsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', maxWidth: '900px', margin: '48px auto 0' },
  stepCard: { background: '#111', borderRadius: '16px', padding: '28px', border: '1px solid #1a1a1a', textAlign: 'left' },
  stepNumber: { fontSize: '36px', fontWeight: 'bold', color: '#f59e0b', opacity: 0.5, marginBottom: '12px' },
  stepTitle: { fontSize: '16px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' },
  stepDesc: { color: '#888', fontSize: '14px', lineHeight: '1.6' },
  ctaSection: { padding: '80px 60px', textAlign: 'center', background: '#0f0f00', borderTop: '1px solid #1a1a00' },
  ctaTitle: { fontSize: '36px', fontWeight: 'bold', color: '#fff', marginBottom: '16px' },
  ctaSubtitle: { color: '#888', fontSize: '16px', marginBottom: '32px' },
  ctaBtn: { padding: '18px 48px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' },
  footer: { padding: '40px 60px', borderTop: '1px solid #1a1a1a', textAlign: 'center' },
  footerLogo: { fontSize: '20px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' },
  footerText: { color: '#444', fontSize: '13px' }
}