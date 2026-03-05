import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'

const useSocket = (onRequestClaimed, onRequestResolved) => {
  const { user } = useAuth()
  const socketRef = useRef(null)

  useEffect(() => {
    if (!user) return

    socketRef.current = io('http://localhost:5000', {
      withCredentials: true
    })

    socketRef.current.on('connect', () => {
      socketRef.current.emit('join', user._id)
    })

    socketRef.current.on('requestClaimed', (data) => {
      if (onRequestClaimed) onRequestClaimed(data)
    })

    socketRef.current.on('requestResolved', (data) => {
      if (onRequestResolved) onRequestResolved(data)
    })

    return () => {
      socketRef.current.disconnect()
    }
  }, [user])

  return socketRef.current
}

export default useSocket