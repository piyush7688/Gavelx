import { useState } from 'react'
import API from '../api'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = new URLSearchParams()
      data.append('username', form.username)
      data.append('password', form.password)
      const res = await API.post('/auth/login', data)
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('username', res.data.username)
      localStorage.setItem('is_admin', res.data.is_admin)
      localStorage.setItem('user_id', res.data.user_id)
      if (res.data.is_admin) {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError('Invalid username or password')
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      {/* Left side */}
      <div style={styles.left}>
        <div style={styles.leftContent}>
          <h1 style={styles.brand}>GavelX</h1>
          <h2 style={styles.leftTitle}>Welcome back to the auction arena</h2>
          <p style={styles.leftSubtitle}>
            Sign in to access live auctions, place bids and track your winnings.
          </p>
          <div style={styles.featureList}>
            {[
              'Real-time live auctions',
              'AI-powered assistant',
              'Live chat support',
              'Bid Shield protection'
            ].map((f, i) => (
              <div key={i} style={styles.featureItem}>
                <span style={styles.featureCheck}>✓</span>
                <span style={styles.featureText}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side */}
      <div style={styles.right}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Sign in</h2>
            <p style={styles.cardSubtitle}>Enter your credentials to continue</p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Username</label>
              <input
                style={styles.input}
                placeholder="Enter your username"
                value={form.username}
                onChange={e => setForm({...form, username: e.target.value})}
                required
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                required
              />
            </div>
            <button
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1
              }}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>or</span>
            <div style={styles.dividerLine} />
          </div>

          <p style={styles.registerLink}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.link}>Create one free</Link>
          </p>

          <p style={styles.backLink}>
            <Link to="/" style={styles.linkMuted}>← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', background: '#0a0a0a' },
  left: { flex: 1, background: '#0f0f00', borderRight: '1px solid #1a1a00', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' },
  leftContent: { maxWidth: '400px' },
  brand: { fontSize: '32px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '32px', letterSpacing: '1px' },
  leftTitle: { fontSize: '28px', fontWeight: 'bold', color: '#fff', marginBottom: '16px', lineHeight: '1.3' },
  leftSubtitle: { color: '#666', fontSize: '15px', lineHeight: '1.7', marginBottom: '32px' },
  featureList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  featureItem: { display: 'flex', alignItems: 'center', gap: '12px' },
  featureCheck: { color: '#f59e0b', fontWeight: 'bold', fontSize: '16px' },
  featureText: { color: '#888', fontSize: '14px' },
  right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' },
  card: { width: '100%', maxWidth: '420px' },
  cardHeader: { marginBottom: '32px' },
  cardTitle: { fontSize: '28px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' },
  cardSubtitle: { color: '#555', fontSize: '14px' },
  errorBox: { background: '#1a0a0a', border: '1px solid #ef4444', color: '#ef4444', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' },
  fieldGroup: { marginBottom: '20px' },
  label: { display: 'block', color: '#666', fontSize: '13px', marginBottom: '8px', fontWeight: '500' },
  input: { width: '100%', padding: '12px 16px', background: '#111', border: '1px solid #1a1a1a', borderRadius: '10px', color: '#fff', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' },
  button: { width: '100%', padding: '14px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' },
  divider: { display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' },
  dividerLine: { flex: 1, height: '1px', background: '#1a1a1a' },
  dividerText: { color: '#333', fontSize: '13px' },
  registerLink: { color: '#555', fontSize: '14px', textAlign: 'center' },
  link: { color: '#f59e0b', textDecoration: 'none', fontWeight: 'bold' },
  backLink: { textAlign: 'center', marginTop: '16px' },
  linkMuted: { color: '#333', fontSize: '13px', textDecoration: 'none' }
}