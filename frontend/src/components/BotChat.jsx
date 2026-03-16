import { useState, useEffect } from 'react'
import API from '../api'

const quickQuestions = [
  'How do credits work?',
  'How do I win an auction?',
  'What is Bid Shield?',
  'How do I place a bid?'
]

export default function BotChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I am the GavelX Assistant. Ask me anything about auctions, credits, or bidding!' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingSend, setPendingSend] = useState(false)

  useEffect(() => {
    if (pendingSend && input) {
      sendMessage()
      setPendingSend(false)
    }
  }, [input, pendingSend])

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setMessages(prev => [...prev, { role: 'bot', text: 'Please login to use the assistant!' }])
        setLoading(false)
        return
      }
      const res = await API.post('/bot/ask', { message: userMsg })
      setMessages(prev => [...prev, { role: 'bot', text: res.data.reply }])
    } catch (err) {
      console.error('Bot error:', err)
      const errorMsg = err.response?.data?.detail || 'Sorry I am having trouble right now. Please try again!'
      setMessages(prev => [...prev, { role: 'bot', text: errorMsg }])
    }
    setLoading(false)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') sendMessage()
  }

  const handleQuickQuestion = (q) => {
    setInput(q)
    setPendingSend(true)
  }

  return (
    <div>
      <button onClick={() => setOpen(!open)} style={styles.floatBtn}>
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div style={styles.chatWindow}>
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.avatar}>G</div>
              <div>
                <div style={styles.botName}>GavelX Assistant</div>
                <div style={styles.botStatus}>Online</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={styles.closeBtn}>✕</button>
          </div>

          <div style={styles.messages}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                ...styles.msgRow,
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  ...styles.bubble,
                  background: msg.role === 'user' ? '#f59e0b' : '#2a2a2a',
                  color: msg.role === 'user' ? '#000' : '#fff',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={styles.msgRow}>
                <div style={{...styles.bubble, background: '#2a2a2a', color: '#888'}}>
                  Thinking...
                </div>
              </div>
            )}
          </div>

          {messages.length === 1 && (
            <div style={styles.quickContainer}>
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  style={styles.quickBtn}
                  onClick={() => handleQuickQuestion(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div style={styles.inputRow}>
            <input
              style={styles.input}
              placeholder="Ask me anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button
              style={{
                ...styles.sendBtn,
                opacity: loading ? 0.6 : 1
              }}
              onClick={sendMessage}
              disabled={loading}
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
  floatBtn: { position: 'fixed', bottom: '24px', right: '24px', width: '56px', height: '56px', borderRadius: '50%', background: '#f59e0b', border: 'none', fontSize: '24px', cursor: 'pointer', zIndex: 1000 },
  chatWindow: { position: 'fixed', bottom: '92px', right: '24px', width: '340px', height: '480px', background: '#1a1a1a', borderRadius: '16px', border: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column', zIndex: 1000, overflow: 'hidden' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#111', borderBottom: '1px solid #2a2a2a' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', background: '#f59e0b', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' },
  botName: { color: '#fff', fontWeight: 'bold', fontSize: '14px' },
  botStatus: { color: '#22c55e', fontSize: '11px' },
  closeBtn: { background: 'transparent', border: 'none', color: '#888', fontSize: '16px', cursor: 'pointer' },
  messages: { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  msgRow: { display: 'flex' },
  bubble: { maxWidth: '80%', padding: '10px 14px', fontSize: '13px', lineHeight: '1.5' },
  quickContainer: { padding: '8px 16px', display: 'flex', flexWrap: 'wrap', gap: '6px' },
  quickBtn: { background: '#2a2a2a', color: '#f59e0b', border: '1px solid #f59e0b', borderRadius: '12px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' },
  inputRow: { display: 'flex', gap: '8px', padding: '12px', borderTop: '1px solid #2a2a2a' },
  input: { flex: 1, padding: '10px', background: '#2a2a2a', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '13px' },
  sendBtn: { padding: '10px 16px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }
}