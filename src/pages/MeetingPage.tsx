import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Mic, MicOff, Video, VideoOff, Monitor, Hand, Circle,
  PhoneOff, Bot, Send, Users, Wifi, WifiOff, MoreVertical,
  MessageSquare, UserCircle2, Link, X
} from 'lucide-react'
import { useSocket } from '../hooks/useSocket'
import { useWebRTC } from '../hooks/useWebRTC'
import ConnectionStatusAlert from '../components/ConnectionStatusAlert'
import PCMRecorder from "../utils/mediaRecorder";
import api from '../config/api'
// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: string
  senderId?: string
  senderName: string
  text: string
  time: string
  isAI: boolean
  isLocal?: boolean
}

interface Participant {
  socketId: string
  userId: string
  userName: string
  joinedAt?: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useTimer() {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0')
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

function getColorFromName(name: string): string {
  const colors = ['#06B6D4', '#F59E0B', '#10B981', '#EF4444', '#7C3AED', '#EC4899', '#3B82F6', '#F97316']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

/** Small component that attaches a MediaStream to a <video> element */
function RemoteVideo({ stream, userName, color }: { stream: MediaStream; userName: string; color: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])
  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={false}
      className="w-full h-full object-cover rounded-xl"
      style={{ background: '#0D1117' }}
      aria-label={`${userName}'s video`}
    />
  )
}

/** Local video tile — always muted to avoid echo */
function LocalVideo({ stream, videoRef }: { stream: MediaStream; videoRef: React.RefObject<HTMLVideoElement | null> }) {
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream, videoRef])
  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="w-full h-full object-cover rounded-xl"
      style={{ background: '#0D1117', transform: 'scaleX(-1)' }}
      aria-label="Your video"
    />
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MeetingPage() {
  const navigate = useNavigate()
  const { id: roomId = '1' } = useParams()

  // Pull user from localStorage (set by auth flow)
  const rawUser = localStorage.getItem('user')
  const authUser = rawUser ? JSON.parse(rawUser) : null
 // const userId = authUser?._id || authUser?.id || `guest-${Math.random().toString(36).slice(2, 8)}`
 const userId = localStorage.getItem("userId");

if (!userId) {
  console.error("User ID not found. Please login again.");
  return;
}
  const userName = authUser?.name || authUser?.username || 'Host User'
  const userColor = getColorFromName(userName)
  const userInitials = getInitials(userName)

  // ─── Hooks ────────────────────────────────────────────────────────────────
  const { socket, isConnected } = useSocket()
  const { localStream, peers, initLocalStream, destroyAll, retryPeerConnection } = useWebRTC(socket, roomId, userId, userName)

  // ─── Local state ──────────────────────────────────────────────────────────
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [sharing, setSharing] = useState(false)
  const [handRaised, setHandRaised] = useState(false)
  const [recording, setRecording] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [participants, setParticipants] = useState<Participant[]>([])
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({}) // socketId → userName
  const [hasJoined, setHasJoined] = useState(false)
  const [streamError, setStreamError] = useState(false)
  const [showInviteToast, setShowInviteToast] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const localVideoRef = useRef<HTMLVideoElement | null>(null)
  const screenTrackRef = useRef<MediaStreamTrack | null>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timer = useTimer()

  const handleInviteCopy = useCallback(() => {
    navigator.clipboard.writeText(`${window.location.origin}/meeting/${roomId}`)
      .then(() => {
        setShowInviteToast(true)
        setTimeout(() => setShowInviteToast(false), 3000)
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err)
      })
  }, [roomId])

  const handleShareScreen = async () => {
    try {
      if (sharing) {
        // Stop sharing - revert to camera
        const tracks = localStream?.getTracks()
        tracks?.forEach(track => {
          if (track.kind === 'video') track.stop()
        })
        const newStream = await initLocalStream()
        const cameraTrack = newStream?.getVideoTracks()[0]
        const screenTrack = screenTrackRef.current
        
        if (cameraTrack && screenTrack && newStream) {
          peers.forEach(p => {
            try {
              p.peer.replaceTrack(screenTrack, cameraTrack, newStream)
            } catch (e) {
              console.error('Error restoring camera track for peer:', p.userName, e)
            }
          })
        }
        
        screenTrackRef.current = null
        setSharing(false)
      } else {
        // Start screen share
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        })
        const screenTrack = screenStream.getVideoTracks()[0]
        screenTrackRef.current = screenTrack
        
        // Replace video track in all peer connections
        const oldTrack = localStream?.getVideoTracks()[0]
        if (oldTrack && screenTrack) {
          peers.forEach(p => {
            try {
              p.peer.replaceTrack(oldTrack, screenTrack, localStream!)
            } catch (e) {
              console.error('Error replacing track for peer:', p.userName, e)
            }
          })
        }

        if (localVideoRef?.current) {
          localVideoRef.current.srcObject = screenStream
        }
        
        screenTrack.onended = async () => {
          setSharing(false)
          const newStream = await initLocalStream()
          const cameraTrack = newStream?.getVideoTracks()[0]
          if (cameraTrack && newStream) {
            peers.forEach(p => {
              try {
                p.peer.replaceTrack(screenTrack, cameraTrack, newStream)
              } catch (e) {
                console.error('Error restoring camera track for peer:', p.userName, e)
              }
            })
          }
          screenTrackRef.current = null
        }
        
        setSharing(true)
      }
    } catch (err) {
      console.error('Screen share error:', err)
      setSharing(false)
    }
  }

  // ─── Scroll chat ──────────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUsers])
const recorderRef = useRef<PCMRecorder | null>(null);
  // ─── Join room once socket connects ───────────────────────────────────────
 useEffect(() => {
  //  console.log("isConnected =", isConnected)
   // console.log("hasJoined =", hasJoined)
  if (!isConnected || hasJoined) return
      

  const start = async () => {
      console.log("START CALLED")

const stream = await initLocalStream();

//changes here
        console.log("STREAM RETURNED", stream)
    if (!stream) {
         
      setStreamError(true)
    }

  if (stream) {
   
        recorderRef.current = new PCMRecorder(
            socket,
            roomId,
            stream
        );


//console.log("EMITTING START", roomId);
//console.log(socket.connected);
//console.log(socket.id);
       socket.emit("start-transcription", 
        {
        
    roomId,
});
console.log("EMITTING START", roomId);

    console.log("7");
// Deepgram ko connect hone ka time do
//await new Promise(resolve => setTimeout(resolve, 1000));

   // console.log("START TRANSCRIPTION EVENT");
    //console.log("ROOM ID:", roomId);
      if (!roomId) return;

        await recorderRef.current.start();
    }
    socket.emit("join-room", {
      roomId,
      userId: localStorage.getItem("userId"),
      userName: localStorage.getItem("userName"),
    })

    setHasJoined(true)
  }
  start()
// Greet in chat
    const joinMsg: Message = {
      id: `system-${Date.now()}`,
      senderName: 'System',
      text: `You joined the meeting room ${roomId}`,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      isAI: true,
    }
    setMessages([joinMsg])
  }, [isConnected, hasJoined, socket, roomId, userId, userName, initLocalStream])

  // ─── Socket event listeners ───────────────────────────────────────────────
  useEffect(() => {
    // Participant presence
    const handlePresence = (list: Participant[]) => {
      // Filter out ourselves from the displayed list
      setParticipants(list.filter(p => p.socketId !== socket.id))
    }

    // Chat messages
    const handleReceiveMessage = (msg: Message) => {
      setMessages(prev => {
        // Deduplicate: ignore if we already have a local echo
        if (prev.some(m => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    }

    // Someone joined
    const handleUserConnected = ({ socketId, userName: uname }: { socketId: string; userName: string }) => {
      const joinedMsg: Message = {
        id: `join-${socketId}-${Date.now()}`,
        senderName: 'System',
        text: `${uname} joined the meeting`,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        isAI: true,
      }
      setMessages(prev => [...prev, joinedMsg])
    }

    // Someone left
    const handleUserDisconnected = ({ socketId, userName: uname }: { socketId: string; userName: string }) => {
      const leftMsg: Message = {
        id: `leave-${socketId}-${Date.now()}`,
        senderName: 'System',
        text: `${uname || 'A participant'} left the meeting`,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        isAI: true,
      }
      setMessages(prev => [...prev, leftMsg])
      // Remove from typing indicators
      setTypingUsers(prev => {
        const next = { ...prev }
        delete next[socketId]
        return next
      })
    }

    // Typing indicators
    const handleTypingStart = ({ socketId, userName: uname }: { socketId: string; userName: string }) => {
      setTypingUsers(prev => ({ ...prev, [socketId]: uname }))
    }

    const handleTypingStop = ({ socketId }: { socketId: string }) => {
      setTypingUsers(prev => {
        const next = { ...prev }
        delete next[socketId]
        return next
      })
    }

    socket.on('participant-presence', handlePresence)
    socket.on('receive-message', handleReceiveMessage)
    socket.on('user-connected', handleUserConnected)
    socket.on('user-disconnected', handleUserDisconnected)
    socket.on('typing-start', handleTypingStart)
    socket.on('typing-stop', handleTypingStop)

    return () => {
      socket.off('participant-presence', handlePresence)
      socket.off('receive-message', handleReceiveMessage)
      socket.off('user-connected', handleUserConnected)
      socket.off('user-disconnected', handleUserDisconnected)
      socket.off('typing-start', handleTypingStart)
      socket.off('typing-stop', handleTypingStop)
    }
  }, [socket])

  // ─── Media controls ───────────────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => { track.enabled = !track.enabled })
    }
    setMicOn(v => !v)
  }, [localStream])

  const toggleCam = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => { track.enabled = !track.enabled })
    }
    setCamOn(v => !v)
  }, [localStream])

  // ─── Chat ─────────────────────────────────────────────────────────────────
  const sendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Emit typing-stop before sending
    socket.emit('typing-stop', { roomId })
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)

    socket.emit('send-message', {
      roomId,
      message: { text: input.trim() },
    })
    setInput('')
  }, [input, roomId, socket])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)

    // Emit typing-start
    socket.emit('typing-start', { roomId })

    // Auto-stop typing after 2 s of inactivity
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => {
      socket.emit('typing-stop', { roomId })
    }, 2000)
  }, [roomId, socket])

const leaveMeeting = useCallback(async () => {
  try {
    console.log("1. Leave clicked");

    destroyAll();

    recorderRef.current?.stop();

    socket.emit("stop-transcription", { roomId });

 //   console.log("2. Calling summary API");

   // const res = await api.post(`/transcript/${roomId}/generate-summary`);

  //  console.log("3. Summary API completed", res.data);

    socket.disconnect();

   // console.log("4. Navigating");

    navigate(`/post-meeting/${roomId}`);
  } catch (err) {
    console.error("Leave Meeting Error:", err);
  }
}, [destroyAll, roomId, socket, navigate]);
  /*
  // ─── Leave meeting ────────────────────────────────────────────────────────
  const leaveMeeting = useCallback(() => {
    destroyAll()
    //chnages here transcription stop
    recorderRef.current?.stop();

    socket.emit("stop-transcription", {
         roomId,
    });

    socket.disconnect()
    navigate('/post-meeting/:id' + roomId)
  }, [destroyAll, navigate, roomId, socket])
*/
  // ─── Typing indicator text ────────────────────────────────────────────────
  const typingNames = Object.values(typingUsers)
  const typingText =
    typingNames.length === 0 ? null
    : typingNames.length === 1 ? `${typingNames[0]} is typing…`
    : typingNames.length === 2 ? `${typingNames[0]} and ${typingNames[1]} are typing…`
    : 'Several people are typing…'

  // ─── Video grid layout ────────────────────────────────────────────────────
  // Main tile = local user (or first peer if sharing a remote)
  // Small tiles = all remote peers
  const totalCount = 1 + peers.length  // local + remotes
//console.log("localStream =", localStream)
//console.log("camOn =", camOn)
//console.log("isConnected =", isConnected)
//console.log(socket.connected)
//console.log(socket.id)
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0D1117' }}>
      
      {/* Toast Notification */}
      {showInviteToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white shadow-2xl border border-white/10 bg-[#161B22] transition-all duration-300">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Meeting link copied to clipboard!
        </div>
      )}

      {/* Global Socket reconnect banner */}
      {/* Participant Overlay Modal (Mobile only) */}
      {showParticipants && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 md:hidden animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl p-6 border border-white/10 bg-[#161B22] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-purple-400" />
                <h3 className="text-white font-bold text-sm">Participants ({totalCount})</h3>
              </div>
              <button 
                onClick={() => setShowParticipants(false)} 
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {/* Local user */}
              <div className="flex items-center gap-2 px-2.5 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="relative flex-shrink-0">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: userColor }}>
                    {userInitials}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-gray-900" />
                </div>
                <span className="text-white/80 text-xs font-semibold flex-1 truncate">{userName}</span>
                <span className="text-xs text-emerald-400 font-semibold">You</span>
              </div>

              {/* Remote participants */}
              {participants.map(p => {
                const pColor = getColorFromName(p.userName)
                const pInit = getInitials(p.userName)
                const hasPeer = peers.some(peer => peer.socketId === p.socketId)
                return (
                  <div key={p.socketId} className="flex items-center gap-2 px-2.5 py-2 rounded-xl transition-colors" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="relative flex-shrink-0">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: pColor }}>
                        {pInit}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-gray-900 ${hasPeer ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                    </div>
                    <span className="text-white/70 text-xs font-semibold flex-1 truncate">{p.userName}</span>
                    {typingUsers[p.socketId] && (
                      <span className="text-xs text-purple-400 italic">typing…</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 sm:px-6 sm:py-3 border-b gap-2" style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#161B22' }}>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center cursor-pointer flex-shrink-0"
              onClick={() => navigate('/dashboard')}
              style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)' }}
            >
              <Bot className="text-white w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <span className="text-white font-bold text-xs sm:text-sm cursor-pointer hover:opacity-85" onClick={() => navigate('/dashboard')}>IntellMeet</span>
          </div>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-white font-semibold text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[200px]">
              Room · {roomId.length > 8 ? `${roomId.substring(0, 8)}...` : roomId}
            </span>
            <button
              onClick={handleInviteCopy}
              className="bg-white/10 hover:bg-white/15 text-white text-[10px] sm:text-xs rounded-lg px-2.5 py-1.5 flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer min-h-[32px] sm:min-h-0"
            >
              <Link className="w-3 h-3" />
              Invite
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Timer */}
          <div className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-mono text-xs sm:text-sm font-semibold">{timer}</span>
          </div>

          {/* REC badge */}
          {recording && (
            <div className="flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 text-[10px] sm:text-xs font-bold">REC</span>
            </div>
          )}

          {/* AI badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.35)' }}>
            <Bot size={12} style={{ color: '#A78BFA' }} />
            <span className="text-xs font-semibold" style={{ color: '#A78BFA' }}>AI Transcribing</span>
          </div>

          {/* Participant count (toggles overlay on mobile) */}
          <div 
            onClick={() => setShowParticipants(v => !v)}
            className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
          >
            <Users className="text-slate-400 w-3.5 h-3.5" />
            <span className="text-white text-xs font-semibold">{totalCount}</span>
          </div>

          {/* Connection indicator */}
          <div className="flex items-center gap-1">
            {isConnected
              ? <Wifi className="text-emerald-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
              : <WifiOff className="text-red-400 animate-pulse w-3.5 h-3.5 sm:w-4 sm:h-4" />
            }
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* ── Video Area ────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col p-2 sm:p-4 gap-2 sm:gap-3 overflow-y-auto md:overflow-hidden">

          {/* Main tile (local user) */}
          <div
            className="flex-shrink-0 w-full h-[50vh] md:h-auto md:flex-1 rounded-2xl flex items-center justify-center relative overflow-hidden"
            style={{ border: '2px solid rgba(124,58,237,0.4)', background: '#0a0d12' }}
          >
            {localStream && camOn ? (
              <LocalVideo stream={localStream} videoRef={localVideoRef} />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold text-white shadow-2xl"
                  style={{ background: `linear-gradient(135deg, ${userColor}, ${userColor}aa)` }}
                >
                  {userInitials}
                </div>
                <div className="text-white font-semibold text-sm sm:text-lg">{userName}</div>
                {streamError && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                    <VideoOff size={12} className="text-amber-400" />
                    <span className="text-amber-300 text-xs">Camera unavailable</span>
                  </div>
                )}
                {!streamError && (
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full" style={{ background: 'rgba(124,58,237,0.3)', border: '1px solid rgba(124,58,237,0.5)' }}>
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                    <span className="text-purple-300 text-xs sm:text-sm font-medium">You · Speaking</span>
                  </div>
                )}
              </div>
            )}

            {/* Corner badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
              {micOn ? <Mic size={12} className="text-emerald-400" /> : <MicOff size={12} className="text-red-400" />}
              <span className="text-white text-xs">You</span>
            </div>

            <button className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <MoreVertical size={16} className="text-white/50" />
            </button>

            {/* Connection status overlay when disconnected */}
            {!isConnected && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
                <div className="flex flex-col items-center gap-2">
                  <WifiOff size={32} className="text-red-400 animate-pulse" />
                  <span className="text-white/70 text-sm">Reconnecting…</span>
                </div>
              </div>
            )}
          </div>

          {/* Remote peer tiles */}
          {peers.length > 0 && (
            <div className={`grid gap-2 h-24 md:h-32 flex-shrink-0 ${peers.length === 1 ? 'grid-cols-1' : peers.length <= 3 ? `grid-cols-${peers.length}` : 'grid-cols-4'}`}
              style={{ gridTemplateColumns: `repeat(${Math.min(peers.length, 4)}, 1fr)` }}
            >
              {peers.map(peer => {
                const pColor = getColorFromName(peer.userName)
                const pInit = getInitials(peer.userName)
                return (
                  <div
                    key={peer.socketId}
                    className="rounded-xl flex flex-col items-center justify-center gap-1 relative overflow-hidden"
                    style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0a0d12' }}
                  >
                    {peer.stream ? (
                      <RemoteVideo stream={peer.stream} userName={peer.userName} color={pColor} />
                    ) : (
                      <>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold text-white"
                          style={{ background: `linear-gradient(135deg, ${pColor}, ${pColor}aa)` }}>
                          {pInit}
                        </div>
                        <span className="text-white/70 text-[10px] sm:text-xs font-medium truncate px-1 w-full text-center">
                          {peer.userName.split(' ')[0]}
                        </span>
                      </>
                    )}
                    {/* Name overlay for video tile */}
                    {peer.stream && (
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px] sm:text-xs text-white font-medium"
                        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
                        {peer.userName.split(' ')[0]}
                      </div>
                    )}
                    {/* Connection failure overlay */}
                    {peer.connectionState === 'failed' && (
                      <ConnectionStatusAlert 
                        type="peer" 
                        peerName={peer.userName} 
                        onRetry={() => retryPeerConnection(peer.socketId)} 
                      />
                    )}
                    {/* Online indicator */}
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400" title="Online" />
                  </div>
                )
              })}
            </div>
          )}

          {/* Empty state — waiting for others */}
          {peers.length === 0 && isConnected && (
            <div className="h-20 rounded-xl flex items-center justify-center gap-3 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <UserCircle2 size={18} className="text-slate-500" />
              <span className="text-slate-500 text-xs sm:text-sm">Waiting for others to join…</span>
            </div>
          )}
        </div>

        {/* ── Right Panel (Chat Sidebar) ───────────────────────────────────────────────── */}
        <div 
          className={`flex-col border-l border-white/10 ${
            showChat 
              ? 'fixed bottom-0 left-0 w-full h-80 md:h-auto z-40 bg-[#161B22] border-t' 
              : 'hidden'
          } md:flex md:static md:w-72 md:bg-[#161B22]`}
        >
          {/* Panel tabs — Participants (Desktop only) */}
          <div className="hidden md:block px-4 pt-3 pb-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.35)' }}>
                <Users size={13} style={{ color: '#A78BFA' }} />
                <span className="text-xs font-semibold" style={{ color: '#A78BFA' }}>
                  {totalCount} Participant{totalCount !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <MessageSquare size={13} className="text-slate-400" />
                <span className="text-xs font-semibold text-slate-400">Chat</span>
              </div>
            </div>

            {/* Participant list */}
            <div className="space-y-1 mb-3 max-h-40 overflow-y-auto pr-1">
              {/* Local user */}
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="relative flex-shrink-0">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: userColor }}>
                    {userInitials}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-gray-900" />
                </div>
                <span className="text-white/80 text-xs font-medium flex-1 truncate">{userName}</span>
                <span className="text-xs text-emerald-400 font-semibold">You</span>
              </div>

              {/* Remote participants */}
              {participants.map(p => {
                const pColor = getColorFromName(p.userName)
                const pInit = getInitials(p.userName)
                const hasPeer = peers.some(peer => peer.socketId === p.socketId)
                return (
                  <div key={p.socketId} className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="relative flex-shrink-0">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: pColor }}>
                        {pInit}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-gray-900 ${hasPeer ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                    </div>
                    <span className="text-white/70 text-xs font-medium flex-1 truncate">{p.userName}</span>
                    {typingUsers[p.socketId] && (
                      <span className="text-xs text-purple-400 italic">typing…</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="hidden md:block h-px mx-4" style={{ background: 'rgba(255,255,255,0.06)' }} />

          {/* Chat header */}
          <div className="px-4 py-2 flex items-center justify-between border-b border-white/5 md:border-b-0">
            <div className="flex items-center gap-2">
              <Bot size={14} style={{ color: '#A78BFA' }} />
              <span className="text-white text-xs font-semibold">Live Chat</span>
            </div>
            <button 
              onClick={() => setShowChat(false)}
              className="md:hidden text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className="animate-slide-in-right">
                {msg.isAI ? (
                  <div className="p-2.5 rounded-xl" style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">🤖</span>
                      <span className="text-xs font-bold" style={{ color: '#A78BFA' }}>System</span>
                      <span className="text-xs text-slate-600 ml-auto">{msg.time}</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: '#C4B5FD' }}>{msg.text}</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: getColorFromName(msg.senderName) }}
                      >
                        {getInitials(msg.senderName).charAt(0)}
                      </div>
                      <span className="text-xs font-semibold text-white/70">{msg.senderName}</span>
                      <span className="text-xs text-slate-600 ml-auto">{msg.time}</span>
                    </div>
                    <div className="ml-7 px-3 py-2 rounded-xl text-xs text-white/80 leading-relaxed" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      {msg.text}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {typingText && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl animate-pulse" style={{ background: 'rgba(124,58,237,0.1)' }}>
                <div className="flex gap-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs text-purple-300/70 italic">{typingText}</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="px-4 py-3 border-t border-white/10" style={{ background: '#161B22' }}>
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                id="chat-input"
                value={input}
                onChange={handleInputChange}
                placeholder="Type a message…"
                disabled={!isConnected}
                className="flex-1 px-3 py-2 rounded-xl text-xs text-white placeholder-white/25 outline-none disabled:opacity-40"
                style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
              />
              <button
                type="submit"
                disabled={!isConnected || !input.trim()}
                className="p-2 rounded-xl transition-all hover:opacity-80 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #5B21B6)' }}
              >
                <Send size={14} className="text-white" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Bottom Controls ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-4 py-3 sm:px-6 sm:py-4 border-t border-white/10" style={{ background: '#161B22' }}>
        {[
          {
            id: 'btn-mic', icon: micOn ? Mic : MicOff, label: micOn ? 'Mute' : 'Unmute',
            active: micOn, onClick: toggleMic,
            activeColor: 'rgba(255,255,255,0.1)', inactiveColor: 'rgba(239,68,68,0.2)',
            activeIcon: micOn ? 'text-white' : 'text-red-400',
          },
          {
            id: 'btn-cam', icon: camOn ? Video : VideoOff, label: camOn ? 'Stop Video' : 'Start Video',
            active: camOn, onClick: toggleCam,
            activeColor: 'rgba(255,255,255,0.1)', inactiveColor: 'rgba(239,68,68,0.2)',
            activeIcon: camOn ? 'text-white' : 'text-red-400',
          },
          {
            id: 'btn-share', icon: Monitor, label: sharing ? 'Stop Share' : 'Share Screen',
            active: sharing, onClick: handleShareScreen,
            activeColor: 'rgba(6,182,212,0.2)', inactiveColor: 'rgba(255,255,255,0.1)',
            activeIcon: sharing ? 'text-cyan-400' : 'text-white',
          },
          {
            id: 'btn-hand', icon: Hand, label: handRaised ? 'Lower Hand' : 'Raise Hand',
            active: handRaised, onClick: () => setHandRaised(v => !v),
            activeColor: 'rgba(245,158,11,0.2)', inactiveColor: 'rgba(255,255,255,0.1)',
            activeIcon: handRaised ? 'text-amber-400' : 'text-white',
          },
          {
            id: 'btn-rec', icon: Circle, label: recording ? 'Stop REC' : 'Record',
            active: recording, onClick: () => setRecording(v => !v),
            activeColor: 'rgba(239,68,68,0.2)', inactiveColor: 'rgba(255,255,255,0.1)',
            activeIcon: recording ? 'text-red-400' : 'text-white',
          },
          {
            id: 'btn-participants', icon: Users, label: 'People',
            active: showParticipants, onClick: () => setShowParticipants(v => !v),
            activeColor: 'rgba(124,58,237,0.2)', inactiveColor: 'rgba(255,255,255,0.1)',
            activeIcon: showParticipants ? 'text-purple-400' : 'text-white',
            className: 'md:hidden',
          },
          {
            id: 'btn-chat', icon: MessageSquare, label: showChat ? 'Hide Chat' : 'Chat',
            active: showChat, onClick: () => setShowChat(v => !v),
            activeColor: 'rgba(124,58,237,0.2)', inactiveColor: 'rgba(255,255,255,0.1)',
            activeIcon: showChat ? 'text-purple-400' : 'text-white',
            className: 'md:hidden',
          },
        ].map(({ id, icon: Icon, label, active, onClick, activeColor, inactiveColor, activeIcon, className }) => (
          <button
            key={id}
            id={id}
            onClick={onClick}
            className={`flex flex-col items-center gap-1 p-2 sm:p-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 min-w-[60px] sm:min-w-[72px] cursor-pointer ${className || ''}`}
            style={{ background: active ? activeColor : inactiveColor }}
          >
            <Icon className={`${activeIcon} w-4 h-4 sm:w-5 sm:h-5`} />
            <span className={`text-[10px] sm:text-xs font-medium ${activeIcon}`}>{label}</span>
          </button>
        ))}

        <div className="hidden sm:block w-px h-10 mx-1 bg-white/10" />

        {/* Leave */}
        <button
          id="btn-leave"
          onClick={leaveMeeting}
          className="flex flex-col items-center gap-1 p-2 sm:px-4 sm:py-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer min-w-[60px] sm:min-w-[72px]"
          style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)' }}
        >
          <PhoneOff className="text-red-400 w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[10px] sm:text-xs font-medium text-red-400">Leave</span>
        </button>
      </div>
    </div>
  )
}
