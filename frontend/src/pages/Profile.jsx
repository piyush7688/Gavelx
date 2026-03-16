import { useEffect, useState } from 'react'
import API from '../api'
import { useNavigate, Link } from 'react-router-dom'
import ExportPDF from '../components/ExportPDF'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const username = localStorage.getItem('username')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await API.get(`/auth/profile/${username}`)
      setProfile(res.data)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const logout = () => {
    localStorage.clear()
    navigate('/')
  }

  if (loading) return (
    <div style={styles.loadingScreen}>
      <div style={styles.loadingLogo}>GavelX</div>
      <div style={styles.loadingText}>Loading profile...</div>
    </div>
  )

  if (!profile) return (
    <div style={styles.loadingScreen}>
      <div style={styles.loadingText}>Profile not found</div>
    </div>
  )

  const winRate = profile.total_bids > 0
    ? Math.round((profile.wins / profile.total_bids) * 100)
    : 0

  return (
    <div style={styles.container}>

      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <h1 style={styles.logo} onClick={() => navigate('/dashboard')}>GavelX</h1>
          <div style={styles.navDivider} />
          <span style={styles.navPage}>My Profile</span>
        </div>
        <div style={styles.navRight}>
          <button style={styles.dashBtn} onClick={() => navigate('/dashboard')}>
            ← Dashboard
          </button>
          <button style={styles.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={styles.main}>

        {/* Profile Header */}
        <div style={styles.profileHeader}>
          <div style={styles.avatarLarge}>
            {profile.username[0].toUpperCase()}
          </div>
          <div style={styles.profileInfo}>
            <h1 style={styles.profileName}>{profile.username}</h1>
            <p style={styles.profileEmail}>{profile.email}</p>
            <div style={styles.profileBadges}>
              <span style={styles.memberBadge}>
                Member since {new Date(profile.created_at).toLocaleDateString()}
              </span>
              {profile.wins > 0 && (
                <span style={styles.winnerBadge}>
                  🏆 {profile.wins} time winner
                </span>
              )}
              {profile.total_bids >= 10 && (
                <span style={styles.activeBadge}>
                  ⚡ Active bidder
                </span>
              )}
            </div>
          </div>
          <div style={styles.exportBtn}>
            <ExportPDF />
          </div>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>💰</div>
            <div style={styles.statValue}>{profile.credits}</div>
            <div style={styles.statLabel}>Credits remaining</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🎯</div>
            <div style={{...styles.statValue, color: '#7c3aed'}}>
              {profile.total_bids}
            </div>
            <div style={styles.statLabel}>Total bids placed</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🏆</div>
            <div style={{...styles.statValue, color: '#22c55e'}}>
              {profile.wins}
            </div>
            <div style={styles.statLabel}>Auctions won</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📊</div>
            <div style={{...styles.statValue, color: '#3b82f6'}}>
              {winRate}%
            </div>
            <div style={styles.statLabel}>Win rate</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>💸</div>
            <div style={{...styles.statValue, color: '#ef4444'}}>
              {profile.total_spent}
            </div>
            <div style={styles.statLabel}>Credits spent on wins</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⭐</div>
            <div style={{...styles.statValue, color: '#f59e0b'}}>
              {profile.total_bids >= 20 ? 'Gold' :
               profile.total_bids >= 10 ? 'Silver' :
               profile.total_bids >= 5 ? 'Bronze' : 'New'}
            </div>
            <div style={styles.statLabel}>Bidder rank</div>
          </div>
        </div>

        {/* Win rate bar */}
        <div style={styles.winRateCard}>
          <div style={styles.winRateHeader}>
            <span style={styles.winRateTitle}>Win rate</span>
            <span style={styles.winRateValue}>{winRate}%</span>
          </div>
          <div style={styles.winRateBar}>
            <div style={{
              ...styles.winRateFill,
              width: `${winRate}%`
            }} />
          </div>
          <div style={styles.winRateStats}>
            <span style={styles.winRateStat}>
              {profile.wins} wins out of {profile.total_bids} bids
            </span>
          </div>
        </div>

        {/* Recent Bids */}
        <div style={styles.recentCard}>
          <div style={styles.recentHeader}>
            <h3 style={styles.recentTitle}>Recent bids</h3>
            <Link to="/dashboard" style={styles.viewAllLink}>
              View all →
            </Link>
          </div>
          {profile.recent_bids.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🎯</div>
              <p style={styles.emptyText}>No bids placed yet</p>
              <Link to="/dashboard">
                <button style={styles.startBidBtn}>
                  Browse Auctions
                </button>
              </Link>
            </div>
          ) : (
            <div style={styles.bidsList}>
              {profile.recent_bids.map((bid, i) => (
                <Link
                  key={i}
                  to={`/auction/${bid.auction_id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={styles.bidRow}>
                    <div style={styles.bidLeft}>
                      <div style={styles.bidAuction}>{bid.auction_title}</div>
                      <div style={styles.bidTime}>
                        {new Date(bid.timestamp + 'Z').toLocaleString()}
                      </div>
                    </div>
                    <div style={styles.bidRight}>
                      <div style={styles.bidAmount}>
                        {bid.amount} <span style={styles.creditsLabel}>credits</span>
                      </div>
                      {bid.is_winning ? (
                        <span style={styles.wonBadge}>Won</span>
                      ) : (
                        <span style={styles.activeBidBadge}>Active</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#0a0a0a' },
  loadingScreen: { minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' },
  loadingLogo: { fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' },
  loadingText: { color: '#444', fontSize: '14px' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 32px', height: '64px', background: '#111', borderBottom: '1px solid #1a1a1a', position: 'sticky', top: 0, zIndex: 100 },
  navLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  logo: { fontSize: '22px', fontWeight: 'bold', color: '#f59e0b', cursor: 'pointer', letterSpacing: '1px' },
  navDivider: { width: '1px', height: '20px', background: '#2a2a2a' },
  navPage: { color: '#666', fontSize: '13px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  dashBtn: { background: 'transparent', color: '#888', border: '1px solid #1a1a1a', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' },
  logoutBtn: { background: 'transparent', color: '#888', border: '1px solid #1a1a1a', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' },
  main: { padding: '32px', maxWidth: '900px', margin: '0 auto' },
  profileHeader: { display: 'flex', alignItems: 'center', gap: '24px', background: '#111', borderRadius: '20px', padding: '32px', border: '1px solid #1a1a1a', marginBottom: '24px' },
  avatarLarge: { width: '80px', height: '80px', borderRadius: '50%', background: '#f59e0b', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold', flexShrink: 0 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: '28px', fontWeight: 'bold', color: '#fff', marginBottom: '4px' },
  profileEmail: { color: '#555', fontSize: '14px', marginBottom: '12px' },
  profileBadges: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  memberBadge: { background: '#1a1a1a', color: '#666', padding: '4px 12px', borderRadius: '12px', fontSize: '12px' },
  winnerBadge: { background: '#1a1500', color: '#f59e0b', border: '1px solid #2a2000', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  activeBadge: { background: '#0a1a0a', color: '#22c55e', border: '1px solid #0a2a0a', padding: '4px 12px', borderRadius: '12px', fontSize: '12px' },
  exportBtn: { flexShrink: 0 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px', marginBottom: '24px' },
  statCard: { background: '#111', borderRadius: '14px', padding: '20px 12px', border: '1px solid #1a1a1a', textAlign: 'center' },
  statIcon: { fontSize: '22px', marginBottom: '8px' },
  statValue: { fontSize: '24px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '4px' },
  statLabel: { color: '#444', fontSize: '11px', lineHeight: '1.3' },
  winRateCard: { background: '#111', borderRadius: '16px', padding: '24px', border: '1px solid #1a1a1a', marginBottom: '24px' },
  winRateHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  winRateTitle: { color: '#fff', fontWeight: 'bold', fontSize: '15px' },
  winRateValue: { color: '#f59e0b', fontWeight: 'bold', fontSize: '20px' },
  winRateBar: { height: '8px', background: '#1a1a1a', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' },
  winRateFill: { height: '100%', background: '#f59e0b', borderRadius: '4px', transition: 'width 1s ease' },
  winRateStats: { display: 'flex', justifyContent: 'space-between' },
  winRateStat: { color: '#444', fontSize: '12px' },
  recentCard: { background: '#111', borderRadius: '16px', padding: '24px', border: '1px solid #1a1a1a' },
  recentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  recentTitle: { color: '#fff', fontWeight: 'bold', fontSize: '16px' },
  viewAllLink: { color: '#f59e0b', fontSize: '13px', textDecoration: 'none' },
  emptyState: { textAlign: 'center', padding: '40px' },
  emptyIcon: { fontSize: '40px', marginBottom: '12px' },
  emptyText: { color: '#444', fontSize: '14px', marginBottom: '16px' },
  startBidBtn: { padding: '10px 24px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  bidsList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  bidRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#0a0a0a', borderRadius: '10px', border: '1px solid #111', cursor: 'pointer' },
  bidLeft: {},
  bidAuction: { color: '#fff', fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' },
  bidTime: { color: '#444', fontSize: '12px' },
  bidRight: { textAlign: 'right' },
  bidAmount: { color: '#f59e0b', fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' },
  creditsLabel: { color: '#555', fontSize: '12px', fontWeight: 'normal' },
  wonBadge: { background: '#1a1500', color: '#f59e0b', border: '1px solid #2a2000', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' },
  activeBidBadge: { background: '#0a1a0a', color: '#22c55e', padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }
}