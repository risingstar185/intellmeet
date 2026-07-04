import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import api from '../config/api'
import EmptyState from '../components/EmptyState'
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton'
import {
  Plus,
  Users,
  TrendingUp,
  Clock,
  Zap,
  Calendar,
  ChevronRight,
  Play,
  Bot,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  Sparkles
} from 'lucide-react'

interface DashboardStats {
  totalMeetings: number
  totalTasks: number
  totalUsers: number
  aiTimeSaved: number
}
const getStatCards =  (stats: DashboardStats)=>  [
  {
    label: 'Total Meetings',
    value: stats.totalMeetings,
    change: '↑12% this month',
    positive: true,
    icon: Calendar,
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.1)',
  },
  {
    label: 'Tasks Completed',
    value: stats.totalTasks,
    change: '↑8% this month',
    positive: true,
    icon: TrendingUp,
    color: '#14b8a6',
    bg: 'rgba(20, 184, 166, 0.1)',
  },
  {
    label: 'AI Time Saved',
    value: `${stats.aiTimeSaved} hrs`,
    change: '↑23% this month',
    positive: true,
    icon: Zap,
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.1)',
  },
  {
    label: 'Team Members',
    value: stats.totalUsers,
    change: 'Active',
    positive: true,
    icon: Users,
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.1)',
  },
];


interface Meeting {
  _id: string
  title: string
  scheduledAt: string
  duration?: number
  participants?: string[]
  status?: string
}
interface LatestSummary {
  meeting: {
    _id: string
    title: string
    summary: string
  }
}

function getMeetingStatus(scheduledAt: string, duration = 60) {
  const now = new Date()
  const start = new Date(scheduledAt)
  const end = new Date(start.getTime() + duration * 60 * 1000)

  if (now >= start && now <= end) return 'LIVE'
  if (now < start) return 'UPCOMING'
  return 'PAST'
}

function formatMeetingTime(scheduledAt: string) {
  const date = new Date(scheduledAt)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const isToday = date.toDateString() === today.toDateString()
  const isTomorrow = date.toDateString() === tomorrow.toDateString()

  const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

  if (isToday) return `Today ${timeStr}`
  if (isTomorrow) return `Tomorrow ${timeStr}`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ` ${timeStr}`
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    LIVE: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', label: '● LIVE' },
    UPCOMING: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', label: 'UPCOMING' },
    PAST: { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', label: 'PAST' },
  }[status] ?? { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', label: status }

  return (
    <span
      className="px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide"
      style={{ color: config.color, background: config.bg }}
    >
      {config.label}
    </span>
  )
}

export default function DashboardPage() {

 const [stats, setStats] = useState<DashboardStats>({
  totalMeetings: 0,
  totalTasks: 0,
  totalUsers: 0,
  aiTimeSaved: 0,
})

const fetchStats = async () => {
  try {
    const res = await api.get("/count/stats");
    setStats(res.data);
  //  console.log('time',res.data)
  } catch (err) {
    console.log(err);
  }
};

useEffect(() => {
  fetchStats();
}, []);

  const navigate = useNavigate()
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const userName = localStorage.getItem('userName') || 'User'
  const firstName = userName.split(' ')[0]

  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [meetingsLoading, setMeetingsLoading] = useState(true)
  const [meetingsError, setMeetingsError] = useState<string | null>(null)
const [summary, setSummary] = useState<LatestSummary | null>(null)
//console.log('summary', summary);
const summaryPoints =
  summary?.meeting?.summary
    ?.split(". ")
    .filter(Boolean) || [];

  const fetchMeetings = useCallback(async () => {
    setMeetingsLoading(true)
    setMeetingsError(null)
    try {
      const res = await api.get('/meetings')
      const data = Array.isArray(res.data) ? res.data : res.data?.meetings ?? []
      setMeetings(data)
    } catch (err: any) {
      setMeetingsError('Could not load meetings.')
    } finally {
      setMeetingsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMeetings()
  }, [fetchMeetings])

const fetchLatestSummary = useCallback(async () => {
  try {
    const res = await api.get('/meetings/latest-summary');
    const latestSummary = res.data;
    //console.log('Latest Summary:', latestSummary);
setSummary(res.data); // Assuming the response has a 'summary' field

  } catch (err) {
    console.error('Error fetching latest summary:', err);
  }
}, []);

useEffect(() => {
  fetchLatestSummary();
}, [fetchLatestSummary]);


  const hour = new Date().getHours();

let greeting = "Good Evening";

if (hour < 12) {
  greeting = "Good Morning";
} else if (hour < 17) {
  greeting = "Good Afternoon";
} else if (hour < 21) {
  greeting = "Good Evening";
} else {
  greeting = "Good Night";
}

const statCards = getStatCards(stats);

  return (
<div
  className="flex min-h-screen w-full overflow-x-hidden"
  style={{ background: '#0a0f1a' }}
>
  <div className="hidden lg:block no-print">
  <Sidebar />
</div>

      {/* Main Content */}
 <main className="flex-1 min-h-screen lg:ml-64 w-full">
        {/* Style block for transitions & glow */}
        <style>{`
          .dashboard-card {
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(12px);
            transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          }
          .dashboard-card:hover {
            transform: translateY(-4px);
            border-color: rgba(59, 130, 246, 0.3);
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.12);
          }
          .glow-btn-blue {
            transition: all 0.3s ease;
          }
          .glow-btn-blue:hover {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
          }
        `}</style>

        {/* Header */}
        <div
          className="sticky top-0 z-30 px-8 py-5 flex items-center justify-between border-b"
          style={{ background: 'rgba(10, 15, 26, 0.85)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255, 255, 255, 0.06)' }}
        >
          <div>
            <h1 className="text-2xl font-bold text-white">{greeting}, {firstName} 👋</h1>
            <p className="text-sm text-slate-400 mt-0.5">{today}</p>
          </div>
          <button
            id="new-meeting-btn"
            onClick={() => navigate('/schedule-meeting')}
            className="glow-btn-blue flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-sm hover:scale-[1.02] active:scale-[0.98] shadow-lg cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
          >
            <Plus size={16} />
            New Meeting
          </button>
        </div>

        {/* Main Content Area */}
        <div className="px-8 py-6 space-y-6 flex-1">
          {meetingsLoading ? (
            <DashboardSkeleton />
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {statCards.map(({ label, value, change, icon: Icon, color, bg }, i) => (
                  <div
                    key={label}
                    className="dashboard-card rounded-2xl p-6 cursor-default"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                        <Icon size={18} style={{ color }} />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-900/30 text-emerald-400">
                        <ArrowUpRight size={11} />
                        <span>{change}</span>
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-white mb-0.5">{value}</div>
                    <div className="text-sm text-slate-400">{label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Meetings Card */}
                <div className="xl:col-span-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
                      <h2 className="font-bold text-white text-base">Upcoming Meetings</h2>
                      <div className="flex items-center gap-2.5">
                        <button
                          id="refresh-meetings-btn"
                          onClick={fetchMeetings}
                          disabled={meetingsLoading}
                          className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors disabled:opacity-40 cursor-pointer"
                          title="Refresh"
                        >
                          <RefreshCw size={13} className={meetingsLoading ? 'animate-spin' : ''} />
                        </button>
                        <button
                          onClick={() => navigate('/schedule-meeting')}
                          className="text-xs font-bold hover:text-blue-400 transition-colors cursor-pointer text-blue-500"
                        >
                          + Schedule
                        </button>
                      </div>
                    </div>

                    {/* Error state */}
                    {meetingsError && (
                      <div className="flex flex-col items-center justify-center py-10 gap-3 text-center px-6">
                        <AlertCircle size={22} className="text-red-500" />
                        <p className="text-sm text-slate-400">{meetingsError}</p>
                        <button
                          onClick={fetchMeetings}
                          className="text-xs font-semibold px-4 py-2 rounded-lg border border-slate-700 text-slate-200 hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    {/* Empty state */}
                    {!meetingsError && meetings.length === 0 && (
                      <div className="p-8">
                        <EmptyState 
                          icon={Calendar}
                          title="No upcoming meetings"
                          description="Get started by scheduling your first meeting."
                          actionLabel="Schedule a Meeting"
                          actionPath="/schedule-meeting"
                        />
                      </div>
                    )}

                    {/* Meeting list */}
                    {!meetingsError && meetings.length > 0 && (
                      <div className="divide-y divide-white/5">
                        {meetings.slice(0, 6).map((m, i) => {
                          const status = getMeetingStatus(m.scheduledAt, m.duration)
                          const isPast = status === 'PAST'
                          const timeStr = formatMeetingTime(m.scheduledAt)
                          const participantCount = m.participants?.length ?? 0

                          return (
                            <div
                              key={m._id}
                              className="px-6 py-4.5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors group"
                            >
                              <div className="flex-1 min-w-0">
                                <div
                                  className={`font-semibold text-sm truncate ${isPast ? 'text-slate-500' : 'text-slate-200'}`}
                                >
                                  {m.title}
                                </div>
                                <div className="flex items-center gap-3 mt-1.5">
                                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                                    <Clock size={11} className="text-slate-500" />
                                    {timeStr}
                                  </span>
                                  {participantCount > 0 && (
                                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                                      <Users size={11} className="text-slate-500" />
                                      {participantCount} participant{participantCount !== 1 ? 's' : ''}
                                    </span>
                                  )}
                                  {m.duration && (
                                    <span className="text-xs text-slate-500">
                                      {m.duration >= 60 ? `${m.duration / 60}h` : `${m.duration}m`}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <StatusBadge status={status} />
                                <button
                                  id={`join-meeting-${i}`}
                                  onClick={() => !isPast && navigate(`/meeting/${m._id}`)}
                                  disabled={isPast}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all duration-200 ${
                                    isPast
                                      ? 'opacity-30 cursor-not-allowed bg-slate-800'
                                      : 'hover:opacity-95 hover:scale-[1.03] active:scale-[0.97] cursor-pointer bg-blue-600'
                                  }`}
                                >
                                  <Play size={10} fill="white" />
                                  Join
                                </button>
                          <button   onClick={() => navigate(`/meetings/${m._id}`)}  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg cursor-pointer">
  Details
</button>
                    
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Summary Card */}
                <div className="bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl overflow-hidden flex flex-col justify-between" style={{ borderLeft: '4px solid #3b82f6' }}>
                  <div className="p-6 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Sparkles size={16} className="text-blue-500" />
                        <h2 className="font-bold text-white text-base">Recent AI Summary</h2>
                      </div>
                      <p className="text-xs text-slate-400 mb-5 flex items-center gap-1">
                        <span className="font-semibold text-slate-300">{summary?.meeting?.title}</span>
                        <span>— Yesterday</span>
                      </p>

                      <ul className="space-y-4">
  {summaryPoints.map((point, i) => (
    <li key={i} className="flex items-start gap-2.5">
      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-blue-500" />
      <p className="text-xs text-slate-300 leading-relaxed">
        {point}
      </p>
    </li>
  ))}
</ul>
                    </div>

                    <button
                      id="view-summary-btn"
        onClick={() =>
  navigate(`/post-meeting/${summary?.meeting?._id}`)
}
                      className="w-full flex items-center justify-center gap-2 py-2.5 mt-6 rounded-xl text-xs font-bold transition-all duration-200 border border-blue-500/20 text-blue-400 hover:bg-blue-500/10 cursor-pointer"
                    >
                      View Full Summary
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions / Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'My Tasks', desc: `${stats.totalTasks} pending action items`, color: '#14b8a6', path: '/tasks' },
                  { label: 'Past Meetings', desc: `${stats.totalMeetings} recordings available`, color: '#3b82f6', path: '/meetings' },
                  { label: 'Team Analytics', desc: 'View productivity insights', color: '#f59e0b', path: '/analytics' },
                    { label: 'Setting', desc: 'View  Profile', color: '#0bf5ca', path: '/settings' },
                ].map(({ label, desc, color, path }) => (
                  <button
                    key={label}
                    onClick={() => navigate(path)}
                    className="dashboard-card text-left p-5 rounded-2xl cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-white group-hover:text-blue-400 transition-colors">{label}</span>
                      <ChevronRight
                        size={14}
                        className="text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{desc}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
