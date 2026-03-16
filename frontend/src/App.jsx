import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AuctionDetail from './pages/AuctionDetail'
import AdminPanel from './pages/AdminPanel'
import Landing from './pages/Landing'
import Profile from './pages/Profile'
import BotChat from './components/BotChat'
import LiveChat from './components/LiveChat'

function App() {
  const token = localStorage.getItem('token')
  const isAdmin = localStorage.getItem('is_admin') === 'true'
  const userId = localStorage.getItem('user_id')

  return (
    <>
      <Routes>
        <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/auction/:id" element={<AuctionDetail />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      {token && <BotChat />}
      {token && !isAdmin && userId && <LiveChat key={userId} />}
    </>
  )
}

export default App