import { useState, useEffect, useRef } from 'react'
import API from '../api'

export default function AdminChatPanel() {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [broadcast, setBroadcast] = useState('')
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)
  const messagesEndRef = useRef(null)
  const adminId = 1
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchUsers()
    connectWebSocket()
    const interval = setInterval(fetchUsers, 5000)
    return () => {
      clearInterval(interval)
      if (wsRef.current) wsRef.current.close()
    }
  }, [])

  useEffect(() => {
    if (selectedUser) fetchHistory(selectedUser.id)
  }, [selectedUser])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const connectWebSocket = () => {
    const ws = new WebSocket(`ws://localhost:8000/chat/ws/${adminId}/${token}`)
    ws.onopen = () => setConnected(true)
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      setMessages(prev => {
        const exists = prev.find(m => m.id === msg.id)
        if (exists) return prev
        return [...prev, msg]
      })
      fetchUsers()
    }
    ws.onclose = () => {
      setConnected(false)
      setTimeout(connectWebSocket, 3000)
    }
    wsRef.current = ws
  }

  const fetchUsers = async () => {
    try {
      const res = await API.get('/chat/users')
      setUsers(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchHistory = async (userId) => {
    try {
      const res = await API.get(`/chat/history/${userId}`)
      setMessages(res.data)
    } catch (err) { console.error(err) }
  }

  const sendMessage = () => {
    if (!input.trim() || !selectedUser || !wsRef.current) return
    wsRef.current.send(JSON.stringify({
      content: input.trim(),
      receiver_id: selectedUser.id,
      is_broadcast: false
    }))
    setInput('')
  }

  const sendBroadcast = () => {
    if (!broadcast.trim() || !wsRef.current) return
    wsRef.current.send(JSON.stringify({
      content: broadcast.trim(),
      is_broadcast: true
    }))
    setBroadcast('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') sendMessage()
  }

  return (
    <div style={styles.container}>

      {/* Broadcast bar */}
      <div style={styles.broadcastBar}>
        <span style={styles.broadcastLabel}>Broadcast to all bidders:</span>
        <input
          style={styles.broadcastInput}
          placeholder="Type announcement..."
          value={broadcast}
          onChange={e => setBroadcast(e.target.value)}
        />
        <button style={styles.broadcastBtn} onClick={sendBroadcast}>
          Send to All
        </button>
        <span style={{ color: connected ? '#22c55e' : '#888', fontSize: '12px' }}>
          {connected ? 'Connected' : 'Reconnecting...'}
        </span>
      </div>

      <div style={styles.chatLayout}>

        {/* Users list */}
        <div style={styles.usersList}>
          <h3 style={styles.usersTitle}>Bidders</h3>
          {users.length === 0 ? (
            <p style={styles.empty}>No bidders yet</p>
          ) : (
            users.map(u => (
              <div
                key={u.id}
                style={{
                  ...styles.userRow,
                  background: selectedUser?.id === u.id ? '#2a1a4a' : '#1a1a1a',
                  border: selectedUser?.id === u.id ? '1px solid #7c3aed' : '1px solid #2a2a2a'
                }}
                onClick={() => setSelectedUser(u)}
              >
                <div style={styles.userAvatar}>
                  {u.username[0].toUpperCase()}
                </div>
                <div style={styles.userInfo}>
                  <span style={styles.userName}>{u.username}</span>
                  <span style={{ color: u.online ? '#22c55e' : '#888', fontSize: '11px' }}>
                    {u.online ? 'Online' : 'Offline'}
                  </span>
                </div>
                {u.unread > 0 && (
                  <span style={styles.unreadBadge}>{u.unread}</span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Chat area */}
        <div style={styles.chatArea}>
          {!selectedUser ? (
            <div style={styles.noChat}>
              Select a bidder to start chatting
            </div>
          ) : (
            <>
              <div style={styles.chatHeader}>
                Chatting with {selectedUser.username}
              </div>
              <div style={styles.messages}>
                {messages.length === 0 && (
                  <p style={styles.empty}>No messages yet</p>
                )}
                {messages.map((msg, i) => (
                  <div key={i} style={{
                    ...styles.msgRow,
                    justifyContent: msg.sender_id === adminId ? 'flex-end' : 'flex-start'
                  }}>
                    <div style={{
                      ...styles.bubble,
                      background: msg.sender_id === adminId ? '#7c3aed' :
                                   msg.is_broadcast ? '#f59e0b' : '#2a2a2a',
                      color: '#fff',
                      borderRadius: msg.sender_id === adminId
                        ? '16px 16px 4px 16px'
                        : '16px 16px 16px 4px'
                    }}>
                      {msg.content}
                      <div style={styles.msgTime}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div style={styles.inputRow}>
                <input
                  style={styles.input}
                  placeholder={`Message ${selectedUser.username}...`}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                />
                <button style={styles.sendBtn} onClick={sendMessage}>Send</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { height: '600px', display: 'flex', flexDirection: 'column', gap: '16px' },
  broadcastBar: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#1a1a1a', borderRadius: '10px', border: '1px solid #7c3aed' },
  broadcastLabel: { color: '#a78bfa', fontSize: '13px', fontWeight: 'bold', whiteSpace: 'nowrap' },
  broadcastInput: { flex: 1, padding: '8px 12px', background: '#2a2a2a', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '13px' },
  broadcastBtn: { padding: '8px 16px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' },
  chatLayout: { display: 'grid', gridTemplateColumns: '220px 1fr', gap: '16px', flex: 1, overflow: 'hidden' },
  usersList: { background: '#1a1a1a', borderRadius: '10px', border: '1px solid #2a2a2a', padding: '12px', overflowY: 'auto' },
  usersTitle: { color: '#fff', fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' },
  userRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', cursor: 'pointer', marginBottom: '6px' },
  userAvatar: { width: '32px', height: '32px', borderRadius: '50%', background: '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', flexShrink: 0 },
  userInfo: { flex: 1, display: 'flex', flexDirection: 'column' },
  userName: { color: '#fff', fontSize: '13px', fontWeight: 'bold' },
  unreadBadge: { background: '#ef4444', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  chatArea: { background: '#1a1a1a', borderRadius: '10px', border: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  noChat: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '14px' },
  chatHeader: { padding: '14px 16px', borderBottom: '1px solid #2a2a2a', color: '#fff', fontWeight: 'bold', fontSize: '14px', background: '#111' },
  messages: { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' },
  empty: { color: '#888', fontSize: '13px', textAlign: 'center' },
  msgRow: { display: 'flex' },
  bubble: { maxWidth: '70%', padding: '8px 12px', fontSize: '13px', lineHeight: '1.4' },
  msgTime: { fontSize: '10px', opacity: 0.6, marginTop: '4px' },
  inputRow: { display: 'flex', gap: '8px', padding: '12px', borderTop: '1px solid #2a2a2a' },
  input: { flex: 1, padding: '10px', background: '#2a2a2a', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '13px' },
  sendBtn: { padding: '10px 16px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }
}