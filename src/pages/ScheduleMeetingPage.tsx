import { useState ,useEffect} from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import api from '../config/api'
import { toast } from 'react-hot-toast'
import {
  Calendar,
  Clock,
  Users,
  FileText,
  AlignLeft,
  X,
  Loader2,
  Timer,
  ChevronRight,
} from 'lucide-react'

const DURATION_OPTIONS = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
]

interface FormData {
  title: string
  date: string
  time: string
  duration: number
    participantEmails: string[] 
  description: string
}

interface FormErrors {
  title?: string
  date?: string
  time?: string
  duration?: string
  participantEmails?: string
}

export default function ScheduleMeetingPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
const [users, setUsers] = useState([]);




const fetchUsers = async () => {
  const res = await api.get("count/users");
  setUsers(res.data);
};
useEffect(() => {
  fetchUsers();
}, []);


  const todayStr = new Date().toISOString().split('T')[0]
  const nowTime = new Date().toTimeString().slice(0, 5)

  const [form, setForm] = useState<FormData>({
    title: '',
    date: todayStr,
    time: nowTime,
    duration: 60,
    participantEmails: [],
    description: '',
  })

  function validate(): boolean {
    const errs: FormErrors = {}

    if (!form.title.trim()) errs.title = 'Meeting title is required'
    else if (form.title.trim().length < 3) errs.title = 'Title must be at least 3 characters'

    if (!form.date) errs.date = 'Date is required'

    if (!form.time) errs.time = 'Time is required'
    else {
      const selectedDT = new Date(`${form.date}T${form.time}`)
      if (selectedDT < new Date()) errs.time = 'Meeting time cannot be in the past'
    }

    if (!form.duration) errs.duration = 'Please select a duration'

   if (form.participantEmails.length === 0) {
  errs.participantEmails = "Select at least one participant";
}

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {

      const scheduledAt = new Date(`${form.date}T${form.time}`).toISOString()

      await api.post('/meetings/schedule', {
        title: form.title.trim(),
        scheduledAt,
        duration: form.duration,
        participantEmails: form.participantEmails,  // ✅
        description: form.description.trim(),
      })

      toast.success('Meeting scheduled successfully! Redirecting…')
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to schedule meeting. Please try again.'
      setErrors({ title: msg })
    } finally {
      setLoading(false)
    }
  }
function handleChange(
  field: keyof FormData,
  value: string | number | string[]
) {
  setForm((prev) => ({
    ...prev,
    [field]: value,
  }));

  if (errors[field as keyof FormErrors]) {
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
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
<main className="flex-1 min-h-screen lg:ml-64 w-full">
        {/* Style block for glow */}
        <style>{`
          .glow-btn-blue {
            transition: all 0.3s ease;
          }
          .glow-btn-blue:hover {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.45);
          }
        `}</style>

        {/* Header Breadcrumbs */}
        <div
         className="sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-4 border-b border-white/5 flex flex-col sm:flex-row gap-4 sm:gap-0 sm:items-center sm:justify-between"
          style={{ background: 'rgba(10, 15, 26, 0.85)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255, 255, 255, 0.06)' }}
        >
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <button
              onClick={() => navigate('/dashboard')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Dashboard
            </button>
            <ChevronRight size={12} className="text-gray-600" />
            <span className="text-gray-400">Schedule Meeting</span>
          </div>
        </div>

        <div className="px-8 py-8 max-w-3xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold mb-3 border border-blue-500/30 text-blue-400 bg-blue-500/10"
            >
              <Calendar size={11} />
              New Meeting
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Schedule a Meeting</h1>
            <p className="text-gray-400 text-sm">Set up your next team meeting with all the details below.</p>
          </div>

          {/* Form Card */}
          <form onSubmit={handleSubmit} noValidate>
            <div 
              className="backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl border" 
              style={{ background: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.08)' }}
            >
              {/* Top Accent Line */}
              <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-purple-600" />

              <div className="p-8 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="meeting-title">
                    <span className="flex items-center gap-2">
                      <FileText size={13} className="text-blue-500" />
                      Meeting Title <span className="text-red-400">*</span>
                    </span>
                  </label>
                  <input
                    id="meeting-title"
                    type="text"
                    placeholder="e.g. Q3 Product Roadmap Review"
                    value={form.title}
                    onChange={e => handleChange('title', e.target.value)}
                    className={`w-full px-4 min-h-[52px] rounded-xl border text-sm text-white placeholder-gray-600 outline-none transition-all duration-200 bg-white/5 focus:ring-2 ${
                      errors.title
                        ? 'border-red-500/50 focus:ring-red-500/20'
                        : 'border-white/10 focus:ring-blue-500/20 focus:border-blue-500'
                    }`}
                  />
                  {errors.title && (
                    <p className="mt-1.5 text-xs font-semibold flex items-center gap-1 text-red-400">
                      <X size={11} /> {errors.title}
                    </p>
                  )}
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="meeting-date">
                      <span className="flex items-center gap-2">
                        <Calendar size={13} className="text-blue-500" />
                        Date <span className="text-red-400">*</span>
                      </span>
                    </label>
                    <input
                      id="meeting-date"
                      type="date"
                      value={form.date}
                      min={todayStr}
                      onChange={e => handleChange('date', e.target.value)}
                      className={`w-full px-4 min-h-[52px] rounded-xl border text-sm text-white outline-none transition-all duration-200 bg-white/5 focus:ring-2 ${
                        errors.date
                          ? 'border-red-500/50 focus:ring-red-500/20'
                          : 'border-white/10 focus:ring-blue-500/20 focus:border-blue-500'
                      }`}
                    />
                    {errors.date && (
                      <p className="mt-1.5 text-xs font-semibold flex items-center gap-1 text-red-400">
                        <X size={11} /> {errors.date}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="meeting-time">
                      <span className="flex items-center gap-2">
                        <Clock size={13} className="text-blue-500" />
                        Time <span className="text-red-400">*</span>
                      </span>
                    </label>
                    <input
                      id="meeting-time"
                      type="time"
                      value={form.time}
                      onChange={e => handleChange('time', e.target.value)}
                      className={`w-full px-4 min-h-[52px] rounded-xl border text-sm text-white outline-none transition-all duration-200 bg-white/5 focus:ring-2 ${
                        errors.time
                          ? 'border-red-500/50 focus:ring-red-500/20'
                          : 'border-white/10 focus:ring-blue-500/20 focus:border-blue-500'
                      }`}
                    />
                    {errors.time && (
                      <p className="mt-1.5 text-xs font-semibold flex items-center gap-1 text-red-400">
                        <X size={11} /> {errors.time}
                      </p>
                    )}
                  </div>
                </div>

                {/* Duration pills */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    <span className="flex items-center gap-2">
                      <Timer size={13} className="text-blue-500" />
                      Duration <span className="text-red-400">*</span>
                    </span>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {DURATION_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        id={`duration-${opt.value}`}
                        onClick={() => handleChange('duration', opt.value)}
                        className={`px-3 py-3 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${
                          form.duration === opt.value
                            ? 'text-white border-blue-600 bg-blue-600'
                            : 'text-gray-400 border-white/10 hover:border-slate-500 hover:text-white bg-white/5'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

          <div>
  <label className="block text-sm font-medium text-gray-400 mb-2">
    Participants
  </label>
<select
  multiple
  value={form.participantEmails}
  onChange={(e) => {
    const values = Array.from(
      e.target.selectedOptions,
      option => option.value
    );

    handleChange("participantEmails", values);
  }}
  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white h-40"
>
  {users.map((user: any) => (
    <option
      key={user._id}
      value={user.email}
      className="bg-slate-900 border px-2 py-2 rounded text-green-400"
    >
      {user.name} ({user.email})
    </option>
  ))}
</select>
  <p className="text-xs text-gray-400 mt-2">
    Hold Ctrl (Windows) / Cmd (Mac) to select multiple users.
  </p>
</div>
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="meeting-description">
                    <span className="flex items-center gap-2">
                      <AlignLeft size={13} className="text-blue-500" />
                      Description
                      <span className="text-[10px] font-normal text-slate-500 lowercase">(optional)</span>
                    </span>
                  </label>
                  <textarea
                    id="meeting-description"
                    rows={3}
                    placeholder="Share the agenda or any relevant context…"
                    value={form.description}
                    onChange={e => handleChange('description', e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-white/10 text-sm text-white placeholder-gray-600 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none bg-white/5"
                  />
                </div>
              </div>

              {/* Form Actions Footer */}
              <div className="px-8 py-5 border-t border-white/5 flex items-center justify-between bg-white/[0.02]">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-400 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all duration-150 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="schedule-meeting-submit"
                  type="submit"
                  disabled={loading}
                  className="glow-btn-blue flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-xs transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer bg-blue-600 hover:bg-blue-500"
                >
                  {loading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      Scheduling…
                    </>
                  ) : (
                    <>
                      <Calendar size={13} />
                      Schedule Meeting
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Info note */}
          <p className="text-center text-xs text-slate-600 mt-5">
            A calendar invite will be sent to all participants automatically.
          </p>
        </div>
      </main>
    </div>
  )
}
