import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Pages (we'll create these next)
import Login from './pages/Login'
import Register from './pages/Register'
import VictimDashboard from './pages/VictimDashboard'
import VolunteerDashboard from './pages/VolunteerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Unauthorized from './pages/Unauthorized'

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          {user?.role === 'victim' && <VictimDashboard />}
          {user?.role === 'volunteer' && <VolunteerDashboard />}
          {user?.role === 'ngo' && <VolunteerDashboard />}
          {user?.role === 'admin' && <AdminDashboard />}
        </ProtectedRoute>
      } />

      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}

export default App