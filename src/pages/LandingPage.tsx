import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Video,
  Mic,
  Sparkles,
  Play,
  ArrowRight,
  Menu,
  X,
  Bot,
  Activity,
  CheckSquare,
  BarChart3,
  Users,
  Monitor,
  Volume2,
  VolumeX,
  Maximize,
  Compass,
  Zap,
  Check
} from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
 // const [activeFeature, setActiveFeature] = useState(0)

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  // Track page scroll to apply background to navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    setMobileOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen overflow-x-hidden text-slate-100" style={{ background: '#0a0f1a', fontFamily: "'Inter', sans-serif" }}>
      {/* ── Custom CSS Animations & 3D rules ── */}
      <style>{`
        @keyframes float-mockup {
          0% { transform: perspective(1200px) rotateX(12deg) rotateY(-10deg) rotateZ(1deg) translateY(0px); }
          100% { transform: perspective(1200px) rotateX(12deg) rotateY(-10deg) rotateZ(1deg) translateY(-14px); }
        }
        .float-mockup {
          animation: float-mockup 4s ease-in-out infinite alternate;
        }
        .nav-scrolled {
          backdrop-filter: blur(16px);
          background-color: rgba(10, 15, 26, 0.85);
          border-bottom: 1px solid rgba(59, 130, 246, 0.15);
        }
        .step-card {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .step-card:hover {
          transform: perspective(1000px) rotateY(6deg) translateY(-4px);
          border-color: rgba(59, 130, 246, 0.4);
          box-shadow: 0 15px 35px rgba(59, 130, 246, 0.12);
        }
        .feature-card {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-8px);
          border-color: rgba(59, 130, 246, 0.45);
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.18);
        }
        .demo-video-thumb {
          background: linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(10,15,26,0.95) 100%);
        }
        .glow-blue {
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.25);
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'nav-scrolled py-3 shadow-lg' : 'py-5 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-600 transition-all duration-300 group-hover:scale-105"
                 style={{ boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)' }}>
              <Video size={18} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              IntellMeet<span className="text-blue-500">.</span>
            </span>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-2">
            {[
              { label: 'Features', id: 'features' },
              { label: 'How it Works', id: 'how-it-works' },
              { label: 'Demo', id: 'demo' },
            ].map(({ label, id }) => (
              <button
                key={label}
                onClick={() => scrollTo(id)}
                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 cursor-pointer"
              >
                {label}
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              style={{
                border: '1px solid rgba(59, 130, 246, 0.4)',
                background: 'rgba(59, 130, 246, 0.1)',
                boxShadow: '0 0 15px rgba(59, 130, 246, 0.15)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 25px rgba(59, 130, 246, 0.4)' }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.15)' }}
            >
              Get Started
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white p-2 cursor-pointer"
            onClick={() => setMobileOpen(o => !o)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden px-6 pb-6 pt-2 space-y-2 border-b border-blue-900/20"
               style={{ background: 'rgba(10, 15, 26, 0.98)', backdropFilter: 'blur(16px)' }}>
            {['features', 'how-it-works', 'demo'].map((id, i) => (
              <button 
                key={id} 
                onClick={() => scrollTo(id)}
                className="block w-full text-left px-4 py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {['Features', 'How it Works', 'Watch Demo'][i]}
              </button>
            ))}
            <div className="flex gap-3 pt-3">
              <button 
                onClick={() => navigate('/login')}
                className="flex-1 py-3 text-sm font-semibold text-center text-slate-300 border border-white/10 rounded-xl cursor-pointer hover:bg-white/5"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="flex-1 py-3 text-sm font-bold text-center text-white rounded-xl cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] rounded-full blur-3xl opacity-20"
               style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
          <div className="absolute top-[20%] right-[5%] w-[500px] h-[500px] rounded-full blur-3xl opacity-15"
               style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
          {/* Subtle Grid overlay */}
          <div className="absolute inset-0 opacity-[0.02]"
               style={{
                 backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
                 backgroundSize: '80px 80px',
               }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Hero text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-900/30 text-xs font-semibold"
                 style={{ background: 'rgba(59, 130, 246, 0.08)', color: '#60a5fa' }}>
              <Sparkles size={12} className="animate-spin" style={{ animationDuration: '3s' }} />
              AI-Powered Next-Gen Meetings
            </div>

            <h1 className="text-5xl lg:text-6xl font-black leading-tight tracking-tight text-white">
              Meetings that think. <br />
              <span style={{
                background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                So you don't have to.
              </span>
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
              IntellMeet automatically transcribes, summarizes, and extracts action items from your video calls in real-time. Boost collaboration with built-in Kanban boards and performance analytics.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/register')}
                className="flex items-center gap-2 px-8 py-4 rounded-xl text-white font-bold text-base transition-all duration-300 hover:scale-[1.02] hover:opacity-95 shadow-lg shadow-blue-500/20 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
              >
                Start Free Meeting
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base border border-slate-700 text-slate-200 hover:bg-slate-800/50 hover:border-slate-500 transition-all duration-300 cursor-pointer"
              >
                <Play size={16} className="text-blue-500" fill="#3b82f6" />
                Watch Demo
              </button>
            </div>

            {/* Micro stats */}
            <div className="pt-4 flex items-center gap-6 border-t border-slate-900/50 max-w-md">
              <div>
                <div className="text-2xl font-extrabold text-white">99.9%</div>
                <div className="text-xs text-slate-500 mt-0.5">Uptime SLA</div>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div>
                <div className="text-2xl font-extrabold text-white">35m+</div>
                <div className="text-xs text-slate-500 mt-0.5">Minutes Saved</div>
              </div>
              <div className="w-px h-8 bg-slate-800" />
              <div>
                <div className="text-2xl font-extrabold text-white">100%</div>
                <div className="text-xs text-slate-500 mt-0.5">Secure Encryption</div>
              </div>
            </div>
          </div>

          {/* 3D Floating Mockup */}
          <div className="relative flex items-center justify-center">
            {/* Background Glow */}
            <div className="absolute w-[350px] h-[350px] rounded-full bg-blue-500/10 blur-3xl -z-10" />
            
            {/* The 3D Mockup Container */}
            <div className="float-mockup w-full max-w-lg aspect-[1.58] rounded-2xl border border-blue-900/35 overflow-hidden shadow-2xl relative glow-blue"
                 style={{
                   background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
                 }}>
              
              {/* Fake Chrome Bar */}
              <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-slate-900 bg-slate-950/60">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                <div className="flex-1 mx-3 h-5 rounded-full bg-slate-900/80 flex items-center px-3 border border-white/5">
                  <span className="text-[10px] text-slate-500 font-mono">app.intellmeet.ai/meeting/q3-review</span>
                </div>
              </div>

              {/* Fake Meeting UI Grid */}
              <div className="p-4 h-[calc(100%-41px)] flex flex-col justify-between space-y-3">
                {/* 3 Participant grid */}
                <div className="grid grid-cols-3 gap-2.5 flex-1 min-h-0">
                  {/* Tile 1 */}
                  <div className="rounded-xl border border-white/5 bg-slate-950/40 relative overflow-hidden flex flex-col items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">AS</div>
                    <span className="text-[10px] text-slate-400 mt-2 font-medium">Arjun (You)</span>
                    <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/40 text-[9px] flex items-center gap-1 text-emerald-400">
                      <Mic size={8} /> Speaking
                    </div>
                  </div>
                  {/* Tile 2 */}
                  <div className="rounded-xl border border-white/5 bg-slate-950/40 relative overflow-hidden flex flex-col items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">PM</div>
                    <span className="text-[10px] text-slate-400 mt-2 font-medium">Priya Mehta</span>
                    <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/40 text-[9px] flex items-center gap-1 text-slate-400">
                      <Mic size={8} /> Muted
                    </div>
                  </div>
                  {/* Tile 3 */}
                  <div className="rounded-xl border border-white/5 bg-slate-950/40 relative overflow-hidden flex flex-col items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">RV</div>
                    <span className="text-[10px] text-slate-400 mt-2 font-medium">Rahul Verma</span>
                    <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/40 text-[9px] flex items-center gap-1 text-slate-400">
                      <Mic size={8} /> Active
                    </div>
                  </div>
                </div>

                {/* AI live transcript bar */}
                <div className="rounded-xl p-3 border border-blue-500/25 bg-blue-500/5 relative overflow-hidden">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles size={10} className="text-blue-400 animate-pulse" />
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-blue-400">Live AI Transcription</span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed italic">
                    "Priya: Let's adjust the Q3 release target to August 15th to accommodate the security audit."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 bg-slate-950/40 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-500">Overview</span>
            <h2 className="text-3xl lg:text-4xl font-black text-white mt-2">Meetings simplified in 3 steps</h2>
            <p className="text-slate-400 text-sm mt-3">
              Experience the power of intelligence applied automatically to every discussion.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Dashed Connector Line */}
            <div className="hidden md:block absolute top-20 left-1/6 right-1/6 h-[1.5px] border-t-2 border-dashed border-blue-900/30 -z-10" />

            {[
              {
                step: '01',
                title: 'Join or schedule a meeting',
                desc: 'Quickly spin up a room in seconds. Invite team members with simple invite URLs.',
                icon: Video,
              },
              {
                step: '02',
                title: 'AI transcribes in real-time',
                desc: 'IntellMeet listens, identifies speakers, and writes down every detail as it happens.',
                icon: Mic,
              },
              {
                step: '03',
                title: 'Get summary + tasks instantly',
                desc: 'AI digests the transcript, drafts a summary, and creates ready-to-use Kanban tasks.',
                icon: Sparkles,
              },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div
                key={step}
                className="step-card bg-slate-900/30 border border-slate-800 p-8 rounded-2xl text-center relative overflow-hidden flex flex-col items-center group cursor-default"
              >
                <div className="absolute top-4 right-6 text-sm font-black text-blue-500/20 group-hover:text-blue-500/35 transition-colors">
                  {step}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-105 transition-transform duration-300">
                  <Icon size={24} />
                </div>
                <h3 className="font-bold text-white text-base mb-3">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-500">Core Features</span>
            <h2 className="text-3xl lg:text-4xl font-black text-white mt-2">Smarter video workflows</h2>
            <p className="text-slate-400 text-sm mt-3">
              Focus on the conversations while IntellMeet automates administrative tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Monitor,
                color: '#3b82f6',
                bg: 'rgba(59, 130, 246, 0.08)',
                border: 'rgba(59, 130, 246, 0.15)',
                title: 'Real-time video & audio',
                desc: 'Enjoy clear WebRTC-powered meetings with integrated live chat and dynamic participant presence status indicators.'
              },
              {
                icon: Bot,
                color: '#a855f7',
                bg: 'rgba(168, 85, 247, 0.08)',
                border: 'rgba(168, 85, 247, 0.15)',
                title: 'AI transcripts & summaries',
                desc: 'Generate smart summaries, meeting details, and full transcriptions powered by OpenAI integration instantly.'
              },
              {
                icon: CheckSquare,
                color: '#14b8a6',
                bg: 'rgba(20, 184, 166, 0.08)',
                border: 'rgba(20, 184, 166, 0.15)',
                title: 'Auto task extraction',
                desc: 'Surfaces tasks, assignees, and deadlines automatically, creating cards on your personalized task board.'
              },
              {
                icon: BarChart3,
                color: '#f59e0b',
                bg: 'rgba(245, 158, 17, 0.08)',
                border: 'rgba(245, 158, 17, 0.15)',
                title: 'Team productivity analytics',
                desc: 'Explore meeting distributions, task completion progress charts, and active performance contributors.'
              }
            ].map(({ icon: Icon, color, bg, border, title, desc }) => (
              <div
                key={title}
                className="feature-card bg-slate-900/20 border border-slate-800/80 p-8 rounded-2xl flex flex-col sm:flex-row items-start gap-5 cursor-default"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{ background: bg, border: `1px solid ${border}`, color }}>
                  <Icon size={20} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-white text-base">{title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO VIDEO SECTION ── */}
      <section id="demo" className="py-24 bg-slate-950/40 border-y border-slate-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-500">Product Tour</span>
          <h2 className="text-3xl lg:text-4xl font-black text-white mt-2 mb-10">See IntellMeet in action</h2>
          
          {/* Video Placeholder Container */}
          <div 
            onClick={() => setIsVideoModalOpen(true)}
            className="demo-video-thumb aspect-video rounded-2xl border border-blue-900/30 overflow-hidden shadow-2xl relative flex items-center justify-center group cursor-pointer"
          >
            {/* Fake Thumbnail elements */}
            <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center filter blur-[2px]" />
            <div className="absolute inset-0 bg-slate-950/80" />

            {/* Blurred UI mock in background */}
            <div className="absolute w-[200px] h-[100px] rounded-lg bg-blue-500/5 border border-blue-500/10 backdrop-blur-md -top-6 -right-6 pointer-events-none" />
            <div className="absolute w-[180px] h-[90px] rounded-lg bg-purple-500/5 border border-purple-500/10 backdrop-blur-md -bottom-8 -left-8 pointer-events-none" />

            {/* Play Button Icon */}
            <div className="relative z-10 w-20 h-20 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-110"
                 style={{ boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)' }}>
              <Play size={28} className="text-white ml-1.5" fill="white" />
            </div>

            {/* Details overlay */}
            <div className="absolute bottom-4 left-6 text-left">
              <span className="text-xs text-slate-400 font-medium">Watch 2 min summary video</span>
            </div>
          </div>
          <p className="text-slate-500 text-xs mt-4">Full interactive demo coming soon</p>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="py-12 border-t border-blue-900/25 bg-slate-950/60 relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center">
            <div>
              <div className="text-3xl font-black text-white">2x</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wide">Faster follow-ups</div>
            </div>
            <div className="hidden md:block h-8 w-px bg-slate-800 mx-auto" />
            <div>
              <div className="text-3xl font-black text-white">100%</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wide">Auto-transcribed</div>
            </div>
            <div className="hidden md:block h-8 w-px bg-slate-800 mx-auto" />
            <div>
              <div className="text-3xl font-black text-white">0</div>
              <div className="text-xs text-slate-400 mt-1 uppercase tracking-wide">Manual notes needed</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-blue-950 p-12 rounded-3xl text-center relative overflow-hidden glow-blue">
            <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />

            <div className="relative space-y-6 max-w-xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-black text-white">
                Ready to run smarter meetings?
              </h2>
              <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                Empower your squad with automatic action tracking, smart notes, and seamless WebRTC collaboration.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button
                  onClick={() => navigate('/register')}
                  className="px-8 py-3.5 rounded-xl text-white font-bold text-sm transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-blue-500/10 cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
                >
                  Get Started Free
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-3.5 rounded-xl font-bold text-sm border border-slate-700 text-slate-200 hover:bg-slate-800/40 hover:border-slate-500 transition-all duration-300 cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-900 py-12 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600">
              <Video size={16} className="text-white" />
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-sm">IntellMeet</div>
              <div className="text-[10px] text-slate-500">AI-Powered Meeting Insights</div>
            </div>
          </div>

          <div className="flex gap-6">
            {['About', 'Features', 'Privacy', 'Contact'].map(link => (
              <a key={link} href="#" className="text-xs text-slate-500 hover:text-white transition-colors">{link}</a>
            ))}
          </div>

          <div className="text-xs text-slate-600 text-center md:text-right">
            © 2026 IntellMeet. All rights reserved.<br />
            <span className="text-[10px] text-slate-700">Built for Zidio Development.</span>
          </div>
        </div>
      </footer>

      {/* ── DEMO VIDEO MODAL ── */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
            <button 
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-950/50 p-2 rounded-full cursor-pointer z-10 transition-colors"
            >
              <X size={18} />
            </button>
            <div className="aspect-video w-full relative flex flex-col items-center justify-center p-8 text-center bg-slate-950">
              <div className="w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center mb-4 text-blue-500">
                <Sparkles size={28} className="animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">IntellMeet Interactive Video Guide</h3>
              <p className="text-xs text-slate-400 max-w-md">
                We are currently processing the finalized workflow footage. You can immediately get started by creating or scheduling a live meeting above.
              </p>
              <button 
                onClick={() => { setIsVideoModalOpen(false); navigate('/register') }}
                className="mt-6 px-6 py-2.5 rounded-lg text-white font-semibold text-xs shadow-md cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
              >
                Sign Up & Test Live
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
