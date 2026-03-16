import { useState } from 'react'
import API from '../api'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    admin_code: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await API.post('/auth/register', form)
      setSuccess('Account created! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      {/* Left side */}
      <div style={styles.left}>
        <div style={styles.leftContent}>
          <h1 style={styles.brand}>GavelX</h1>
          <h2 style={styles.leftTitle}>Join the auction revolution</h2>
          <p style={styles.leftSubtitle}>
            Create your free account and start bidding on exclusive items
            with our credit-based fair auction system.
          </p>
          <div style={styles.steps}>
            {[
              { num: '01', text: 'Create your account' },
              { num: '02', text: 'Receive bidding credits from admin' },
              { num: '03', text: 'Browse and bid on live auctions' },
              { num: '04', text: 'Win items and track your history' }
            ].map((s, i) => (
              <div key={i} style={styles.stepItem}>
                <div style={styles.stepNum}>{s.num}</div>
                <span style={styles.stepText}>{s.text}</span>
              </div>
            ))}
          </div>

          {/* Admin code hint */}
          <div style={styles.adminHint}>
            <span style={styles.adminHintIcon}>🔐</span>
            <span style={styles.adminHintText}>
              Have an admin code? Enter it during registration to get admin access.
            </span>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div style={styles.right}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>Create account</h2>
            <p style={styles.cardSubtitle}>Join GavelX for free today</p>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span>⚠</span> {error}
            </div>
          )}
          {success && (
            <div style={styles.successBox}>
              <span>✓</span> {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Username</label>
              <input
                style={styles.input}
                placeholder="Choose a username"
                value={form.username}
                onChange={e => setForm({...form, username: e.target.value})}
                required
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email address</label>
              <input
                style={styles.input}
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                required
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder="Create a password"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                required
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Admin code
                <span style={styles.optionalLabel}> — optional, leave blank for bidder account</span>
              </label>
              <input
                style={{
                  ...styles.input,
                  borderColor: form.admin_code ? '#f59e0b' : '#1a1a1a'
                }}
                placeholder="Enter admin code if you have one"
                value={form.admin_code}
                onChange={e => setForm({...form, admin_code: e.target.value})}
              />
              {form.admin_code && (
                <div style={styles.codeHint}>
                  {form.admin_code === 'GAVELX_ADMIN_2024'
                    ? '✓ Valid admin code — you will get admin access'
                    : '✗ Invalid code — you will be registered as a bidder'}
                </div>
              )}
            </div>

            <button
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1,
                background: form.admin_code === 'GAVELX_ADMIN_2024'
                  ? '#7c3aed' : '#f59e0b',
                color: '#000'
              }}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating account...' :
               form.admin_code === 'GAVELX_ADMIN_2024'
                 ? 'Create Admin Account →'
                 : 'Create Bidder Account →'}
            </button>
          </form>

          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>or</span>
            <div style={styles.dividerLine} />
          </div>

          <p style={styles.loginLink}>
            Already have an account?{' '}
            <Link to="/login" style={styles.link}>Sign in</Link>
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
  steps: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' },
  stepItem: { display: 'flex', alignItems: 'center', gap: '16px' },
  stepNum: { width: '32px', height: '32px', borderRadius: '50%', background: '#1a1500', border: '1px solid #f59e0b', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 },
  stepText: { color: '#888', fontSize: '14px' },
  adminHint: { display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#0d0a1a', border: '1px solid #1a1035', borderRadius: '10px', padding: '14px' },
  adminHintIcon: { fontSize: '16px', flexShrink: 0 },
  adminHintText: { color: '#666', fontSize: '13px', lineHeight: '1.5' },
  right: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' },
  card: { width: '100%', maxWidth: '420px' },
  cardHeader: { marginBottom: '32px' },
  cardTitle: { fontSize: '28px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' },
  cardSubtitle: { color: '#555', fontSize: '14px' },
  errorBox: { background: '#1a0a0a', border: '1px solid #ef4444', color: '#ef4444', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' },
  successBox: { background: '#0a1a0a', border: '1px solid #22c55e', color: '#22c55e', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' },
  fieldGroup: { marginBottom: '20px' },
  label: { display: 'block', color: '#666', fontSize: '13px', marginBottom: '8px', fontWeight: '500' },
  optionalLabel: { color: '#333', fontWeight: 'normal', fontSize: '12px' },
  input: { width: '100%', padding: '12px 16px', background: '#111', border: '1px solid #1a1a1a', borderRadius: '10px', color: '#fff', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' },
  codeHint: { marginTop: '6px', fontSize: '12px', color: '#888' },
  button: { width: '100%', padding: '14px', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px', transition: 'all 0.2s' },
  divider: { display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' },
  dividerLine: { flex: 1, height: '1px', background: '#1a1a1a' },
  dividerText: { color: '#333', fontSize: '13px' },
  loginLink: { color: '#555', fontSize: '14px', textAlign: 'center' },
  link: { color: '#f59e0b', textDecoration: 'none', fontWeight: 'bold' },
  backLink: { textAlign: 'center', marginTop: '16px' },
  linkMuted: { color: '#333', fontSize: '13px', textDecoration: 'none' }
}