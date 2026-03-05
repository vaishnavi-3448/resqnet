import { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

const API = 'http://localhost:5000/api'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in on app load
  useEffect(() => {
    const getMe = async () => {
      try {
        const res = await axios.get(`${API}/auth/me`, { withCredentials: true })
        setUser(res.data)
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    getMe()
  }, [])

  const login = async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, { email, password }, { withCredentials: true })
    setUser(res.data)
    return res.data
  }

  const register = async (name, email, password, role, phone) => {
    const res = await axios.post(`${API}/auth/register`, { name, email, password, role, phone }, { withCredentials: true })
    setUser(res.data)
    return res.data
  }

  const logout = async () => {
    await axios.post(`${API}/auth/logout`, {}, { withCredentials: true })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)