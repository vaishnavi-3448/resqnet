import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API = 'http://localhost:5000/api'

const VolunteerDashboard = () => {
  const { user, logout } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [claiming, setClaiming] = useState(null)

  const fetchRequests = async () => {
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
    fetchRequests()
  }, [])

  const handleClaim = async (id) => {
    setClaiming(id)
    try {
      await axios.put(`${API}/requests/${id}/claim`, {}, { withCredentials: true })
      fetchRequests()
    } catch (err) {
      console.error(err)
    } finally {
      setClaiming(null)
    }
  }

  const handleResolve = async (id) => {
    try {
      await axios.put(`${API}/requests/${id}/resolve`, {}, { withCredentials: true })
      fetchRequests()
    } catch (err) {
      console.error(err)
    }
  }

  const priorityColor = {
    low: 'text-green-400',
    medium: 'text-yellow-400',
    high: 'text-orange-400',
    critical: 'text-red-400'
  }

  const priorityBorder = {
    low: 'border-l-green-500',
    medium: 'border-l-yellow-500',
    high: 'border-l-orange-500',
    critical: 'border-l-red-500'
  }

  const typeEmoji = {
    food: '🍱',
    water: '💧',
    medical: '🏥',
    shelter: '🏠',
    rescue: '🚁',
    other: '📦'
  }

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true
    return req.type === filter
  })

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-black text-red-500">ResQNet</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">🙋 {user.name}</span>
          <button onClick={logout} className="text-sm text-gray-400 hover:text-white transition">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Pending Requests</h2>
          <p className="text-gray-400 mt-1">Help people in need near you</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Pending', value: requests.length, color: 'text-white' },
            { label: 'Critical', value: requests.filter(r => r.priority === 'critical').length, color: 'text-red-400' },
            { label: 'Medical', value: requests.filter(r => r.type === 'medical').length, color: 'text-blue-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'food', 'water', 'medical', 'shelter', 'rescue', 'other'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                filter === f
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {f === 'all' ? 'All' : `${typeEmoji[f]} ${f}`}
            </button>
          ))}
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">✅</p>
            <p className="text-gray-400 text-lg">No pending requests</p>
            <p className="text-gray-600 text-sm mt-1">Check back later</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((req) => (
              <div
                key={req._id}
                className={`bg-gray-900 border border-gray-800 border-l-4 ${priorityBorder[req.priority]} rounded-2xl p-6`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{typeEmoji[req.type]}</span>
                    <div>
                      <h3 className="font-semibold text-lg capitalize">{req.type} Request</h3>
                      <p className="text-gray-400 text-sm">{req.location.address || 'No address'}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold ${priorityColor[req.priority]}`}>
                    ⚡ {req.priority.toUpperCase()}
                  </span>
                </div>

                <p className="text-gray-300 mt-3 text-sm">{req.description}</p>

                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span>👤 {req.victim?.name}</span>
                  <span>📞 {req.victim?.phone || 'No phone'}</span>
                  <span>👥 {req.peopleCount} people</span>
                  <span>🕐 {new Date(req.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleClaim(req._id)}
                    disabled={claiming === req._id}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
                  >
                    {claiming === req._id ? 'Claiming...' : '✋ Claim Request'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default VolunteerDashboard