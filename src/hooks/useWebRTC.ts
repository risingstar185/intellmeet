import { useCallback, useEffect, useRef, useState } from 'react'
import Peer from 'simple-peer'
import { Socket } from 'socket.io-client'
import api from '../config/api'

export interface PeerEntry {
  socketId: string
  userId: string
  userName: string
  peer: Peer.Instance
  stream?: MediaStream
  connectionState: 'connecting' | 'connected' | 'failed'
  isInitiator: boolean
}
interface OfferPayload {
  from: string
  offer: Peer.SignalData
}
export interface UseWebRTCReturn {
  localStream: MediaStream | null
  peers: PeerEntry[]
  initLocalStream: () => Promise<MediaStream | null>
  destroyAll: () => void
  retryPeerConnection: (socketId: string) => void
}

/**
 * useWebRTC — manages simple-peer instances and local media stream with TURN support.
 */
export function useWebRTC(
  socket: Socket,
  roomId: string,
  userId: string,
  userName: string
): UseWebRTCReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [peers, setPeers] = useState<PeerEntry[]>([])

  const localStreamRef = useRef<MediaStream | null>(null)
  const peersRef = useRef<Map<string, PeerEntry>>(new Map())
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // Dynamic ICE/TURN configuration (defaults to Google STUN fallback)
  const iceServersRef = useRef<RTCIceServer[]>([
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ])

  // Fetch TURN credentials from backend on hook mount
  useEffect(() => {
    api.get('/webrtc/turn-credentials')
      .then(res => {
        if (res.data && res.data.iceServers) {
          iceServersRef.current = res.data.iceServers
          console.log('[WebRTC] Dynamically loaded ICE servers config (STUN/TURN)');
        }
      })
      .catch(err => {
        console.warn('[WebRTC] Failed to fetch TURN credentials, using fallback STUN:', err.message)
      })
  }, [])

  // Helper to update peer state attributes
  const updatePeerState = useCallback((socketId: string, updates: Partial<PeerEntry>) => {
    const entry = peersRef.current.get(socketId)
    if (entry) {
      const updated = { ...entry, ...updates }
      peersRef.current.set(socketId, updated)
      setPeers(Array.from(peersRef.current.values()))
    }
  }, [])

  // ─── Acquire local media ────────────────────────────────────────────────────
  const initLocalStream = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      })

  //    console.log("✅ LOCAL STREAM CREATED", stream)
  //  console.log("VIDEO TRACKS", stream.getVideoTracks())
   // console.log("AUDIO TRACKS", stream.getAudioTracks())
      localStreamRef.current = stream
      setLocalStream(stream)
      return stream
    } catch (err) {
      console.warn('[WebRTC] Could not get local stream (permission denied or no device):', err)
      return null
    }
  }, [])

  // ─── Create a new peer ──────────────────────────────────────────────────────
  const createPeer = useCallback(
    (
      remoteSocketId: string,
      remoteUserId: string,
      remoteUserName: string,
      initiator: boolean,
      stream: MediaStream | null
    ): Peer.Instance => {
      // Clear any existing connection timeout for this peer first
      if (timeoutsRef.current.has(remoteSocketId)) {
        clearTimeout(timeoutsRef.current.get(remoteSocketId))
        timeoutsRef.current.delete(remoteSocketId)
      }

      const peerOptions: Peer.Options = {
        initiator,
        trickle: true,
        config: {
          iceServers: iceServersRef.current,
        },
      }

      if (stream) {
        peerOptions.stream = stream
      }

      const peer = new Peer(peerOptions)

      // Set connection monitoring timeout (15 seconds)
      const connTimeout = setTimeout(() => {
        const currentPeer = peersRef.current.get(remoteSocketId)
        if (currentPeer && currentPeer.connectionState === 'connecting') {
          console.warn(`[WebRTC] Connection timeout to peer ${remoteUserName} (${remoteSocketId})`);
          updatePeerState(remoteSocketId, { connectionState: 'failed' })
          // Trigger self-healing auto-retry in 5 seconds
          setTimeout(() => {
            const recheck = peersRef.current.get(remoteSocketId)
            if (recheck && recheck.connectionState === 'failed') {
              retryPeerConnection(remoteSocketId)
            }
          }, 5000)
        }
      }, 15000)

      timeoutsRef.current.set(remoteSocketId, connTimeout)

      peer.on('signal', (signalData) => {
        if (signalData.type === 'offer') {
          socket.emit('webrtc-offer', { to: remoteSocketId, offer: signalData })
        } else if (signalData.type === 'answer') {
          socket.emit('webrtc-answer', { to: remoteSocketId, answer: signalData })
        } else {
          socket.emit('ice-candidate', { to: remoteSocketId, candidate: signalData })
        }
      })
      peer.on("signal",(data)=>{
    console.log("SIGNAL",data)
})

      peer.on('connect', () => {
        console.log(`[WebRTC] Connected successfully to peer ${remoteUserName}`)
        const timeout = timeoutsRef.current.get(remoteSocketId)
        if (timeout) clearTimeout(timeout)
        updatePeerState(remoteSocketId, { connectionState: 'connected' })
      })

      peer.on('stream', (remoteStream) => {
        console.log("REMOTE STREAM RECEIVED", remoteUserName)
        updatePeerState(remoteSocketId, { stream: remoteStream })
      })

      peer.on('error', (err) => {
        console.error(`[WebRTC] Peer connection error with ${remoteUserName}:`, err)
        const timeout = timeoutsRef.current.get(remoteSocketId)
        if (timeout) clearTimeout(timeout)
        updatePeerState(remoteSocketId, { connectionState: 'failed' })

        // Trigger self-healing auto-retry in 5 seconds
        setTimeout(() => {
          const recheck = peersRef.current.get(remoteSocketId)
          if (recheck && recheck.connectionState === 'failed') {
            retryPeerConnection(remoteSocketId)
          }
        }, 5000)
      })

      peer.on('close', () => {
        const timeout = timeoutsRef.current.get(remoteSocketId)
        if (timeout) clearTimeout(timeout)
        removePeer(remoteSocketId)
      })

      const entry: PeerEntry = {
        socketId: remoteSocketId,
        userId: remoteUserId,
        userName: remoteUserName,
        peer,
        connectionState: 'connecting',
        isInitiator: initiator,
      }

      peersRef.current.set(remoteSocketId, entry)
      setPeers(Array.from(peersRef.current.values()))

      return peer
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [socket, updatePeerState]
  )

  // ─── Retry Peer Connection (Self-Healing) ──────────────────────────────────
  const retryPeerConnection = useCallback((socketId: string) => {
    const entry = peersRef.current.get(socketId)
    if (!entry) return

    console.log(`[WebRTC] Attempting to reconnect/retry peer connection with ${entry.userName}`)
    
    // Destroy previous peer instance to release resources
    try {
      entry.peer.destroy()
    } catch (_) {}

    // Re-create the peer using the same initiator flag it had originally
    createPeer(entry.socketId, entry.userId, entry.userName, entry.isInitiator, localStreamRef.current)
  }, [createPeer])

  const removePeer = (socketId: string) => {
    const entry = peersRef.current.get(socketId)
    if (entry) {
      try { entry.peer.destroy() } catch (_) { /* ignore */ }
      peersRef.current.delete(socketId)
      setPeers(Array.from(peersRef.current.values()))
    }
  }

  // ─── Destroy everything ─────────────────────────────────────────────────────
  const destroyAll = useCallback(() => {
    peersRef.current.forEach((entry) => {
      try { entry.peer.destroy() } catch (_) { /* ignore */ }
    })
    peersRef.current.clear()
    setPeers([])

    // Clear all timeouts
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout))
    timeoutsRef.current.clear()

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop())
      localStreamRef.current = null
      setLocalStream(null)
    }
  }, [])

  // ─── Socket event listeners ─────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !roomId) return

    const handleRoomParticipants = (participants: Array<{ socketId: string; userId: string; userName: string }>) => {
      participants.forEach(({ socketId, userId: uid, userName: uname }) => {
        if (!peersRef.current.has(socketId)) {
          createPeer(socketId, uid, uname, true, localStreamRef.current)
        }
      })
    }

    const handleUserConnected = ({ socketId, userId: uid, userName: uname }: { socketId: string; userId: string; userName: string }) => {
      if (!peersRef.current.has(socketId)) {
        createPeer(socketId, uid, uname, false, localStreamRef.current)
      }
    }

    const handleUserDisconnected = ({ socketId }: { socketId: string }) => {
      removePeer(socketId)
    }

  const handleOffer = ({ from, offer }: OfferPayload) => {
 //console.log("OFFER RECEIVED", from);

    let existing = peersRef.current.get(from);

    if (!existing) {

      //  console.log("Creating peer from incoming offer");

        const peer = createPeer(
            from,
            "",
            "Remote User",
            false,
            localStreamRef.current
        );

        peer.signal(offer);

        return;
    }

    existing.peer.signal(offer);
}

    const handleAnswer = ({ from, answer }: { from: string; answer: Peer.SignalData }) => {
     //  console.log("ANSWER RECEIVED", from)
      const existing = peersRef.current.get(from)
      if (existing) {
        existing.peer.signal(answer)
      }
    }

    const handleIceCandidate = ({ from, candidate }: { from: string; candidate: Peer.SignalData }) => {
     //   console.log("ICE RECEIVED", from)
      const existing = peersRef.current.get(from)
      if (existing) {
        try {
          existing.peer.signal(candidate)
        } catch (_) { /* ignore out-of-order candidates */ }
      }
    }

    socket.on('room-participants', handleRoomParticipants)
    socket.on('user-connected', handleUserConnected)
    socket.on('user-disconnected', handleUserDisconnected)
    socket.on('webrtc-offer', handleOffer)
    socket.on('webrtc-answer', handleAnswer)
    socket.on('ice-candidate', handleIceCandidate)

    return () => {
      socket.off('room-participants', handleRoomParticipants)
      socket.off('user-connected', handleUserConnected)
      socket.off('user-disconnected', handleUserDisconnected)
      socket.off('webrtc-offer', handleOffer)
      socket.off('webrtc-answer', handleAnswer)
      socket.off('ice-candidate', handleIceCandidate)
    }
  }, [socket, roomId, createPeer])

  return { localStream, peers, initLocalStream, destroyAll, retryPeerConnection }
}
