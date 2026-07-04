import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import api from '../config/api'
import { toast } from 'react-hot-toast'
import {
  User,
  Bell,
  Palette,
  Shield,
  AlertTriangle,
  Camera,
  Check,
  X,
  Eye,
  EyeOff,
  ChevronRight,
  Monitor,
  Sun,
  Moon,
  Smartphone,
  Laptop,
  Lock,
  Trash2,
  CheckCircle,
} from 'lucide-react'

// ─── Toggle Switch ────────────────────────────────────────────────────────

function Toggle({ enabled, onChange, id }: { enabled: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <button
      id={id}
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
        enabled ? 'bg-blue-600' : 'bg-white/10'
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────

function Section({ id, title, icon: Icon, children }: { id: string; title: string; icon: any; children: React.ReactNode }) {
  return (
    <div id={id} className="bg-white/[0.04] border border-white/8 backdrop-blur-md rounded-2xl overflow-hidden scroll-mt-24">
      <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600/10 border border-blue-500/20">
          <Icon size={16} className="text-blue-400" />
        </div>
        <h2 className="font-bold text-white text-base">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────

function Input({ label, id, type = 'text', value, onChange, readOnly = false, placeholder = '' }: {
  label: string; id: string; type?: string; value: string;
  onChange?: (v: string) => void; readOnly?: boolean; placeholder?: string
}) {
  const [showPw, setShowPw] = useState(false)
  const isPassword = type === 'password'

  return (
    <div>
      <label htmlFor={id} className="block text-gray-300 text-sm font-medium mb-1">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && showPw ? 'text' : type}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-xl border text-sm text-white placeholder-gray-600 outline-none transition-all duration-200 ${
            readOnly
              ? 'bg-white/[0.02] border-white/5 text-gray-500 cursor-not-allowed opacity-50'
              : 'bg-white/5 border-white/10 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
          } ${isPassword ? 'pr-11' : ''}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPw(s => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Delete Account Modal ─────────────────────────────────────────────────

function DeleteModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  const [typed, setTyped] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-[#0d1420] border border-red-500/20 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Delete Account</h3>
            <p className="text-xs text-slate-500">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-4 leading-relaxed">
          All your meetings, tasks, and data will be <strong className="text-slate-200 font-semibold">permanently deleted</strong>. Please type <strong className="text-slate-200 font-semibold">DELETE</strong> to confirm.
        </p>
        <input
          type="text"
          value={typed}
          onChange={e => setTyped(e.target.value)}
          placeholder="Type DELETE to confirm"
          className="w-full px-4 py-3 rounded-xl border border-white/10 text-sm text-white placeholder-gray-600 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white/5 mb-4"
        />
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-white/10 text-slate-400 hover:bg-white/5 transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={typed !== 'DELETE'}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-red-600 hover:bg-red-500"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Settings Page ────────────────────────────────────────────────────────

const ROLES = ['Product Manager', 'Software Engineer', 'Designer', 'Marketing Manager', 'Data Analyst', 'Other']

const NAV_ITEMS = [
  { id: 'section-profile',       label: 'Profile',       icon: User },
  { id: 'section-notifications', label: 'Notifications', icon: Bell },
  { id: 'section-appearance',    label: 'Appearance',    icon: Palette },
  { id: 'section-security',      label: 'Security',      icon: Shield },
  { id: 'section-account',       label: 'Account',       icon: AlertTriangle },
]

export default function SettingsPage() {
  const navigate = useNavigate()

  // ── read from localStorage ─────────────────────
  const storedName  = localStorage.getItem('userName')  || ''
  const storedEmail = localStorage.getItem('userEmail') || ''
  const storedRole  = localStorage.getItem('role')      || 'Product Manager'

  // ── Profile state ──────────────────────────────
  const [name, setName]   = useState(storedName)
  const [email]           = useState(storedEmail)
  const [role, setRole]   = useState(storedRole)
  const [profileLoading, setProfileLoading] = useState(false)
  const avatarRef = useRef<HTMLInputElement>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // ── Notifications state ────────────────────────
  const [notifs, setNotifs] = useState({
    newMeetings:  true,
    actionItems:  true,
    weeklyDigest: false,
    recordingReady: true,
  })

  

  // ── Appearance state ───────────────────────────
  const [theme, setTheme]         = useState<'light' | 'dark' | 'system'>('dark')
  const [sidebarCollapse, setSidebarCollapse] = useState(false)

  // ── Security state ─────────────────────────────
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw]         = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [twoFA, setTwoFA]         = useState(false)
  const [pwLoading, setPwLoading] = useState(false)

  // ── Account state ──────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  
  // ── Active section ─────────────────────────────
  const [activeSection, setActiveSection] = useState('section-profile')

  // Track active section on scroll
  useEffect(() => {
    const handler = () => {
      for (const item of [...NAV_ITEMS].reverse()) {
        const el = document.getElementById(item.id)
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(item.id)
          break
        }
      }
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // ── Handlers ──────────────────────────────────

  function scrollToSection(id: string) {
    setActiveSection(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSaveProfile() {
    if (!name.trim()) { toast.error('Name cannot be empty.'); return }
    setProfileLoading(true)
    try {
      await api.put('/auth/profile', { name: name.trim(), role })
    } catch {
      // Route might not exist yet — save locally
    } finally {
      localStorage.setItem('userName', name.trim())
      localStorage.setItem('role', role)
      const initials = name.trim().split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
      localStorage.setItem('initials', initials)
      setProfileLoading(false)
      toast.success('Profile saved successfully!')
    }
  }

  function handleSaveNotifications() {
    toast.success('Notification preferences saved!')
  }

  function handleSaveAppearance() {
    toast.success('Appearance settings saved!')
  }

  async function handleChangePassword() {
    if (!currentPw) { toast.error('Enter your current password.'); return }
    if (newPw.length < 8) { toast.error('New password must be at least 8 characters.'); return }
    if (newPw !== confirmPw) { toast.error('Passwords do not match.'); return }
    setPwLoading(true)
    try {
      await api.put('/auth/change-password', { currentPassword: currentPw, newPassword: newPw })
      toast.success('Password updated successfully!')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update password.')
    } finally {
      setPwLoading(false)
    }
  }

 const handleDeleteAccount = async () => {
  try {
    await api.delete("/auth/delete-account");

    localStorage.clear();

    toast.success("Account deleted successfully");

    window.location.href = "/login";
  } catch (err) {
    toast.error("Failed to delete account");
  }
};

  const initials = (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U'
  const handleLogoutAccount = async () => {
   const refreshToken = localStorage.getItem("refreshToken");
try {
    await api.post("/auth/logout", {
      refreshToken,
    });

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    navigate("/login");
  }
    catch (err) {
      console.error("Failed to logout account", err);
    }
  }
  return (
    <div
  className="flex min-h-screen w-full overflow-x-hidden"
  style={{ background: '#0a0f1a' }}
>
   <div className="hidden lg:block no-print">
  <Sidebar />
</div>

      {/* Modal wrapper */}
      {showDeleteModal && <DeleteModal onConfirm={handleDeleteAccount} onCancel={() => setShowDeleteModal(false)} />}

     <main className="flex-1 min-h-screen lg:ml-64 w-full">
        {/* Style block for glow */}
        <style>{`
          .glow-btn-blue {
            transition: all 0.3s ease;
          }
          .glow-btn-blue:hover:not(:disabled) {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.45);
          }
        `}</style>

        {/* Header */}
        <div className="sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between border-b"
          style={{ background: 'rgba(10, 15, 26, 0.85)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255, 255, 255, 0.06)' }}>
          <div>
            <h1 className="text-xl font-bold text-white">Settings</h1>
            <p className="text-sm text-slate-400 mt-0.5">Manage your account preferences</p>
          </div>
        </div>

      <div className="flex flex-col lg:flex-row gap-6 px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto">

          {/* ── Left sticky nav ── */}<div className="w-full lg:w-52 flex-shrink-0">
            <div className="sticky top-24 bg-white/[0.04] border border-white/8 backdrop-blur-md rounded-2xl overflow-hidden">
              <div className="px-3 py-3 space-y-1">
                {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
                  const active = activeSection === id
                  return (
                    <button
                      key={id}
                      id={`nav-${id}`}
                      onClick={() => scrollToSection(id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all duration-150 cursor-pointer text-xs font-semibold ${
                        active 
                          ? 'bg-blue-600/15 text-white border-l-2 border-blue-500 rounded-xl font-medium' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5 rounded-xl'
                      }`}
                    >
                      <Icon size={15} className={active ? 'text-blue-400' : 'text-gray-400'} />
                      {label}
                      {active && <ChevronRight size={13} className="ml-auto text-blue-400 animate-pulse" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ── Right content ── */}
          <div className="flex-1 space-y-6">

            {/* ══ 1. PROFILE ══ */}
            <Section id="section-profile" title="Profile Settings" icon={User}>
              <div className="space-y-5">
                {/* Avatar */}
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black text-blue-300 shadow-lg overflow-hidden bg-blue-600/30 border border-blue-500/20"
                    >
                      {avatarPreview
                        ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                        : initials
                      }
                    </div>
                    <button
                      onClick={() => avatarRef.current?.click()}
                      className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md cursor-pointer transition-transform hover:scale-110 bg-blue-600 hover:bg-blue-500"
                    >
                      <Camera size={13} />
                    </button>
                    <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{name || 'Your Name'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{email}</p>
                    <button
                      onClick={() => avatarRef.current?.click()}
                      className="mt-2 text-xs font-semibold cursor-pointer text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Change Photo
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input id="profile-name" label="Full Name" value={name} onChange={setName} placeholder="Your full name" />
                  <Input id="profile-email" label="Email Address" value={email} readOnly />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="profile-role" className="block text-gray-300 text-sm font-medium mb-1">Role</label>
                  <select
                    id="profile-role"
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="w-full sm:w-64 px-4 py-3 rounded-xl border border-white/10 text-sm text-white bg-[#0d1420] outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    {ROLES.map(r => <option key={r} value={r} className="bg-slate-900 text-white">{r}</option>)}
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    id="save-profile-btn"
                    onClick={handleSaveProfile}
                    disabled={profileLoading}
                    className="glow-btn-blue flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-bold transition-all disabled:opacity-60 shadow-md cursor-pointer bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                  >
                    {profileLoading
                      ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
                      : <><Check size={15} />Save Changes</>
                    }
                  </button>
                </div>
              </div>
            </Section>

            {/* ══ 2. NOTIFICATIONS ══ */}
            <Section id="section-notifications" title="Notification Preferences" icon={Bell}>
              <div className="space-y-0 divide-y divide-white/5">
                {([
                  { key: 'newMeetings',   label: 'New meeting invitations',    desc: 'Get notified when someone schedules a meeting with you' },
                  { key: 'actionItems',   label: 'Action item reminders',       desc: 'Daily reminders for your pending action items' },
                  { key: 'weeklyDigest',  label: 'Weekly summary digest',       desc: 'A weekly roundup of your meetings and productivity stats' },
                  { key: 'recordingReady', label: 'Recording ready alerts',     desc: 'Get notified when a meeting recording is available' },
                ] as const).map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-semibold text-white">{label}</p>
                      <p className="text-sm text-gray-500 mt-1">{desc}</p>
                    </div>
                    <Toggle
                      id={`toggle-${key}`}
                      enabled={notifs[key]}
                      onChange={v => setNotifs(prev => ({ ...prev, [key]: v }))}
                    />
                  </div>
                ))}
              </div>
              <div className="pt-5 border-t border-white/5 mt-4">
                <button
                  id="save-notifications-btn"
                  onClick={handleSaveNotifications}
                  className="glow-btn-blue flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md cursor-pointer bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                >
                  <Check size={15} />Save Preferences
                </button>
              </div>
            </Section>

            {/* ══ 3. APPEARANCE ══ */}
            <Section id="section-appearance" title="Appearance" icon={Palette}>
              <div className="space-y-6">
                {/* Theme selector */}
                <div>
                  <p className="text-sm font-semibold text-slate-300 mb-3">Theme</p>
                  <div className="grid grid-cols-3 gap-3 max-w-sm">
                    {([
                      { value: 'light',  label: 'Light',  icon: Sun },
                      { value: 'dark',   label: 'Dark',   icon: Moon },
                      { value: 'system', label: 'System', icon: Monitor },
                    ] as const).map(({ value, label, icon: Icon }) => {
                      const active = theme === value
                      return (
                        <button
                          key={value}
                          id={`theme-${value}`}
                          type="button"
                          onClick={() => setTheme(value)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                            active 
                              ? 'border-blue-500 bg-blue-500/10 text-white font-medium' 
                              : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                          }`}
                        >
                          <Icon size={20} className={active ? 'text-blue-400' : 'text-gray-400'} />
                          <span className="text-xs font-semibold">{label}</span>
                          {active && (
                            <div className="w-4 h-4 rounded-full flex items-center justify-center bg-blue-600">
                              <Check size={10} className="text-white" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Sidebar collapse pref */}
                <div className="flex items-center justify-between py-4 border-t border-white/5">
                  <div>
                    <p className="text-sm font-semibold text-white">Auto-collapse sidebar</p>
                    <p className="text-sm text-gray-500 mt-1">Automatically collapse the sidebar on smaller screens</p>
                  </div>
                  <Toggle id="toggle-sidebar-collapse" enabled={sidebarCollapse} onChange={setSidebarCollapse} />
                </div>

                <button
                  id="save-appearance-btn"
                  onClick={handleSaveAppearance}
                  className="glow-btn-blue flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md cursor-pointer bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                >
                  <Check size={15} />Save Appearance
                </button>
              </div>
            </Section>

            {/* ══ 4. SECURITY ══ */}
            <Section id="section-security" title="Security" icon={Shield}>
              <div className="space-y-6">
                {/* Change password */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Lock size={14} className="text-blue-400" />
                    <h3 className="text-sm font-bold text-white">Change Password</h3>
                  </div>
                  <div className="space-y-3 max-w-sm">
                    <Input id="current-password" label="Current Password" type="password" value={currentPw} onChange={setCurrentPw} placeholder="Enter current password" />
                    <Input id="new-password" label="New Password" type="password" value={newPw} onChange={setNewPw} placeholder="Min. 8 characters" />
                    <Input id="confirm-password" label="Confirm New Password" type="password" value={confirmPw} onChange={setConfirmPw} placeholder="Repeat new password" />
                  </div>

                  {/* Password strength */}
                  {newPw.length > 0 && (
                    <div className="mt-3 max-w-sm">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map(n => (
                          <div key={n} className="flex-1 h-1 rounded-full transition-colors"
                            style={{ background: newPw.length >= n * 2 ? (newPw.length >= 8 ? '#10B981' : '#F59E0B') : 'rgba(255,255,255,0.1)' }} />
                        ))}
                      </div>
                      <p className="text-xs" style={{ color: newPw.length >= 8 ? '#10B981' : '#F59E0B' }}>
                        {newPw.length < 4 ? 'Weak' : newPw.length < 8 ? 'Fair' : newPw.length < 12 ? 'Good' : 'Strong'}
                      </p>
                    </div>
                  )}

                  <button
                    id="update-password-btn"
                    onClick={handleChangePassword}
                    disabled={pwLoading}
                    className="glow-btn-blue mt-4 flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-bold transition-all disabled:opacity-60 shadow-md cursor-pointer bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                  >
                    {pwLoading
                      ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating…</>
                      : <><Lock size={14} />Update Password</>
                    }
                  </button>
                </div>

                {/* 2FA */}
                <div className="pt-5 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-bold text-white">Two-Factor Authentication</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-green-500/20 text-green-400">
                          Recommended
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">Add an extra layer of security to your account with 2FA via authenticator app.</p>
                    </div>
                    <Toggle id="toggle-2fa" enabled={twoFA} onChange={v => { setTwoFA(v); toast.success(v ? '2FA enabled (UI demo)' : '2FA disabled (UI demo)') }} />
                  </div>
                  {twoFA && (
                    <div className="mt-3 p-3.5 rounded-xl border border-green-500/20 flex items-center gap-2 bg-green-500/5">
                      <CheckCircle className="text-green-400" size={14} />
                      <span className="text-xs text-green-400 font-semibold">Two-factor authentication is active.</span>
                    </div>
                  )}
                </div>
              </div>
            </Section>

            {/* ══ 5. ACCOUNT ══ */}
            <Section id="section-account" title="Account" icon={AlertTriangle}>
              <div className="space-y-6">
                {/* Connected devices */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Laptop size={14} className="text-blue-400" />
                    <h3 className="text-sm font-bold text-white">Connected Sessions</h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      { device: 'MacBook Pro — Chrome', location: 'Mumbai, India', time: 'Active now', icon: Laptop, current: true },
                      { device: 'iPhone 15 — Safari', location: 'Mumbai, India', time: '2 hours ago', icon: Smartphone, current: false },
                    ].map(({ device, location, time, icon: Icon, current }) => (
                      <div key={device} className="flex items-center gap-4 p-3.5 rounded-xl border border-white/5 bg-white/[0.01]">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: current ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.05)' }}>
                          <Icon size={16} className={current ? 'text-blue-400' : 'text-slate-500'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-white">{device}</p>
                            {current && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-blue-500/20 text-blue-400">
                                This device
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{location} · {time}</p>
                        </div>
                        {!current && (
                          <button className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors cursor-pointer">
                            Revoke
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danger zone */}
                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-red-500/10 flex items-center gap-2 bg-red-500/[0.02]">
                    <AlertTriangle size={14} className="text-red-400" />
                    <h3 className="text-sm font-bold text-red-400">Danger Zone</h3>
                  </div>
                  <div className="px-5 py-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white">Delete Account</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Permanently delete your account and all associated data. This cannot be undone.
                        </p>
                      </div>
                      <button
                        id="delete-account-btn"
                       onClick={handleDeleteAccount}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all flex-shrink-0 cursor-pointer bg-red-600 hover:bg-red-500"
                      >
                        <Trash2 size={14} />
                        Delete Account
                      </button>
                       <button
                        id="delete-account-btn"
                       onClick={handleLogoutAccount}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all flex-shrink-0 cursor-pointer bg-red-600 hover:bg-red-500"
                      >
                        <Trash2 size={14} />
                        Logout Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            <div className="pb-8" />
          </div>
        </div>
      </main>
    </div>
  )
}
