import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Bot, 
  Mail, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff 
} from 'lucide-react'
import api from '../config/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Custom interactive state additions
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const googleInitialized = useRef(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.post('/auth/login', {
        email: email.trim(),
        password
      })

      const data = response.data || response
      const tokenValue = data.token || data.accessToken
      const userObj = data.user || {}
      
      localStorage.setItem('token', tokenValue)
      localStorage.setItem('userName', userObj.name || '')
      localStorage.setItem('userEmail', userObj.email || '')
      localStorage.setItem('role', userObj.role || 'Team Member')
      localStorage.setItem('initials', userObj.avatar || 'US')
      localStorage.setItem('userId', userObj.id || '')
//console.log(response.data)
//console.log(data)
//console.log(tokenValue)

      navigate('/dashboard')
    } catch (err: any) {
      setError('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const fillAndSubmitDemo = async (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('Demo2026')
    setError('')
    setLoading(true)
    try {
      const response = await api.post('/auth/login', {
        email: demoEmail,
        password: 'Demo2026'
      })
      const data = response.data || response
      const tokenValue = data.token || data.accessToken
      const userObj = data.user || {}

      localStorage.setItem('token', tokenValue)
      localStorage.setItem('userName', userObj.name || '')
      localStorage.setItem('userEmail', userObj.email || '')
      localStorage.setItem('role', userObj.role || 'Team Member')
      localStorage.setItem('initials', userObj.avatar || 'US')
      navigate('/dashboard')
    } catch (err: any) {
      setError('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    console.log('Forgot password clicked - wire connection recovery logic here later')
  }

  const handleGoogleSignIn = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) {
      setError('Google Sign-In is not configured.')
      return
    }
    // @ts-ignore
    if (window.google) {
      if (!googleInitialized.current) {
        // @ts-ignore
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            setLoading(true)
            setError('')
            try {
              console.log('Google token received:', response.credential?.substring(0, 20))
              const res = await api.post('/auth/google', { token: response.credential })
              const data = res.data || res
              localStorage.setItem('token', data.accessToken)
              localStorage.setItem('userName', data.user?.name || '')
              localStorage.setItem('userEmail', data.user?.email || '')
              localStorage.setItem('role', data.user?.role || 'member')
              localStorage.setItem('initials', data.user?.avatar || 'GU')
              navigate('/dashboard')
            } catch (err: any) {
              console.error('Google auth error:', err)
              setError('Google Sign-In failed. Please try again.')
            } finally {
              setLoading(false)
            }
          },
        })
        googleInitialized.current = true
      }
      // @ts-ignore
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-btn'),
        { 
          theme: 'filled_black',
          size: 'large',
          width: 400,
          text: 'continue_with',
        }
      )
    } else {
      setError('Google Sign-In failed to load. Please refresh and try again.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4" style={{ background: '#0a0f1a', fontFamily: "'Inter', sans-serif" }}>
      {/* Dynamic styles */}
      <style>{`
        @keyframes fadeInCard {
          0% { opacity: 0; transform: translateY(14px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .login-card {
          animation: fadeInCard 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .glow-button {
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.15);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .glow-button:hover:not(:disabled) {
          box-shadow: 0 0 25px rgba(59, 130, 246, 0.45);
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

      {/* Main Login Card */}
      <div className="login-card w-full max-w-md opacity-0">
        <div className="rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl border border-white/10" style={{ background: '#0d1420' }}>
          {/* Accent strip */}
          <div className="h-1 w-full bg-blue-500" style={{ boxShadow: '0 1px 15px rgba(59, 130, 246, 0.4)' }} />

          <div className="p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-lg bg-blue-600" style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }}>
                <Bot size={28} className="text-white" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white mb-0.5">IntellMeet</h1>
              <p className="text-xs font-medium text-blue-400">AI-Powered Meeting Insights</p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="email-input"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full pl-11 pr-4 min-h-[52px] rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.07)' }}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 min-h-[52px] rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.07)' }}
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

              {/* Remember me checkbox */}
              <div className="flex items-center gap-2 py-1">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500/20 focus:ring-offset-slate-900 focus:ring-2 cursor-pointer"
                />
                <label htmlFor="remember-me" className="text-xs text-slate-400 font-medium select-none cursor-pointer">
                  Remember me
                </label>
              </div>

              {error && (
                <div className="text-red-400 text-xs py-2 px-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </div>
              )}

              {/* Login Button */}
              <button
                id="sign-in-btn"
                type="submit"
                disabled={loading}
                className="glow-button w-full min-h-[52px] rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
                style={{ background: loading ? '#1d4ed8' : '#3b82f6' }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* OAuth Divider */}
              <div className="flex items-center gap-3 my-4 py-2">
                <div className="h-px bg-slate-800 flex-1" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">or</span>
                <div className="h-px bg-slate-800 flex-1" />
              </div>

              {/* Google OAuth Button */}
              <button
                id="google-signin-btn"
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full min-h-[52px] rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors bg-transparent border border-slate-800 hover:bg-white/5 active:scale-[0.98] flex items-center justify-center cursor-pointer"
              >
                <svg className="w-4 h-4 mr-2.5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </form>

            {/* Redirect link to Register */}
            <div className="mt-5 text-center">
              <span className="text-xs text-slate-400">Don't have an account? </span>
              <button
                type="button"
                id="go-to-register-btn"
                onClick={() => navigate('/register')}
                className="text-xs text-blue-400 hover:text-white transition-colors underline cursor-pointer font-bold ml-0.5"
              >
                Register here
              </button>
            </div>

            {/* Pre-seeded Demo account box */}
            <div className="mt-6 p-4 rounded-2xl border border-slate-800 bg-slate-950/30">
              <p className="text-xs font-bold text-center mb-1.5 text-blue-400 flex items-center justify-center gap-1">
                ⚡ Pre-seeded Demo Account
              </p>
              <p className="text-[10px] text-center text-slate-500 mb-3 leading-relaxed">
                Credentials: <strong className="text-slate-300">demo@intellmeet.ai</strong> / <strong className="text-slate-300">Demo2026</strong>
                <br />
                (Click the button below to quick-authenticate)
              </p>
              <button
                type="button"
                onClick={() => fillAndSubmitDemo('demo@intellmeet.ai')}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all duration-200 hover:bg-white/5 active:scale-[0.98] border border-slate-800 cursor-pointer"
              >
                Quick Demo Authentication
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
