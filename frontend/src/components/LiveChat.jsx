import { useState, useEffect, useRef } from 'react'
import API from '../api'

export default function LiveChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [unread, setUnread] = useState(0)
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)
  const messagesEndRef = useRef(null)
  const userId = parseInt(localStorage.getItem('user_id'))
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token || !userId) return
    connectWebSocket()
    fetchHistory()

    const unreadInterval = setInterval(fetchUnread, 5000)
    return () => {
      clearInterval(unreadInterval)
      if (wsRef.current) wsRef.current.close()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) {
      setUnread(0)
      fetchHistory()
    }
  }, [open])

  const connectWebSocket = () => {
    if (!userId || !token) return
    const ws = new WebSocket(`ws://localhost:8000/chat/ws/${userId}/${token}`)
    ws.onopen = () => {
      setConnected(true)
      console.log('Bidder chat connected')
    }
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      setMessages(prev => {
        const exists = prev.find(m => m.id === msg.id)
        if (exists) return prev
        return [...prev, msg]
      })
      if (!open) setUnread(prev => prev + 1)
    }
    ws.onclose = () => {
      setConnected(false)
      setTimeout(connectWebSocket, 3000)
    }
    ws.onerror = (err) => {
      console.error('WebSocket error:', err)
    }
    wsRef.current = ws
  }

  const fetchHistory = async () => {
    try {
      const res = await API.get('/chat/history/1')
      setMessages(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchUnread = async () => {
    try {
      const res = await API.get('/chat/unread')
      setUnread(res.data.unread)
    } catch (err) { console.error(err) }
  }

  const sendMessage = () => {
    if (!input.trim() || !wsRef.current) return
    if (wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected')
      return
    }
    wsRef.current.send(JSON.stringify({
      content: input.trim(),
      receiver_id: 1,
      is_broadcast: false
    }))
    setInput('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') sendMessage()
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        style={styles.floatBtn}
      >
        {open ? '✕' : '🗨'}
        {unread > 0 && !open && (
          <span style={styles.badge}>{unread}</span>
        )}
      </button>

      {open && (
        <div style={styles.chatWindow}>
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.avatar}>A</div>
              <div>
                <div style={styles.adminName}>Admin Support</div>
                <div style={{ color: connected ? '#22c55e' : '#f59e0b', fontSize: '11px' }}>
                  {connected ? 'Connected' : 'Connecting...'}
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={styles.closeBtn}>✕</button>
          </div>

          <div style={styles.messages}>
            {messages.length === 0 && (
              <div style={styles.emptyMsg}>
                Send a message to the admin!
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{
                ...styles.msgRow,
                justifyContent: msg.sender_id === userId ? 'flex-end' : 'flex-start'
              }}>
                {msg.sender_id !== userId && (
                  <div style={styles.senderAvatar}>A</div>
                )}
                <div style={{
                  ...styles.bubble,
                  background: msg.sender_id === userId ? '#f59e0b' :
                               msg.is_broadcast ? '#7c3aed' : '#2a2a2a',
                  color: msg.sender_id === userId ? '#000' : '#fff',
                  borderRadius: msg.sender_id === userId
                    ? '16px 16px 4px 16px'
                    : '16px 16px 16px 4px'
                }}>
                  {msg.is_broadcast && (
                    <div style={styles.broadcastLabel}>Announcement</div>
                  )}
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
              placeholder="Message admin..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button
              style={{
                ...styles.sendBtn,
                opacity: !connected ? 0.6 : 1
              }}
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  floatBtn: { position: 'fixed', bottom: '92px', right: '24px', width: '56px', height: '56px', borderRadius: '50%', background: '#7c3aed', border: 'none', fontSize: '22px', cursor: 'pointer', zIndex: 1000 },
  badge: { position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  chatWindow: { position: 'fixed', bottom: '160px', right: '24px', width: '320px', height: '440px', background: '#1a1a1a', borderRadius: '16px', border: '1px solid #7c3aed', display: 'flex', flexDirection: 'column', zIndex: 1000, overflow: 'hidden' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#111', borderBottom: '1px solid #2a2a2a' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '34px', height: '34px', borderRadius: '50%', background: '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  adminName: { color: '#fff', fontWeight: 'bold', fontSize: '14px' },
  closeBtn: { background: 'transparent', border: 'none', color: '#888', fontSize: '16px', cursor: 'pointer' },
  messages: { flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' },
  emptyMsg: { color: '#888', fontSize: '13px', textAlign: 'center', padding: '20px' },
  msgRow: { display: 'flex', alignItems: 'flex-end', gap: '6px' },
  senderAvatar: { width: '24px', height: '24px', borderRadius: '50%', background: '#7c3aed', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', flexShrink: 0 },
  bubble: { maxWidth: '75%', padding: '8px 12px', fontSize: '13px', lineHeight: '1.4' },
  broadcastLabel: { fontSize: '10px', fontWeight: 'bold', color: '#c4b5fd', marginBottom: '4px' },
  msgTime: { fontSize: '10px', opacity: 0.6, marginTop: '4px' },
  inputRow: { display: 'flex', gap: '8px', padding: '12px', borderTop: '1px solid #2a2a2a' },
  input: { flex: 1, padding: '10px', background: '#2a2a2a', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '13px' },
  sendBtn: { padding: '10px 14px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }
}