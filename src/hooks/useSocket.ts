import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Socket } from 'socket.io-client'
import { getSocket } from '../config/socket'
import { toast } from 'react-hot-toast'

export interface UseSocketReturn {
  socket: Socket
  isConnected: boolean
}

/**
 * useSocket — manages the Socket.io connection lifecycle and global toast alerts.
 */
export function useSocket(): UseSocketReturn {
  const socket = useRef<Socket>(getSocket())
  const [isConnected, setIsConnected] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const s = socket.current
    const token = localStorage.getItem('token')
console.log("Socket Token:", token);
    // Attach JWT to auth handshake configuration
    s.auth = { token }

    // Connect if not already connected
    if (!s.connected) {
      s.connect()
    }

    const handleConnect = () => {
      setIsConnected(true)
      console.log('[Socket] Connected:', s.id)
    }

    const handleDisconnect = (reason: string) => {
      setIsConnected(false)
      console.log('[Socket] Disconnected:', reason)
    }

    const handleConnectError = (err: Error) => {
      console.error('[Socket] Connection error:', err.message)
      setIsConnected(false)
    }

    // Register connection lifecycle listeners
    s.on('connect', handleConnect)
    s.on('disconnect', handleDisconnect)
    s.on('connect_error', handleConnectError)

    // Register global toast notifications from backend socket events
    const handleUserJoined = (data: any) => {
      const name = typeof data === 'string' ? data : data?.name || data?.userName || 'A user'
      toast(`👤 ${name} joined the meeting`, {
        icon: '👤',
        style: { background: '#1E293B', color: '#F8FAFC', borderRadius: '12px' }
      })
    }

    const handleUserLeft = (data: any) => {
      const name = typeof data === 'string' ? data : data?.name || data?.userName || 'A user'
      toast(`${name} left the meeting`, {
        icon: '🚪',
        style: { background: '#1E293B', color: '#F8FAFC', borderRadius: '12px' }
      })
    }

    const handleMeetingStarted = () => {
      toast.success('Meeting has started', {
        style: { borderRadius: '12px' }
      })
    }

    const handleAISummaryReady = (data: any) => {
      const meetingId = data?.meetingId || data?.id || '1'
      toast.success(
        (t) => React.createElement(
          'div',
          {
            onClick: () => {
              toast.dismiss(t.id)
              navigate(`/post-meeting/${meetingId}`)
            },
            className: "flex flex-col text-left cursor-pointer"
          },
          React.createElement('span', { className: "font-bold text-slate-800" }, "✅ AI Summary is ready!"),
          React.createElement('span', { className: "text-[10px] text-slate-400 mt-0.5" }, "Click here to view the summary & action items.")
        ),
        { duration: 7000, style: { borderRadius: '12px', border: '1px solid #7C3AED' } }
      )
    }

    const handleTaskCreated = () => {
      toast.success('Task added to your board', {
        style: { borderRadius: '12px' }
      })
    }

    s.on('user-joined', handleUserJoined)
    s.on('user-left', handleUserLeft)
    s.on('meeting-started', handleMeetingStarted)
    s.on('ai-summary-ready', handleAISummaryReady)
    s.on('task-created', handleTaskCreated)

    // Sync initial state in case already connected
    if (s.connected) setIsConnected(true)

    return () => {
      // Remove connection event listeners
      s.off('connect', handleConnect)
      s.off('disconnect', handleDisconnect)
      s.off('connect_error', handleConnectError)

      // Remove global notification listeners
      s.off('user-joined', handleUserJoined)
      s.off('user-left', handleUserLeft)
      s.off('meeting-started', handleMeetingStarted)
      s.off('ai-summary-ready', handleAISummaryReady)
      s.off('task-created', handleTaskCreated)
    }
  }, [navigate])

  return { socket: socket.current, isConnected }
}

export default useSocket
