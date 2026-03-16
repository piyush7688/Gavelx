import { useEffect, useState, useRef } from 'react'
import API from '../api'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

export default function ReportsDashboard() {
  const [summary, setSummary] = useState(null)
  const [bidsPerAuction, setBidsPerAuction] = useState([])
  const [creditsPerUser, setCreditsPerUser] = useState([])
  const [recentBids, setRecentBids] = useState([])
  const [leaderboard, setLeaderboard] = useState([])

  const barChartRef = useRef(null)
  const pieChartRef = useRef(null)
  const barChartInstance = useRef(null)
  const pieChartInstance = useRef(null)

  useEffect(() => {
    fetchAll()
  }, [])

  useEffect(() => {
    if (bidsPerAuction.length > 0) renderBarChart()
    if (creditsPerUser.length > 0) renderPieChart()
  }, [bidsPerAuction, creditsPerUser])

  const fetchAll = async () => {
    try {
      const [s, b, c, r, l] = await Promise.all([
        API.get('/reports/summary'),
        API.get('/reports/bids-per-auction'),
        API.get('/reports/credits-per-user'),
        API.get('/reports/recent-bids'),
        API.get('/reports/leaderboard')
      ])
      setSummary(s.data)
      setBidsPerAuction(b.data)
      setCreditsPerUser(c.data)
      setRecentBids(r.data)
      setLeaderboard(l.data)
    } catch (err) { console.error(err) }
  }

  const renderBarChart = () => {
    if (barChartInstance.current) barChartInstance.current.destroy()
    const ctx = barChartRef.current?.getContext('2d')
    if (!ctx) return
    barChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: bidsPerAuction.map(a => a.title),
        datasets: [{
          label: 'Number of bids',
          data: bidsPerAuction.map(a => a.bid_count),
          backgroundColor: '#f59e0b',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: '#888' } }
        },
        scales: {
          x: { ticks: { color: '#888' }, grid: { color: '#2a2a2a' } },
          y: { ticks: { color: '#888' }, grid: { color: '#2a2a2a' }, beginAtZero: true }
        }
      }
    })
  }

  const renderPieChart = () => {
    if (pieChartInstance.current) pieChartInstance.current.destroy()
    const ctx = pieChartRef.current?.getContext('2d')
    if (!ctx) return
    const colors = ['#f59e0b', '#7c3aed', '#22c55e', '#ef4444', '#3b82f6', '#ec4899']
    pieChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: creditsPerUser.map(u => u.username),
        datasets: [{
          data: creditsPerUser.map(u => u.credits),
          backgroundColor: colors.slice(0, creditsPerUser.length),
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: '#888' }, position: 'bottom' }
        }
      }
    })
  }

  if (!summary) return (
    <div style={styles.loading}>Loading reports...</div>
  )

  return (
    <div style={styles.container}>

      {/* Summary Cards */}
      <div style={styles.statsGrid}>
        {[
          { label: 'Total auctions', value: summary.total_auctions, color: '#f59e0b' },
          { label: 'Active auctions', value: summary.active_auctions, color: '#22c55e' },
          { label: 'Closed auctions', value: summary.closed_auctions, color: '#ef4444' },
          { label: 'Total bids', value: summary.total_bids, color: '#7c3aed' },
          { label: 'Total bidders', value: summary.total_users, color: '#3b82f6' },
          { label: 'Credits in system', value: summary.total_credits_in_system, color: '#ec4899' }
        ].map((stat, i) => (
          <div key={i} style={styles.statCard}>
            <div style={{ ...styles.statValue, color: stat.color }}>{stat.value}</div>
            <div style={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={styles.chartsRow}>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Bids per auction</h3>
          {bidsPerAuction.length === 0 ? (
            <p style={styles.empty}>No auction data yet</p>
          ) : (
            <canvas ref={barChartRef} height="200"/>
          )}
        </div>
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Credits per bidder</h3>
          {creditsPerUser.length === 0 ? (
            <p style={styles.empty}>No bidder data yet</p>
          ) : (
            <canvas ref={pieChartRef} height="200"/>
          )}
        </div>
      </div>

      {/* Leaderboard + Recent Bids */}
      <div style={styles.bottomRow}>

        {/* Leaderboard */}
        <div style={styles.tableCard}>
          <h3 style={styles.chartTitle}>Bidder leaderboard</h3>
          {leaderboard.length === 0 ? (
            <p style={styles.empty}>No bidders yet</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Rank', 'Username', 'Total Bids', 'Wins', 'Credits Left'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((u, i) => (
                  <tr key={i} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={{
                        color: i === 0 ? '#f59e0b' : i === 1 ? '#888' : '#cd7f32',
                        fontWeight: 'bold'
                      }}>
                        #{i + 1}
                      </span>
                    </td>
                    <td style={styles.td}>{u.username}</td>
                    <td style={styles.td}>{u.total_bids}</td>
                    <td style={styles.td}>
                      {u.wins > 0
                        ? <span style={styles.winBadge}>{u.wins} wins</span>
                        : <span style={styles.zeroBadge}>0</span>
                      }
                    </td>
                    <td style={styles.td}>{u.credits_remaining}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent Bids */}
        <div style={styles.tableCard}>
          <h3 style={styles.chartTitle}>Recent bids</h3>
          {recentBids.length === 0 ? (
            <p style={styles.empty}>No bids yet</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Bidder', 'Auction', 'Amount', 'Time'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentBids.map((bid, i) => (
                  <tr key={i} style={styles.tr}>
                    <td style={styles.td}>{bid.bidder}</td>
                    <td style={styles.td}>{bid.auction}</td>
                    <td style={styles.td}>
                      <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                        {bid.amount}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {new Date(bid.timestamp + 'Z').toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* Refresh button */}
      <button style={styles.refreshBtn} onClick={fetchAll}>
        Refresh Reports
      </button>

    </div>
  )
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  loading: { color: '#888', textAlign: 'center', padding: '40px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' },
  statCard: { background: '#1a1a1a', borderRadius: '12px', padding: '16px', border: '1px solid #2a2a2a', textAlign: 'center' },
  statValue: { fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' },
  statLabel: { color: '#888', fontSize: '12px' },
  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  chartCard: { background: '#1a1a1a', borderRadius: '12px', padding: '20px', border: '1px solid #2a2a2a' },
  chartTitle: { color: '#fff', fontSize: '15px', fontWeight: 'bold', marginBottom: '16px' },
  empty: { color: '#888', fontSize: '13px', textAlign: 'center', padding: '20px' },
  bottomRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  tableCard: { background: '#1a1a1a', borderRadius: '12px', padding: '20px', border: '1px solid #2a2a2a' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px', color: '#f59e0b', borderBottom: '1px solid #2a2a2a', fontSize: '12px' },
  tr: { borderBottom: '1px solid #2a2a2a' },
  td: { padding: '10px', color: '#ccc', fontSize: '13px' },
  winBadge: { background: '#f59e0b', color: '#000', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' },
  zeroBadge: { color: '#888', fontSize: '13px' },
  refreshBtn: { background: '#2a2a2a', color: '#f59e0b', border: '1px solid #f59e0b', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', alignSelf: 'flex-start' }
}