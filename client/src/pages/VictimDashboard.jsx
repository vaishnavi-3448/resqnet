import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import useSocket from '../hooks/useSocket'
import { geocodeAddress } from '../utils/geocode'

const API = 'http://localhost:5000/api'

const VictimDashboard = () => {
  const { user, logout } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState(null)
  const [formData, setFormData] = useState({
    type: 'food',
    description: '',
    address: '',
    coordinates: [80.2707, 13.0827],
    priority: 'medium',
    peopleCount: 1
  })

  const fetchMyRequests = async () => {
    try {
      const res = await axios.get(`${API}/requests/my`, { withCredentials: true })
      setRequests(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyRequests()
  }, [])

  useSocket(
    (data) => {
      setNotification(data.message)
      fetchMyRequests()
      setTimeout(() => setNotification(null), 5000)
    },
    (data) => {
      setNotification(data.message)
      fetchMyRequests()
      setTimeout(() => setNotification(null), 5000)
    }
  )

  const handleSubmit = async (e) => {
  e.preventDefault()
  setSubmitting(true)
  try {
    let coordinates = [80.2707, 13.0827] // default Chennai

    if (formData.address) {
      const geo = await geocodeAddress(formData.address)
      if (geo) {
        coordinates = [geo.lng, geo.lat] // [longitude, latitude]
      }
    }

    await axios.post(`${API}/requests`, {
      ...formData,
      coordinates
    }, { withCredentials: true })

    setShowForm(false)
    fetchMyRequests()
    setFormData({
      type: 'food',
      description: '',
      address: '',
      coordinates: [80.2707, 13.0827],
      priority: 'medium',
      peopleCount: 1
    })
  } catch (err) {
    console.error(err)
  } finally {
    setSubmitting(false)
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

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
          <span>🔔</span>
          <p className="font-medium">{notification}</p>
          <button onClick={() => setNotification(null)} className="ml-2 text-white/70 hover:text-white">✕</button>
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-black text-red-500">ResQNet</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">👤 {user.name}</span>
          <button
            onClick={logout}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">My Requests</h2>
            <p className="text-gray-400 mt-1">Track your relief requests here</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg transition"
          >
            {showForm ? 'Cancel' : '+ New Request'}
          </button>
        </div>

        {/* New Request Form */}
        {showForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
            <h3 className="text-xl font-bold mb-5">Post a Relief Request</h3>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Type of Help</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                  >
                    <option value="food">🍱 Food</option>
                    <option value="water">💧 Water</option>
                    <option value="medical">🏥 Medical</option>
                    <option value="shelter">🏠 Shelter</option>
                    <option value="rescue">🚁 Rescue</option>
                    <option value="other">📦 Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">🔴 Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  placeholder="Describe what you need and your situation..."
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 placeholder-gray-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Your location"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-red-500 placeholder-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Number of People</label>
                  <input
                    type="number"
                    value={formData.peopleCount}
                    onChange={(e) => setFormData({ ...formData, peopleCount: parseInt(e.target.value) })}
                    min={1}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-semibold py-3 rounded-lg transition"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        )}

        {/* Requests List */}
        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🆘</p>
            <p className="text-gray-400 text-lg">No requests yet</p>
            <p className="text-gray-600 text-sm mt-1">Click "New Request" to post your first relief request</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req._id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {req.type === 'food' ? '🍱' : req.type === 'water' ? '💧' : req.type === 'medical' ? '🏥' : req.type === 'shelter' ? '🏠' : req.type === 'rescue' ? '🚁' : '📦'}
                    </span>
                    <div>
                      <h3 className="font-semibold text-lg capitalize">{req.type} Request</h3>
                      <p className="text-gray-400 text-sm">{req.location.address || 'No address provided'}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-3 py-1 rounded-full border ${statusColor[req.status]}`}>
                    {req.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-gray-300 mt-3 text-sm">{req.description}</p>

                <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                  <span className={`font-semibold ${priorityColor[req.priority]}`}>
                    ⚡ {req.priority.toUpperCase()}
                  </span>
                  <span>👥 {req.peopleCount} people</span>
                  <span>🕐 {new Date(req.createdAt).toLocaleDateString()}</span>
                </div>

                {req.claimedBy && (
                  <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3">
                    <p className="text-blue-400 text-sm">
                      ✅ Being helped by <span className="font-semibold">{req.claimedBy.name}</span> ({req.claimedBy.phone})
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default VictimDashboard