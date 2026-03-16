import { useEffect, useState } from 'react'
import API from '../api'
import { useNavigate } from 'react-router-dom'
import AdminChatPanel from '../components/AdminChatPanel'
import ReportsDashboard from '../components/ReportsDashboard'
import ImageUpload from '../components/ImageUpload'

export default function AdminPanel() {
  const [auctions, setAuctions] = useState([])
  const [users, setUsers] = useState([])
  const [activeTab, setActiveTab] = useState('auctions')
  const [form, setForm] = useState({ title: '', description: '', image_url: '', start_time: '', end_time: '', minimum_bid: '' })
  const [creditForm, setCreditForm] = useState({ user_id: '', amount: '' })
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const username = localStorage.getItem('username')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    fetchAuctions()
    fetchUsers()
  }, [])

  const fetchAuctions = async () => {
    try {
      const res = await API.get('/auctions/all')
      setAuctions(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchUsers = async () => {
    try {
      const res = await API.get('/credits/all-users')
      setUsers(res.data)
    } catch (err) { console.error(err) }
  }

  const toLocalDatetime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }

  const createAuction = async (e) => {
    e.preventDefault()
    try {
      await API.post('/auctions/create', {
        ...form,
        minimum_bid: parseFloat(form.minimum_bid),
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString()
      })
      setMessage('Auction created successfully!')
      setForm({ title: '', description: '', image_url: '', start_time: '', end_time: '', minimum_bid: '' })
      fetchAuctions()
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Error creating auction')
    }
  }

  const closeAuction = async (id) => {
    try {
      await API.post(`/auctions/${id}/close`)
      setMessage('Auction closed!')
      fetchAuctions()
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Error closing auction')
    }
  }

  const deleteAuction = async (id) => {
    try {
      await API.delete(`/auctions/${id}`)
      setMessage('Auction deleted!')
      fetchAuctions()
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Error deleting auction')
    }
  }

  const assignCredits = async (e) => {
    e.preventDefault()
    try {
      await API.post('/credits/assign', {
        user_id: parseInt(creditForm.user_id),
        amount: parseFloat(creditForm.amount)
      })
      setMessage('Credits assigned successfully!')
      setCreditForm({ user_id: '', amount: '' })
      fetchUsers()
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Error assigning credits')
    }
  }

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <h1 style={styles.logo}>GavelX Admin</h1>
        <div style={styles.navRight}>
          <span style={styles.adminBadge}>Admin</span>
          <span style={styles.username}>{username}</span>
          <button style={styles.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {['auctions', 'create', 'users', 'credits', 'livechat', 'reports'].map(tab => (
          <button
            key={tab}
            style={{ ...styles.tab, ...(activeTab === tab ? styles.activeTab : {}) }}
            onClick={() => { setActiveTab(tab); setMessage('') }}
          >
            {tab === 'auctions' ? 'Manage Auctions' :
             tab === 'create' ? 'Create Auction' :
             tab === 'users' ? 'View Users' :
             tab === 'credits' ? 'Assign Credits' :
             tab === 'livechat' ? 'Live Chat' : 'Reports'}
          </button>
        ))}
      </div>

      {message && <div style={styles.message}>{message}</div>}

      <div style={styles.content}>

        {/* Manage Auctions */}
        {activeTab === 'auctions' && (
          <div>
            <h2 style={styles.heading}>All Active Auctions</h2>
            {auctions.length === 0 ? (
              <p style={styles.empty}>No active auctions.</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    {['ID', 'Title', 'Min Bid', 'Current Bid', 'End Time', 'Actions'].map(h => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auctions.map(a => (
                    <tr key={a.id} style={styles.tr}>
                      <td style={styles.td}>{a.id}</td>
                      <td style={styles.td}>{a.title}</td>
                      <td style={styles.td}>{a.minimum_bid}</td>
                      <td style={styles.td}>{a.current_bid}</td>
                      <td style={styles.td}>{new Date(a.end_time + 'Z').toLocaleString()}</td>
                      <td style={styles.td}>
                        <button style={styles.closeBtn} onClick={() => closeAuction(a.id)}>Close</button>
                        <button style={styles.deleteBtn} onClick={() => deleteAuction(a.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Create Auction */}
        {activeTab === 'create' && (
          <div style={styles.formCard}>
            <h2 style={styles.heading}>Create New Auction</h2>
            <form onSubmit={createAuction}>
              <input
                style={styles.input}
                placeholder="Title"
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                required
              />
              <textarea
                style={{...styles.input, height:'80px'}}
                placeholder="Description"
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                required
              />
              <label style={styles.label}>Auction image</label>
              <ImageUpload
                onUpload={(url) => setForm({...form, image_url: url})}
                currentImage={form.image_url}
              />
              <label style={styles.label}>Start Time</label>
              <input
                style={styles.input}
                type="datetime-local"
                min={toLocalDatetime()}
                value={form.start_time}
                onChange={e => setForm({...form, start_time: e.target.value})}
                required
              />
              <label style={styles.label}>End Time</label>
              <input
                style={styles.input}
                type="datetime-local"
                min={toLocalDatetime()}
                value={form.end_time}
                onChange={e => setForm({...form, end_time: e.target.value})}
                required
              />
              <input
                style={styles.input}
                placeholder="Minimum Bid"
                type="number"
                value={form.minimum_bid}
                onChange={e => setForm({...form, minimum_bid: e.target.value})}
                required
              />
              <button style={styles.submitBtn} type="submit">Create Auction</button>
            </form>
          </div>
        )}

        {/* View Users */}
        {activeTab === 'users' && (
          <div>
            <h2 style={styles.heading}>Registered Bidders</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['ID', 'Username', 'Email', 'Credits', 'Status'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={styles.tr}>
                    <td style={styles.td}>{u.id}</td>
                    <td style={styles.td}>{u.username}</td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>{u.credits}</td>
                    <td style={styles.td}>
                      <span style={{color: u.is_active ? '#22c55e' : '#ef4444'}}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Assign Credits */}
        {activeTab === 'credits' && (
          <div style={styles.formCard}>
            <h2 style={styles.heading}>Assign Credits to Bidder</h2>
            <div style={styles.userList}>
              {users.map(u => (
                <div key={u.id} style={styles.userRow}>
                  <span style={styles.userName}>{u.username}</span>
                  <span style={styles.userId}>ID: {u.id}</span>
                  <span style={styles.userCredits}>{u.credits} credits</span>
                </div>
              ))}
            </div>
            <form onSubmit={assignCredits} style={{marginTop:'24px'}}>
              <input
                style={styles.input}
                placeholder="User ID"
                type="number"
                value={creditForm.user_id}
                onChange={e => setCreditForm({...creditForm, user_id: e.target.value})}
                required
              />
              <input
                style={styles.input}
                placeholder="Credits to assign"
                type="number"
                value={creditForm.amount}
                onChange={e => setCreditForm({...creditForm, amount: e.target.value})}
                required
              />
              <button style={styles.submitBtn} type="submit">Assign Credits</button>
            </form>
          </div>
        )}

        {/* Live Chat */}
        {activeTab === 'livechat' && (
          <AdminChatPanel />
        )}
        {activeTab === 'reports' && (
          <ReportsDashboard />
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#0f0f0f' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', background: '#1a1a1a', borderBottom: '1px solid #2a2a2a' },
  logo: { fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  adminBadge: { background: '#7c3aed', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  username: { color: '#888', fontSize: '14px' },
  logoutBtn: { background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' },
  tabs: { display: 'flex', gap: '4px', padding: '16px 32px', background: '#1a1a1a', borderBottom: '1px solid #2a2a2a', flexWrap: 'wrap' },
  tab: { padding: '10px 20px', background: 'transparent', color: '#888', border: '1px solid #2a2a2a', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' },
  activeTab: { background: '#f59e0b', color: '#000', fontWeight: 'bold', border: '1px solid #f59e0b' },
  message: { margin: '16px 32px', padding: '12px', background: '#1a2a1a', color: '#22c55e', borderRadius: '8px', border: '1px solid #22c55e' },
  content: { padding: '32px' },
  heading: { fontSize: '20px', fontWeight: 'bold', color: '#fff', marginBottom: '20px' },
  empty: { color: '#888' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px', background: '#1a1a1a', color: '#f59e0b', borderBottom: '1px solid #2a2a2a', fontSize: '13px' },
  tr: { borderBottom: '1px solid #2a2a2a' },
  td: { padding: '12px', color: '#ccc', fontSize: '13px' },
  closeBtn: { background: '#f59e0b', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', marginRight: '8px', cursor: 'pointer' },
  deleteBtn: { background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' },
  formCard: { maxWidth: '500px' },
  label: { color: '#888', fontSize: '13px', marginBottom: '4px', display: 'block' },
  input: { width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #333', background: '#2a2a2a', color: '#fff', fontSize: '14px' },
  submitBtn: { width: '100%', padding: '12px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  userList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  userRow: { display: 'flex', alignItems: 'center', gap: '16px', padding: '12px', background: '#1a1a1a', borderRadius: '8px', border: '1px solid #2a2a2a' },
  userName: { color: '#fff', fontWeight: 'bold', flex: 1 },
  userId: { color: '#888', fontSize: '13px' },
  userCredits: { color: '#f59e0b', fontWeight: 'bold' }
}