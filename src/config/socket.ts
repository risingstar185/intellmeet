import { io, Socket } from 'socket.io-client'

// VITE_BACKEND_URL is set in Vercel env vars for production.
// Falls back to local dev server so no .env file is needed locally.
const SOCKET_URL: string = import.meta.env.VITE_BACKEND_URL || 'https://intellmeet-ghpj.onrender.com'

let socketInstance: Socket | null = null

/**
 * Returns the singleton Socket.io client instance.
 * Creates it on first call and reuses the same connection thereafter.
 */
export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: false,    // We connect manually when joining a room
      reconnection: true,
      reconnectionAttempts: Infinity, // Keep reconnecting indefinitely
      reconnectionDelay: 1000,        // Start retry delay at 1s
      reconnectionDelayMax: 5000,     // Grow up to a maximum of 5s
      randomizationFactor: 0.5,       // Randomize backoff intervals to prevent thundering herds
    })
  }
  return socketInstance
}

export default getSocket

