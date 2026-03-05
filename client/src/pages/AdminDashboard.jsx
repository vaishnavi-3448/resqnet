import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API = 'http://localhost:5000/api'

const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchAllRequests = async () => {
    try {
      const res = await axios.get(`${API}/requests`, { withCredentials: true })
      setRequests(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllRequests()
  }, [])

  const handleResolve = async (id) => {
    try {
      await axios.put(`${API}/requests/${id}/resolve`, {}, { withCredentials: true })
      fetchAllRequests()
    } catch (err) {
      console.error(err)
    }
  }

  const statusColor = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    claimed: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    resolved: 'bg-green-500/10 text-green-400 border-green-500/30',
    cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/30'
  }

  const priorityColor = {
    low: 'text-green-400',
    medium: 'text-yellow-400',
    high: 'text-orange-400',
    critical: 'text-red-400'
  }

  const typeEmoji = {
    food: '🍱', water: '💧', medical: '🏥',
    shelter: '🏠', rescue: '🚁', other: '📦'
  }

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true
    return req.status === filter
  })

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    claimed: requests.filter(r => r.status === 'claimed').length,
    resolved: requests.filter(r => r.status === 'resolved').length,
    critical: requests.filter(r => r.priority === 'critical').length,
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-black text-red-500">ResQNet</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">🛡️ {user.name} (Admin)</span>
          <button onClick={logout} className="text-sm text-gray-400 hover:text-white transition">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Admin Dashboard</h2>
          <p className="text-gray-400 mt-1">Overview of all relief operations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'text-white' },
            { label: 'Pending', value: stats.pending, color: 'text-yellow-400' },
            { label: 'Claimed', value: stats.claimed, color: 'text-blue-400' },
            { label: 'Resolved', value: stats.resolved, color: 'text-green-400' },
            { label: 'Critical', value: stats.critical, color: 'text-red-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filter by status */}
        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'claimed', 'resolved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition capitalize ${
                filter === f
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Requests Table */}
        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No requests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((req) => (
              <div key={req._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{typeEmoji[req.type]}</span>
                    <div>
                      <h3 className="font-semibold text-lg capitalize">{req.type} Request</h3>
                      <p className="text-gray-400 text-sm">{req.location.address || 'No address'}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full border ${statusColor[req.status]}`}>
                    {req.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-gray-300 mt-3 text-sm">{req.description}</p>

                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span className={`font-semibold ${priorityColor[req.priority]}`}>
                    ⚡ {req.priority.toUpperCase()}
                  </span>
                  <span>👤 Victim: {req.victim?.name}</span>
                  <span>📞 {req.victim?.phone || 'No phone'}</span>
                  <span>👥 {req.peopleCount} people</span>
                  <span>🕐 {new Date(req.createdAt).toLocaleDateString()}</span>
                </div>

                {req.claimedBy && (
                  <div className="mt-3 text-xs text-blue-400">
                    ✅ Claimed by: <span className="font-semibold">{req.claimedBy.name}</span>
                  </div>
                )}

                {req.status === 'claimed' && (
                  <button
                    onClick={() => handleResolve(req._id)}
                    className="mt-4 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
                  >
                    ✅ Mark Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard