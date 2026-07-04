import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Bot, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff 
} from 'lucide-react'
import api from '../config/api'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!name.trim()) {
        setError('Name is required.')
        setLoading(false)
        return
      }

      await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password
      })

      setSuccess('Account created!')
      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || 'Registration failed. Please try again.'
      setError(errMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4" style={{ background: '#0a0f1a', fontFamily: "'Inter', sans-serif" }}>
      {/* Dynamic styles */}
      <style>{`
        @keyframes fadeInCard {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .register-card {
          animation: fadeInCard 0.4s ease forwards;
        }
        .glow-button {
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.15);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .glow-button:hover:not(:disabled) {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
          transform: scale(1.01);
        }
        .glow-button:active:not(:disabled) {
          transform: scale(0.99);
        }
      `}</style>

      {/* Background ambient light */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
        <div className="absolute -bottom-40 -right-40 w-[450px] h-[450px] rounded-full opacity-10 blur-3xl" style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
        {/* Fine background grid */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }} />
      </div>

      {/* Main Register Card */}
      <div className="register-card w-full max-w-md opacity-0">
        <div className="rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md border border-white/10 bg-[#0d1420]">
          {/* Accent strip */}
          <div className="h-1 w-full bg-blue-500" style={{ boxShadow: '0 1px 15px rgba(59, 130, 246, 0.4)' }} />

          <div className="p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-lg bg-blue-600/20 border border-blue-500/20" style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.15)' }}>
                <Bot size={28} className="text-blue-400" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white mb-0.5 animate-pulse">IntellMeet</h1>
              <p className="text-sm font-medium text-blue-400">Create Your Account</p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="register-name" className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Name</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    id="register-name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full pl-11 pr-4 min-h-[52px] rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.10)' }}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="register-email" className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full pl-11 pr-4 min-h-[52px] rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.10)' }}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="register-password" className="block text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="•••••••• (Min 6 chars)"
                    className="w-full pl-11 pr-12 min-h-[52px] rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.10)' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-400 text-xs py-2 px-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </div>
              )}

              {success && (
                <div className="text-emerald-400 text-xs py-2 px-3 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  {success}
                </div>
              )}

              {/* Register Button */}
              <button
                id="register-btn"
                type="submit"
                disabled={loading}
                className="glow-button w-full min-h-[52px] rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer bg-blue-600 hover:bg-blue-500"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account →
                  </>
                )}
              </button>
            </form>

            {/* Redirect link to Login */}
            <div className="mt-5 text-center">
              <span className="text-xs text-gray-500">Already have an account? </span>
              <button
                type="button"
                id="go-to-login-btn"
                onClick={() => navigate('/login')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Tagline */}
        <p className="text-center text-slate-600 text-xs mt-6">
          Trusted by 500+ enterprise teams worldwide
        </p>
      </div>
    </div>
  )
}
