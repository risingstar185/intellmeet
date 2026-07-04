import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Video,
  CheckSquare,
  BarChart3,
  Settings,
  Bot,
  LogOut,
  CalendarPlus,
} from 'lucide-react'
import api from '../config/api'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: CalendarPlus, label: 'Schedule', path: '/schedule-meeting' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: Video, label: 'Meetings History', path: '/meetings' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const userName = localStorage.getItem('userName') || 'User'
  const role = localStorage.getItem('role') || 'Product Manager'
  const initials = localStorage.getItem('initials') || (userName !== 'User' ? userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : 'U') || 'U'
const handleLogout = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");

    await api.post("/auth/logout", {
      refreshToken,
    });

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    navigate("/login");
  } catch (err) {
    console.error(err);

    // Agar API fail bhi ho jaye to user ko logout kar do
    localStorage.clear();
    navigate("/login");
  }
};

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col z-40 border-r" style={{ background: '#0d1420', borderColor: 'rgba(255,255,255,0.06)' }}>
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-600/20 text-blue-400 border border-blue-500/25">
          <Bot size={18} />
        </div>
        <div>
          <span className="text-white font-bold text-base leading-none">IntellMeet</span>
          <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-0.5">AI-Powered</div>
        </div>
      </div>

      {/* Nav Section */}
      <nav className="flex-1 px-3 py-5 flex flex-col gap-1 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path || (label === 'Dashboard' && location.pathname === '/dashboard')
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              className={`w-full flex items-center px-3 py-2.5 rounded-xl text-left transition-all duration-150 group cursor-pointer border-l-2 ${
                isActive
                  ? 'text-white font-medium bg-blue-600/15 border-blue-500'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
              }`}
            >
              <Icon 
                size={18} 
                className={`mr-3 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300 transition-colors'}`} 
              />
              <span className="text-xs">{label}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              )}
            </button>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-blue-300 flex-shrink-0 bg-blue-600/30">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{userName}</div>
            <div className="text-[10px] text-slate-500 truncate">{role}</div>
          </div>
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-red-400 transition-colors flex-shrink-0 cursor-pointer"
            title="Log Out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
