import React from 'react'
import { WifiOff, AlertTriangle, RefreshCw } from 'lucide-react'

interface ConnectionStatusAlertProps {
  type: 'socket' | 'peer'
  peerName?: string
  onRetry?: () => void
}

/**
 * ConnectionStatusAlert component.
 * Standardized status display for connection errors and self-healing reconnect overlays.
 */
export const ConnectionStatusAlert: React.FC<ConnectionStatusAlertProps> = ({
  type,
  peerName = 'Participant',
  onRetry,
}) => {
  if (type === 'socket') {
    return (
      <div 
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl animate-bounce"
        style={{
          background: 'rgba(239, 68, 68, 0.15)',
          borderColor: 'rgba(239, 68, 68, 0.3)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <WifiOff className="text-red-400 animate-pulse flex-shrink-0" size={18} />
        <div className="flex flex-col">
          <span className="text-white text-xs font-bold">Lost Server Connection</span>
          <span className="text-red-300/80 text-[10px]">Reconnecting to IntellMeet server with backoff...</span>
        </div>
      </div>
    )
  }

  // Peer connection failure state
  return (
    <div 
      className="absolute inset-0 flex flex-col items-center justify-center p-4 rounded-xl text-center z-10"
      style={{
        background: 'rgba(10, 13, 18, 0.92)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <AlertTriangle className="text-amber-400 mb-2 animate-bounce" size={24} />
      <span className="text-white text-xs font-bold mb-1">
        Connection to {peerName} Failed
      </span>
      <p className="text-slate-400 text-[10px] max-w-[200px] mb-3">
        Firewall or network restrictions prevented direct peer-to-peer connection.
      </p>
      
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <RefreshCw className="text-amber-400 animate-spin flex-shrink-0" size={12} />
        <span className="text-[10px] text-amber-300 font-semibold">Self-healing retry active…</span>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 px-3 py-1 rounded text-[10px] font-bold text-white transition-colors duration-150 hover:bg-slate-800"
          style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.02)' }}
        >
          Force Retry Now
        </button>
      )}
    </div>
  )
}

export default ConnectionStatusAlert
