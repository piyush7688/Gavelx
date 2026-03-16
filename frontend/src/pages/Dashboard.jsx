import { useEffect, useState } from 'react'
import API from '../api'
import { useNavigate, Link } from 'react-router-dom'
import ExportPDF from '../components/ExportPDF'
import WinnerPopup from '../components/WinnerPopup'

export default function Dashboard() {
  const [auctions, setAuctions] = useState([])
  const [credits, setCredits] = useState(0)
  const [history, setHistory] = useState([])
  const [activeTab, setActiveTab] = useState('auctions')
  const [tick, setTick] = useState(0)
  const [search, setSearch] = useState('')
  const [hoveredCard, setHoveredCard] = useState(null)
  const username = localStorage.getItem('username')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    fetchAuctions()
    fetchCredits()
    fetchHistory()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchAuctions = async () => {
    try {
      const res = await API.get('/auctions/all')
      setAuctions(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchCredits = async () => {
    try {
      const res = await API.get('/credits/balance')
      setCredits(res.data.credits)
    } catch (err) { console.error(err) }
  }

  const fetchHistory = async () => {
    try {
      const res = await API.get('/bids/my/history')
      setHistory(res.data)
    } catch (err) { console.error(err) }
  }

  const logout = () => {
    localStorage.clear()
    navigate('/')
  }

  const getTimeLeft = (startTime, endTime) => {
    const now = new Date()
    const start = new Date(startTime + 'Z')
    const end = new Date(endTime + 'Z')
    if (now < start) {
      const diff = start - now
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      return { label: `Starts in ${h}h ${m}m ${s}s`, type: 'upcoming' }
    }
    if (now >= start && now < end) {
      const diff = end - now
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      return { label: `${h}h ${m}m ${s}s left`, type: 'live' }
    }
    return { label: 'Ended', type: 'ended' }
  }

  const filteredAuctions = auctions.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={styles.container}>

      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <h1 style={styles.logo} onClick={() => navigate('/')}>GavelX</h1>
          <div style={styles.navDivider} />
          <span style={styles.navTagline}>Live Auctions</span>
        </div>
        <div style={styles.navCenter}>
          <input
            style={styles.searchInput}
            placeholder="Search auctions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={styles.navRight}>
          <div style={styles.creditsBadge}>
            <span style={styles.creditsIcon}>💰</span>
            <span style={styles.creditsAmount}>{credits}</span>
            <span style={styles.creditsLabel}>credits</span>
          </div>
          <div
            style={{...styles.userBadge, cursor: 'pointer'}}
            onClick={() => navigate('/profile')}
          > 
            <div style={styles.userAvatar}>{username?.[0]?.toUpperCase()}</div>
            <span style={styles.username}>{username}</span>
          </div>
          <button style={styles.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'auctions' ? styles.activeTab : {}) }}
          onClick={() => setActiveTab('auctions')}
        >
          Live Auctions
          {auctions.filter(a => getTimeLeft(a.start_time, a.end_time).type === 'live').length > 0 && (
            <span style={styles.liveDot} />
          )}
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'history' ? styles.activeTab : {}) }}
          onClick={() => setActiveTab('history')}
        >
          My Bid History
        </button>
      </div>

      <div style={styles.main}>

        {activeTab === 'auctions' && (
          <div>
            <div style={styles.auctionsHeader}>
              <h2 style={styles.heading}>
                {search ? `Results for "${search}"` : 'Live Auctions'}
              </h2>
              <span style={styles.auctionCount}>
                {filteredAuctions.length} auction{filteredAuctions.length !== 1 ? 's' : ''}
              </span>
            </div>
            {filteredAuctions.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🔍</div>
                <p style={styles.emptyText}>
                  {search ? 'No auctions match your search' : 'No active auctions at the moment'}
                </p>
              </div>
            ) : (
              <div style={styles.grid}>
                {filteredAuctions.map(auction => {
                  const t = getTimeLeft(auction.start_time, auction.end_time)
                  const isHovered = hoveredCard === auction.id
                  return (
                    <div
                      key={auction.id}
                      style={{
                        ...styles.card,
                        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                        boxShadow: isHovered ? '0 8px 32px rgba(245,158,11,0.15)' : 'none',
                        transition: 'all 0.2s ease',
                        borderColor: t.type === 'live' ? '#2a2010' : '#1a1a1a'
                      }}
                      onMouseEnter={() => setHoveredCard(auction.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      {/* Status bar */}
                      <div style={{
                        ...styles.statusBar,
                        background: t.type === 'live' ? '#f59e0b' :
                                     t.type === 'upcoming' ? '#7c3aed' : '#333'
                      }}>
                        <span style={styles.statusText}>
                          {t.type === 'live' ? 'Live Now' :
                           t.type === 'upcoming' ? 'Upcoming' : 'Ended'}
                        </span>
                        {t.type === 'live' && <span style={styles.pulseDot} />}
                      </div>

                      {auction.image_url && (
                        <div style={styles.imageWrapper}>
                          <img
                            src={auction.image_url}
                            alt={auction.title}
                            style={styles.image}
                          />
                        </div>
                      )}

                      <div style={styles.cardBody}>
                        <h3 style={styles.cardTitle}>{auction.title}</h3>
                        <p style={styles.cardDesc}>{auction.description}</p>

                        <div style={styles.cardStats}>
                          <div style={styles.cardStat}>
                            <span style={styles.cardStatLabel}>Min bid</span>
                            <span style={styles.cardStatValue}>{auction.minimum_bid}</span>
                          </div>
                          <div style={styles.cardStatDivider} />
                          <div style={styles.cardStat}>
                            <span style={styles.cardStatLabel}>Current</span>
                            <span style={{...styles.cardStatValue, color: '#22c55e'}}>
                              {auction.current_bid}
                            </span>
                          </div>
                        </div>

                        <div style={{
                          ...styles.timerRow,
                          color: t.type === 'upcoming' ? '#7c3aed' :
                                 t.type === 'live' ? '#f59e0b' : '#ef4444'
                        }}>
                          <span style={styles.timerIcon}>
                            {t.type === 'live' ? '⏱' :
                             t.type === 'upcoming' ? '🕐' : '🔴'}
                          </span>
                          {t.label}
                        </div>

                        <Link to={`/auction/${auction.id}`}>
                          <button style={{
                            ...styles.bidBtn,
                            background: t.type === 'upcoming' ? '#7c3aed' :
                                         t.type === 'ended' ? '#1a1a1a' : '#f59e0b',
                            color: t.type === 'ended' ? '#444' : '#000',
                            cursor: t.type === 'ended' ? 'default' : 'pointer'
                          }}>
                            {t.type === 'upcoming' ? 'View Details' :
                             t.type === 'ended' ? 'Auction Ended' : 'Place Bid →'}
                          </button>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={styles.heading}>My Bid History</h2>
              <ExportPDF />
            </div>
            {history.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📋</div>
                <p style={styles.emptyText}>You have not placed any bids yet</p>
              </div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['Bid ID', 'Auction', 'Amount', 'Time', 'Status'].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map(bid => (
                    <tr key={bid.id} style={styles.tr}>
                      <td style={styles.td}>#{bid.id}</td>
                      <td style={styles.td}>
                        <Link to={`/auction/${bid.auction_id}`} style={{color:'#f59e0b', textDecoration:'none'}}>
                          Auction #{bid.auction_id}
                        </Link>
                      </td>
                      <td style={styles.td}>
                        <span style={{color:'#f59e0b', fontWeight:'bold'}}>{bid.amount}</span> credits
                      </td>
                      <td style={styles.td}>{new Date(bid.timestamp + 'Z').toLocaleString()}</td>
                      <td style={styles.td}>
                        {bid.is_winning
                          ? <span style={styles.winBadge}>Winner</span>
                          : <span style={styles.activeBadge}>Active</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      <WinnerPopup />
      </div>    
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#0a0a0a' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 32px', height: '64px', background: '#111', borderBottom: '1px solid #1a1a1a', position: 'sticky', top: 0, zIndex: 100 },
  navLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  logo: { fontSize: '22px', fontWeight: 'bold', color: '#f59e0b', cursor: 'pointer', letterSpacing: '1px' },
  navDivider: { width: '1px', height: '20px', background: '#2a2a2a' },
  navTagline: { color: '#444', fontSize: '13px' },
  navCenter: { flex: 1, maxWidth: '400px', margin: '0 32px' },
  searchInput: { width: '100%', padding: '8px 16px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px', color: '#fff', fontSize: '14px', outline: 'none' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  creditsBadge: { display: 'flex', alignItems: 'center', gap: '6px', background: '#1a1500', border: '1px solid #2a2000', padding: '6px 14px', borderRadius: '20px' },
  creditsIcon: { fontSize: '14px' },
  creditsAmount: { color: '#f59e0b', fontWeight: 'bold', fontSize: '15px' },
  creditsLabel: { color: '#666', fontSize: '12px' },
  userBadge: { display: 'flex', alignItems: 'center', gap: '8px' },
  userAvatar: { width: '32px', height: '32px', borderRadius: '50%', background: '#f59e0b', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' },
  username: { color: '#888', fontSize: '14px' },
  logoutBtn: { background: 'transparent', color: '#888', border: '1px solid #2a2a2a', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' },
  tabs: { display: 'flex', gap: '4px', padding: '12px 32px', background: '#0d0d0d', borderBottom: '1px solid #1a1a1a' },
  tab: { padding: '8px 20px', background: 'transparent', color: '#666', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  activeTab: { background: '#1a1a1a', color: '#fff', fontWeight: 'bold' },
  liveDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' },
  main: { padding: '32px' },
  auctionsHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' },
  heading: { fontSize: '22px', fontWeight: 'bold', color: '#fff' },
  auctionCount: { color: '#444', fontSize: '14px' },
  emptyState: { textAlign: 'center', padding: '80px 20px' },
  emptyIcon: { fontSize: '48px', marginBottom: '16px' },
  emptyText: { color: '#444', fontSize: '16px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
  card: { background: '#111', borderRadius: '16px', border: '1px solid #1a1a1a', overflow: 'hidden' },
  statusBar: { padding: '6px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  statusText: { color: '#000', fontSize: '11px', fontWeight: 'bold' },
  pulseDot: { width: '6px', height: '6px', borderRadius: '50%', background: '#000', opacity: 0.5 },
  imageWrapper: { overflow: 'hidden', height: '180px' },
  image: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' },
  cardBody: { padding: '16px' },
  cardTitle: { fontSize: '17px', fontWeight: 'bold', color: '#fff', marginBottom: '6px' },
  cardDesc: { color: '#555', fontSize: '13px', marginBottom: '16px', lineHeight: '1.5' },
  cardStats: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', background: '#0a0a0a', padding: '10px 14px', borderRadius: '8px' },
  cardStat: { display: 'flex', flexDirection: 'column', gap: '2px' },
  cardStatLabel: { color: '#444', fontSize: '11px' },
  cardStatValue: { color: '#fff', fontWeight: 'bold', fontSize: '16px' },
  cardStatDivider: { width: '1px', height: '24px', background: '#1a1a1a', margin: '0 4px' },
  timerRow: { fontSize: '13px', fontWeight: 'bold', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' },
  timerIcon: { fontSize: '14px' },
  bidBtn: { width: '100%', padding: '12px', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px', transition: 'opacity 0.2s' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px 16px', background: '#111', color: '#444', borderBottom: '1px solid #1a1a1a', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tr: { borderBottom: '1px solid #111' },
  td: { padding: '14px 16px', color: '#888', fontSize: '14px' },
  winBadge: { background: '#1a1500', color: '#f59e0b', border: '1px solid #f59e0b', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  activeBadge: { background: '#0a1a0a', color: '#22c55e', border: '1px solid #22c55e', padding: '3px 10px', borderRadius: '12px', fontSize: '12px' }
}