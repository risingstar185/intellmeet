import { useState,useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../config/api'
import {
  BarChart3,
  Clock,
  Calendar,
  Zap,
  ArrowUpRight,
  TrendingUp,
  Award,
  Users
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'

interface Contributor {
  id: string;
  name: string;
  role: string;
  initials: string;
  meetings: number;
  tasks: number;
  efficiency: string;
  color?: string;
} 
interface MeetingChart {
  day: string;
  meetings: number;
}

interface TimeSavedChart {
  week: string;
  saved: number;
}
interface Stats {
  avgDuration: number;
  totalMeetings: number;
  aiTimeSaved: number;
  taskCompletionRate: number;
}
function getEfficiencyStyle(effStr: string) {
  const value = parseInt(effStr.replace('%', ''), 10)
  if (value >= 90) return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' }
  if (value >= 80) return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' }
  return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('This Month')

 const [stats, setStats] = useState<Stats>({
  avgDuration: 0,
  totalMeetings: 0,
  aiTimeSaved: 0,
  taskCompletionRate: 0,
});
console.log(stats)
const fetchStats = async () => {
  try {
    const res = await api.get("/count/stats");
    setStats(res.data);
  //  console.log(res.data)
  } catch (err) {
    console.log(err);
  }
};

useEffect(() => {
  fetchStats();
}, []);

const [meetingsData, setMeetingsData] = useState<MeetingChart[]>([]);
const [timeSavedData, setTimeSavedData] =
  useState<TimeSavedChart[]>([]);
const [contributors, setContributors] = useState<Contributor[]>([]);

const fetchContributors = async () => {
  try {
    const res = await api.get("/count/contributors");
    setContributors(res.data);
        //console.log('hello',res.data);
  } catch (err) {
    console.log(err);
  }
};

useEffect(() => {
  fetchContributors();
}, []); 

useEffect(() => {
  fetchAITimeSaved();
}, []);

const fetchAITimeSaved = async () => {
  try {
    const res = await api.get("/count/ai-chart");
    setTimeSavedData(res.data);
  } catch (err) {
    console.log(err);
  }
};
const fetchMeetingChart = async () => {
  try {
    const res = await api.get("/count/chart");
    setMeetingsData(res.data);
  } catch (err) {
    console.log(err);
  }
};
useEffect(() => {
  fetchMeetingChart();
}, []);
  return (
    <div
  className="flex min-h-screen w-full overflow-x-hidden"
  style={{ background: '#0a0f1a' }}
>
   <div className="hidden lg:block">
  <Sidebar />
</div>

      {/* Main Content */}
    <main className="flex-1 min-h-screen lg:ml-64 w-full">
        {/* Style block for glow */}
        <style>{`
          .analytics-card {
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(12px);
            transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          }
          .analytics-card:hover {
            transform: translateY(-4px);
            border-color: rgba(59, 130, 246, 0.3);
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.12);
          }
        `}</style>

        {/* Header */}
        <div className="sticky top-0 z-30 px-8 py-5 flex items-center justify-between border-b" style={{ background: 'rgba(10, 15, 26, 0.85)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255, 255, 255, 0.06)' }}>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-500" />
              Team Analytics
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Real-time productivity insights and meeting metrics</p>
          </div>
          <div className="flex items-center gap-2">
            {['This Week', 'This Month', 'Q2 Roadmap'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  timeRange === range
                    ? 'text-white bg-blue-600 shadow-lg'
                    : 'text-gray-400 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Avg Duration Card */}
            <div className="analytics-card rounded-2xl p-6 cursor-default">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10 border border-blue-500/20">
                  <Clock size={18} className="text-blue-400" />
                </div>
                <span className="flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-955/40 border border-emerald-900/30 text-emerald-400">
                  <ArrowUpRight size={11} />
                  -2m vs last mo
                </span>
              </div>
              <div className="text-3xl font-extrabold text-white mb-0.5">{stats.avgDuration} mins</div>
              <div className="text-sm text-gray-400">Average Meeting Duration</div>
            </div>

            {/* Total Meetings Card */}
            <div className="analytics-card rounded-2xl p-6 cursor-default">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/10 border border-cyan-500/20">
                  <Calendar size={18} className="text-cyan-400" />
                </div>
                <span className="flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-955/40 border border-emerald-900/30 text-emerald-400">
                  <ArrowUpRight size={11} />
                  +12% vs last mo
                </span>
              </div>
              <div className="text-3xl font-extrabold text-white mb-0.5">{stats.totalMeetings}</div>
              <div className="text-sm text-gray-400">Total Meetings This Month</div>
            </div>

            {/* AI Time Saved Card */}
            <div className="analytics-card rounded-2xl p-6 cursor-default">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
                  <Zap size={18} className="text-emerald-400" />
                </div>
                <span className="flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-955/40 border border-emerald-900/30 text-emerald-400">
                  <ArrowUpRight size={11} />
                  +23% vs last mo
                </span>
              </div>
              <div className="text-3xl font-extrabold text-white mb-0.5">{stats.aiTimeSaved} hrs</div>
              <div className="text-sm text-gray-400">AI Time Saved</div>
            </div>

            {/* Collaboration Index */}
            <div className="analytics-card rounded-2xl p-6 cursor-default">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/10 border border-amber-500/20">
                  <TrendingUp size={18} className="text-amber-400" />
                </div>
                <span className="flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-955/40 border border-emerald-900/30 text-emerald-400">
                  Active
                </span>
              </div>
              <div className="text-3xl font-extrabold text-white mb-0.5">{stats.taskCompletionRate}</div>
              <div className="text-sm text-gray-400">Task Completion Rate</div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Meetings Bar Chart */}
            <div 
              className="backdrop-blur-md rounded-2xl border p-6 flex flex-col h-[350px]" 
              style={{ background: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.08)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-white">Total Meetings (Mon-Sun)</h2>
                  <p className="text-xs text-gray-400">Total frequency distribution across weekdays</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg">
                  <BarChart3 size={12} />
                  Distribution
                </div>
              </div>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={meetingsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#60a5fa" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip
                      cursor={{ fill: 'rgba(59, 130, 246, 0.04)' }}
                      contentStyle={{ background: '#0d1420', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#FFFFFF', fontSize: 11 }}
                      itemStyle={{ color: '#3b82f6', fontSize: 11 }}
                    />
                    <Bar dataKey="meetings" name="Meetings" fill="url(#barGradient)" radius={[6, 6, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Time Saved Line Chart */}
            <div 
              className="backdrop-blur-md rounded-2xl border p-6 flex flex-col h-[350px]" 
              style={{ background: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.08)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-white">AI Time Saved (Week 1-4)</h2>
                  <p className="text-xs text-gray-400">Total estimated hours saved by auto-transcriptions</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg">
                  <Zap size={12} />
                  Efficiency Gain
                </div>
              </div>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSavedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: '#0d1420', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#FFFFFF', fontSize: 11 }}
                      itemStyle={{ color: '#3b82f6', fontSize: 11 }}
                    />
                    <Area type="monotone" dataKey="saved" name="Hours Saved" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#areaGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top Contributors Card */}
          <div 
            className="backdrop-blur-md rounded-2xl border overflow-hidden shadow-2xl" 
            style={{ background: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.08)' }}
          >
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-white text-base flex items-center gap-2">
                  <Award size={18} className="text-amber-400" />
                  Top Team Contributors
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Most active team members based on attendance and task completions</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold bg-white/5 border border-white/5 px-3 py-1 rounded-lg">
                <Users size={12} className="text-gray-400" />
                Active contributors
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-white/[0.01] border-b border-white/5">
                    <th className="px-6 py-4 font-semibold text-gray-400 text-xs uppercase tracking-wider">Member</th>
                    <th className="px-6 py-4 font-semibold text-gray-400 text-xs uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 font-semibold text-gray-400 text-xs uppercase tracking-wider text-center">Meetings Attended</th>
                    <th className="px-6 py-4 font-semibold text-gray-400 text-xs uppercase tracking-wider text-center">Tasks Completed</th>
                    <th className="px-6 py-4 font-semibold text-gray-400 text-xs uppercase tracking-wider">Efficiency Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {contributors.map((c, i) => {
                    const es = getEfficiencyStyle(c.efficiency)
                    return (
                      <tr key={i} className="hover:bg-white/5 transition-all">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                            style={{ background: c.color }}
                          >
                            {c.initials}
                          </div>
                          <span className="font-semibold text-white">{c.name}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-400">{c.role}</td>
                        <td className="px-6 py-4 font-bold text-gray-300 text-center">{c.meetings}</td>
                        <td className="px-6 py-4 font-bold text-gray-300 text-center">{c.tasks}</td>
                        <td className="px-6 py-4">
                          <span 
                            className="px-2.5 py-0.5 rounded-lg text-xs font-bold" 
                            style={{ color: es.color, background: es.bg }}
                          >
                            {c.efficiency}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
