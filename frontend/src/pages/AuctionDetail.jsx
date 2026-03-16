import { useEffect, useState } from 'react'
import API from '../api'
import { useParams, useNavigate } from 'react-router-dom'

export default function AuctionDetail() {
  const { id } = useParams()
  const [auction, setAuction] = useState(null)
  const [bids, setBids] = useState([])
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [timeLeft, setTimeLeft] = useState('')
  const [credits, setCredits] = useState(0)
  const [extended, setExtended] = useState(false)
  const [extensionCount, setExtensionCount] = useState(0)
  const [isLastMinute, setIsLastMinute] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const username = localStorage.getItem('username')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    fetchAuction()
    fetchBids()
    fetchCredits()
    const interval = setInterval(() => {
      fetchBids()
      fetchCredits()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!auction) return
    const timer = setInterval(() => {
      const now = new Date()
      const startTime = new Date(auction.start_time + 'Z')
      const endTime = new Date(auction.end_time + 'Z')
      if (now < startTime) {
        const diff = startTime - now
        const h = Math.floor(diff / 3600000)
        const m = Math.floor((diff % 3600000) / 60000)
        const s = Math.floor((diff % 60000) / 1000)
        setTimeLeft(`Starts in ${h}h ${m}m ${s}s`)
        setIsLastMinute(false)
        return
      }
      if (now >= startTime && now < endTime) {
        const diff = endTime - now
        const h = Math.floor(diff / 3600000)
        const m = Math.floor((diff % 3600000) / 60000)
        const s = Math.floor((diff % 60000) / 1000)
        setTimeLeft(`${h}h ${m}m ${s}s`)
        setIsLastMinute(diff <= 30000)
        return
      }
      setTimeLeft('Auction Ended')
      setIsLastMinute(false)
      clearInterval(timer)
    }, 1000)
    return () => clearInterval(timer)
  }, [auction])

  const fetchAuction = async () => {
    try {
      const res = await API.get(`/auctions/${id}`)
      setAuction(res.data)
      setExtensionCount(res.data.extension_count || 0)
    } catch (err) { console.error(err) }
  }

  const fetchBids = async () => {
    try {
      const res = await API.get(`/bids/${id}/all`)
      setBids(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchCredits = async () => {
    try {
      const res = await API.get('/credits/balance')
      setCredits(res.data.credits)
    } catch (err) { console.error(err) }
  }

  const placeBid = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await API.post(`/bids/${id}/place`, { amount: parseFloat(amount) })
      if (res.data.time_extended) {
        setExtended(true)
        setExtensionCount(res.data.extension_count)
        setAuction(prev => ({ ...prev, end_time: res.data.new_end_time }))
        setMessage('Bid placed! Clock extended by 60 seconds!')
        setMessageType('extended')
        setTimeout(() => setExtended(false), 4000)
      } else {
        setMessage('Bid placed successfully!')
        setMessageType('success')
      }
      setAmount('')
      fetchBids()
      fetchCredits()
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Error placing bid')
      setMessageType('error')
    }
    setLoading(false)
  }

  if (!auction) return (
    <div style={styles.loadingScreen}>
      <div style={styles.loadingLogo}>GavelX</div>
      <div style={styles.loadingText}>Loading auction...</div>
    </div>
  )

  const canBid = !auction.is_closed &&
    timeLeft !== 'Auction Ended' &&
    !timeLeft.startsWith('Starts')

  return (
    <div style={styles.container}>

      {/* Extension Alert Banner */}
      {extended && (
        <div style={styles.extensionBanner}>
          ⚡ Last-minute bid detected! Auction extended by 60 seconds!
        </div>
      )}

      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <h1 style={styles.logo} onClick={() => navigate('/dashboard')}>GavelX</h1>
          <div style={styles.navDivider} />
          <span style={styles.navBreadcrumb}>
            <span style={styles.navBreadcrumbLink} onClick={() => navigate('/dashboard')}>
              Auctions
            </span>
            {' → '}
            <span style={styles.navBreadcrumbCurrent}>{auction.title}</span>
          </span>
        </div>
        <div style={styles.navRight}>
          <div style={styles.creditsBadge}>
            <span>💰</span>
            <span style={styles.creditsAmount}>{credits} credits</span>
          </div>
          {extensionCount > 0 && (
            <div style={styles.extBadge}>
              ⚡ Extended {extensionCount}x
            </div>
          )}
          <div style={styles.userAvatar}>{username?.[0]?.toUpperCase()}</div>
          <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
            ← Back
          </button>
        </div>
      </div>

      <div style={styles.main}>
        <div style={styles.grid}>

          {/* LEFT COLUMN */}
          <div style={styles.leftCol}>

            {/* Image */}
            {auction.image_url && (
              <div style={styles.imageWrapper}>
                <img src={auction.image_url} alt={auction.title} style={styles.image} />
                <div style={styles.imageOverlay}>
                  <span style={{
                    ...styles.statusPill,
                    background: timeLeft.startsWith('Starts') ? '#7c3aed' :
                                 timeLeft === 'Auction Ended' ? '#333' : '#f59e0b',
                    color: timeLeft === 'Auction Ended' ? '#888' : '#000'
                  }}>
                    {timeLeft.startsWith('Starts') ? 'Upcoming' :
                     timeLeft === 'Auction Ended' ? 'Ended' : '● Live Now'}
                  </span>
                </div>
              </div>
            )}

            {/* Auction Info Card */}
            <div style={styles.infoCard}>
              <h1 style={styles.auctionTitle}>{auction.title}</h1>
              <p style={styles.auctionDesc}>{auction.description}</p>

              {/* Timer */}
              <div style={{
                ...styles.timerCard,
                borderColor: timeLeft.startsWith('Starts') ? '#7c3aed' :
                              isLastMinute ? '#ef4444' : '#f59e0b',
                background: timeLeft.startsWith('Starts') ? '#0d0a1a' :
                             isLastMinute ? '#1a0000' : '#0f0f00'
              }}>
                <div style={styles.timerLabel}>
                  {timeLeft.startsWith('Starts') ? '🕐 Auction starting soon' :
                   isLastMinute ? '🚨 Last 30 seconds — bid now to extend!' :
                   timeLeft === 'Auction Ended' ? '🔴 Auction has ended' :
                   '⏱ Time remaining'}
                </div>
                <div style={{
                  ...styles.timerValue,
                  color: timeLeft.startsWith('Starts') ? '#7c3aed' :
                          isLastMinute ? '#ef4444' : '#f59e0b',
                  fontSize: isLastMinute ? '36px' : '32px'
                }}>
                  {timeLeft}
                </div>
                {isLastMinute && (
                  <div style={styles.extendHint}>
                    Bidding now adds 60 seconds to the clock
                  </div>
                )}
              </div>

              {/* Bid Stats */}
              <div style={styles.statsRow}>
                <div style={styles.statBox}>
                  <div style={styles.statLabel}>Minimum bid</div>
                  <div style={styles.statValue}>{auction.minimum_bid}</div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.statLabel}>Current bid</div>
                  <div style={{...styles.statValue, color: '#22c55e'}}>
                    {auction.current_bid}
                  </div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.statLabel}>Total bids</div>
                  <div style={{...styles.statValue, color: '#7c3aed'}}>
                    {bids.length}
                  </div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.statLabel}>Your credits</div>
                  <div style={{...styles.statValue, color: '#f59e0b'}}>
                    {credits}
                  </div>
                </div>
              </div>

              {/* Bid Form */}
              {canBid ? (
                <div style={styles.bidSection}>
                  {message && (
                    <div style={{
                      ...styles.msgBox,
                      borderColor: messageType === 'extended' ? '#f59e0b' :
                                    messageType === 'success' ? '#22c55e' : '#ef4444',
                      color: messageType === 'extended' ? '#f59e0b' :
                              messageType === 'success' ? '#22c55e' : '#ef4444',
                      background: messageType === 'extended' ? '#1a1000' :
                                   messageType === 'success' ? '#0a1a0a' : '#1a0a0a'
                    }}>
                      {message}
                    </div>
                  )}
                  <form onSubmit={placeBid} style={styles.bidForm}>
                    <input
                      style={styles.bidInput}
                      type="number"
                      placeholder={`Min bid: ${Math.max(auction.minimum_bid, auction.current_bid + 1)}`}
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      required
                    />
                    <button
                      style={{
                        ...styles.bidBtn,
                        background: isLastMinute ? '#ef4444' : '#f59e0b',
                        opacity: loading ? 0.7 : 1
                      }}
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Placing...' :
                       isLastMinute ? '⚡ Bid Now — Extend Clock!' : 'Place Bid →'}
                    </button>
                  </form>
                </div>
              ) : timeLeft.startsWith('Starts') ? (
                <div style={styles.notStartedBox}>
                  🕐 Bidding opens when the auction starts
                </div>
              ) : (
                <div style={styles.endedBox}>
                  🔴 This auction has ended
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={styles.rightCol}>

            {/* Bid History */}
            <div style={styles.bidsCard}>
              <div style={styles.bidsHeader}>
                <h3 style={styles.bidsTitle}>Live Bid History</h3>
                <span style={styles.bidCountBadge}>{bids.length} bids</span>
              </div>

              {bids.length === 0 ? (
                <div style={styles.emptyBids}>
                  <div style={styles.emptyIcon}>🎯</div>
                  <p style={styles.emptyText}>No bids yet — be the first!</p>
                </div>
              ) : (
                <div style={styles.bidsList}>
                  {bids.map((bid, index) => (
                    <div key={bid.id} style={{
                      ...styles.bidRow,
                      background: index === 0 ? '#1a1500' : '#0a0a0a',
                      border: index === 0 ? '1px solid #2a2000' : '1px solid #111'
                    }}>
                      <div style={{
                        ...styles.bidRank,
                        color: index === 0 ? '#f59e0b' : '#333'
                      }}>
                        #{index + 1}
                      </div>
                      <div style={styles.bidInfo}>
                        <div style={styles.bidAmount}>
                          {bid.amount}
                          <span style={styles.bidCredits}> credits</span>
                        </div>
                        <div style={styles.bidTime}>
                          {new Date(bid.timestamp + 'Z').toLocaleTimeString()}
                        </div>
                      </div>
                      {index === 0 && (
                        <div style={styles.leadingBadge}>
                          Leading
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bid Shield Info */}
            <div style={styles.shieldCard}>
              <div style={styles.shieldHeader}>
                <span style={styles.shieldIcon}>🛡</span>
                <h4 style={styles.shieldTitle}>Bid Shield Active</h4>
              </div>
              <p style={styles.shieldText}>
                GavelX protects against last-second sniping. Any bid placed in the
                final 30 seconds automatically extends the auction by 60 seconds,
                ensuring the true highest bidder always wins.
              </p>
              {extensionCount > 0 && (
                <div style={styles.shieldStat}>
                  ⚡ This auction has been extended {extensionCount} time{extensionCount > 1 ? 's' : ''}
                </div>
              )}
            </div>

          </div>
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
  extensionBanner: { background: '#f59e0b', color: '#000', padding: '12px', textAlign: 'center', fontWeight: 'bold', fontSize: '15px', letterSpacing: '0.5px' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 32px', height: '64px', background: '#111', borderBottom: '1px solid #1a1a1a', position: 'sticky', top: 0, zIndex: 100 },
  navLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  logo: { fontSize: '22px', fontWeight: 'bold', color: '#f59e0b', cursor: 'pointer', letterSpacing: '1px' },
  navDivider: { width: '1px', height: '20px', background: '#2a2a2a' },
  navBreadcrumb: { color: '#444', fontSize: '13px' },
  navBreadcrumbLink: { color: '#666', cursor: 'pointer' },
  navBreadcrumbCurrent: { color: '#888' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  creditsBadge: { display: 'flex', alignItems: 'center', gap: '6px', background: '#1a1500', border: '1px solid #2a2000', padding: '6px 14px', borderRadius: '20px' },
  creditsAmount: { color: '#f59e0b', fontWeight: 'bold', fontSize: '14px' },
  extBadge: { background: '#1a0a1a', color: '#a78bfa', border: '1px solid #7c3aed', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  userAvatar: { width: '32px', height: '32px', borderRadius: '50%', background: '#f59e0b', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' },
  backBtn: { background: 'transparent', color: '#666', border: '1px solid #1a1a1a', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' },
  main: { padding: '32px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' },
  leftCol: { display: 'flex', flexDirection: 'column', gap: '16px' },
  rightCol: { display: 'flex', flexDirection: 'column', gap: '16px' },
  imageWrapper: { position: 'relative', borderRadius: '16px', overflow: 'hidden', height: '280px' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  imageOverlay: { position: 'absolute', top: '16px', left: '16px' },
  statusPill: { padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  infoCard: { background: '#111', borderRadius: '16px', padding: '28px', border: '1px solid #1a1a1a' },
  auctionTitle: { fontSize: '26px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' },
  auctionDesc: { color: '#555', fontSize: '14px', lineHeight: '1.7', marginBottom: '24px' },
  timerCard: { borderRadius: '12px', padding: '20px', marginBottom: '24px', textAlign: 'center', border: '2px solid', transition: 'all 0.3s' },
  timerLabel: { color: '#888', fontSize: '12px', marginBottom: '8px' },
  timerValue: { fontWeight: 'bold', letterSpacing: '1px' },
  extendHint: { color: '#ef4444', fontSize: '11px', marginTop: '8px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' },
  statBox: { background: '#0a0a0a', borderRadius: '10px', padding: '14px', textAlign: 'center', border: '1px solid #111' },
  statLabel: { color: '#444', fontSize: '11px', marginBottom: '6px' },
  statValue: { color: '#fff', fontWeight: 'bold', fontSize: '20px' },
  bidSection: {},
  msgBox: { padding: '10px 14px', borderRadius: '8px', border: '1px solid', marginBottom: '12px', fontSize: '13px', fontWeight: 'bold' },
  bidForm: { display: 'flex', gap: '10px' },
  bidInput: { flex: 1, padding: '14px 16px', background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '10px', color: '#fff', fontSize: '15px', outline: 'none' },
  bidBtn: { padding: '14px 24px', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', whiteSpace: 'nowrap' },
  notStartedBox: { padding: '16px', background: '#0d0a1a', borderRadius: '10px', color: '#7c3aed', border: '1px solid #7c3aed', textAlign: 'center', fontWeight: 'bold' },
  endedBox: { padding: '16px', background: '#0a0a0a', borderRadius: '10px', color: '#444', border: '1px solid #1a1a1a', textAlign: 'center' },
  bidsCard: { background: '#111', borderRadius: '16px', padding: '24px', border: '1px solid #1a1a1a', flex: 1 },
  bidsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  bidsTitle: { color: '#fff', fontSize: '16px', fontWeight: 'bold' },
  bidCountBadge: { background: '#1a1a1a', color: '#666', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' },
  emptyBids: { textAlign: 'center', padding: '40px 20px' },
  emptyIcon: { fontSize: '32px', marginBottom: '12px' },
  emptyText: { color: '#444', fontSize: '14px' },
  bidsList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  bidRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '10px' },
  bidRank: { fontWeight: 'bold', fontSize: '13px', width: '28px' },
  bidInfo: { flex: 1 },
  bidAmount: { color: '#fff', fontWeight: 'bold', fontSize: '16px' },
  bidCredits: { color: '#555', fontSize: '12px', fontWeight: 'normal' },
  bidTime: { color: '#444', fontSize: '11px', marginTop: '2px' },
  leadingBadge: { background: '#1a1500', color: '#f59e0b', border: '1px solid #2a2000', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' },
  shieldCard: { background: '#0d0a1a', borderRadius: '16px', padding: '20px', border: '1px solid #1a1035' },
  shieldHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  shieldIcon: { fontSize: '20px' },
  shieldTitle: { color: '#a78bfa', fontWeight: 'bold', fontSize: '14px' },
  shieldText: { color: '#555', fontSize: '13px', lineHeight: '1.6' },
  shieldStat: { marginTop: '12px', color: '#7c3aed', fontSize: '13px', fontWeight: 'bold' }
}