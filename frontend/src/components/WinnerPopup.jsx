import { useEffect, useState } from 'react'
import API from '../api'

export default function WinnerPopup() {
  const [winner, setWinner] = useState(null)
  const username = localStorage.getItem('username')

  useEffect(() => {
    const interval = setInterval(checkWins, 15000)
    checkWins()
    return () => clearInterval(interval)
  }, [])

  const checkWins = async () => {
    try {
      const res = await API.get('/bids/my/history')
      const newWin = res.data.find(b =>
        b.is_winning &&
        !localStorage.getItem(`seen_win_${b.id}`)
      )
      if (newWin) {
        setWinner(newWin)
        localStorage.setItem(`seen_win_${newWin.id}`, 'true')
      }
    } catch (err) { console.error(err) }
  }

  if (!winner) return null

  return (
    <div style={styles.overlay}>
      <div style={styles.popup}>
        <div style={styles.confetti}>
          {['🎉', '🏆', '⭐', '✨', '🎊', '💰', '🥇', '🎯'].map((e, i) => (
            <span key={i} style={{
              ...styles.confettiItem,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              fontSize: `${16 + Math.random() * 20}px`
            }}>{e}</span>
          ))}
        </div>
        <div style={styles.trophyIcon}>🏆</div>
        <h1 style={styles.title}>You Won!</h1>
        <p style={styles.subtitle}>Congratulations {username}!</p>
        <div style={styles.auctionInfo}>
          <p style={styles.auctionLabel}>Winning auction</p>
          <p style={styles.auctionId}>Auction #{winner.auction_id}</p>
          <div style={styles.amountBox}>
            <span style={styles.amountLabel}>Winning bid</span>
            <span style={styles.amount}>{winner.amount} credits</span>
          </div>
        </div>
        <button
          style={styles.closeBtn}
          onClick={() => setWinner(null)}
        >
          Awesome! 🎉
        </button>
      </div>
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, overflow: 'hidden' },
  popup: { background: '#111', borderRadius: '24px', padding: '48px 40px', textAlign: 'center', border: '2px solid #f59e0b', maxWidth: '400px', width: '90%', position: 'relative', animation: 'popIn 0.5s ease forwards' },
  confetti: { position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' },
  confettiItem: { position: 'absolute', top: '-20px', animation: 'fall 3s linear infinite' },
  trophyIcon: { fontSize: '72px', marginBottom: '16px', display: 'block' },
  title: { fontSize: '40px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' },
  subtitle: { color: '#888', fontSize: '16px', marginBottom: '24px' },
  auctionInfo: { background: '#0a0a0a', borderRadius: '12px', padding: '20px', marginBottom: '24px', border: '1px solid #1a1a1a' },
  auctionLabel: { color: '#555', fontSize: '12px', marginBottom: '4px' },
  auctionId: { color: '#fff', fontWeight: 'bold', fontSize: '16px', marginBottom: '16px' },
  amountBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  amountLabel: { color: '#555', fontSize: '13px' },
  amount: { color: '#22c55e', fontWeight: 'bold', fontSize: '20px' },
  closeBtn: { width: '100%', padding: '14px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }
}