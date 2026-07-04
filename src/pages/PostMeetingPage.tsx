import { useState,useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import api from '../config/api'
import { toast } from 'react-hot-toast'

import {
  Bot,
  Download,
  Share2,
  Calendar,
  Clock,
  Users,
  CheckSquare,
  Square,
  ChevronLeft,
  Quote,
  AlertCircle,
  Sparkles,
  Loader2,
  X,
  ClipboardList,
  User,
  CalendarDays,
  Flag,
} from 'lucide-react'

interface ActionItem {
  task: string
  assignee: string
  initials: string
  color: string
  due: string
  priority: string
  done: boolean
}

interface AIActionItem {
  task: string
  assignee: string
  deadline: string
  priority: string // "high" | "medium" | "low"
}

interface Highlight {
  quote: string
  speaker: string
  time: string
}

interface MeetingData {
  title: string
  date: string
  duration: string
  participantsText: string
  summary: string[]
  actionItems: ActionItem[]
  highlights: Highlight[]
}

const meetingDataa = {
  highlights: [
    {
      quote: "We need to finalize the API documentation before the client demo next week.",
      speaker: "Arjun Sharma",
      time: "00:12:34",
    },
    {
      quote: "The budget approval has been confirmed by the finance team.",
      speaker: "Sneha Patel",
      time: "00:38:21",
    },
    {
      quote: "Let's move forward with the new design system across all platforms.",
      speaker: "Rahul Verma",
      time: "01:02:15",
    },
  ],
};


const priorityConfig: Record<string, { label: string; className: string }> = {
  HIGH:   { label: 'HIGH',   className: 'bg-red-500/20 text-red-400 border border-red-500/30' },
  high:   { label: 'HIGH',   className: 'bg-red-500/20 text-red-400 border border-red-500/30' },
  MEDIUM: { label: 'MEDIUM', className: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
  medium: { label: 'MEDIUM', className: 'bg-amber-500/20 text-amber-400 border border-amber-500/30' },
  LOW:    { label: 'LOW',    className: 'bg-green-500/20 text-green-400 border border-green-500/30' },
  low:    { label: 'LOW',    className: 'bg-green-500/20 text-green-400 border border-green-500/30' },
}

// ─── AI Analysis Panel ──────────────────────────────────────────────────────

interface AIResult {
  summary: string
  actionItems: AIActionItem[]
}

function AIAnalysisPanel() {
  const [transcript, setTranscript] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AIResult | null>(null)
  const [error, setError] = useState<string | null>(null)
const [meetingData, setMeetingData] = useState(null);
 const { id } = useParams()

useEffect(() => {
  const fetchMeeting = async () => {
    const res = await api.get(`/meetings/${id}`);
//console.log('Fetched meeting data for AI analysis:', res.data);
    setMeetingData(res.data.meeting);

    // Transcript textarea me aa jayega
   setTranscript(res.data.transcript);
  };

  fetchMeeting();
}, [id]);
  async function handleAnalyze() {
    if (!transcript.trim() || transcript.trim().length < 10) {
      setError('Please paste a transcript with at least 10 characters.')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await api.post('/ai/analyze', { transcript })
      setResult(res.data)
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        'Failed to connect to AI service. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    setTranscript('')
    setResult(null)
    setError(null)
  }

  const summaryLines = result?.summary
    ? result.summary.split('\n').filter(l => l.trim())
    : []

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg border border-white/8 bg-white/[0.04] backdrop-blur-md">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between bg-blue-600">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white text-base">AI Meeting Analysis</h2>
            <p className="text-blue-200 text-xs">Powered by GPT-3.5 Turbo</p>
          </div>
        </div>
        {result && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      <div className="p-6 space-y-4">
        {/* Transcript input */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2" htmlFor="ai-transcript">
            Meeting Transcript
          </label>
          <textarea
            id="ai-transcript"
            rows={6}
            value={transcript}
            
            onChange={e => { setTranscript(e.target.value); setError(null) }}
            placeholder="Paste your meeting transcript here...&#10;&#10;Example:&#10;Alice: Let's discuss the Q3 roadmap. Bob needs to send the design files by Friday.&#10;Bob: Sure, I'll also prepare the budget breakdown, it's high priority.&#10;Alice: Great. Mark will follow up with the client by next Monday."
            className="w-full px-4 py-3 rounded-xl border border-white/10 text-sm text-gray-300 placeholder-gray-600 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none font-mono leading-relaxed bg-white/5"
          />
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs text-gray-500">
              {transcript.trim().length > 0 ? `${transcript.trim().length} characters` : 'Min. 10 characters required'}
            </span>
            {transcript.length > 0 && (
              <button
                type="button"
                onClick={() => setTranscript('')}
                className="text-xs text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                Clear text
              </button>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-400" />
            <p className="text-sm font-medium text-red-400">{error}</p>
          </div>
        )}

        {/* Analyze button */}
        <button
          id="ai-analyze-btn"
          onClick={handleAnalyze}
          disabled={loading || transcript.trim().length < 10}
          className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.99] shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              AI is analyzing…
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Analyze with AI
            </>
          )}
        </button>

        {/* Results */}
        {result && (
          <div className="space-y-5 pt-2">
            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Results</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* Summary */}
            <div className="rounded-xl overflow-hidden border border-white/10 bg-white/[0.02]">
              <div className="px-4 py-3 flex items-center gap-2 border-b border-white/5 bg-blue-600/10">
                <Bot size={15} className="text-blue-400" />
                <h3 className="font-bold text-white text-sm">AI Summary</h3>
              </div>
              <div className="p-4 space-y-2.5">
                {summaryLines.length > 0 ? (
                  summaryLines.map((line, i) => (
                    <div key={i} className="flex gap-3">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-white font-bold bg-blue-600"
                        style={{ fontSize: '10px' }}
                      >
                        {i + 1}
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {line.replace(/^[•\-*]\s*/, '')}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{result.summary}</p>
                )}
              </div>
            </div>

            {/* Action Items */}
            {result.actionItems && result.actionItems.length > 0 && (
              <div className="rounded-xl overflow-hidden border border-white/10 bg-white/[0.02]">
                <div className="px-4 py-3 flex items-center justify-between border-b border-white/5 bg-blue-600/10">
                  <div className="flex items-center gap-2">
                    <ClipboardList size={15} className="text-blue-400" />
                    <h3 className="font-bold text-white text-sm">Extracted Action Items</h3>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-400">
                    {result.actionItems.length} item{result.actionItems.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="divide-y divide-white/5">
                  {result.actionItems.map((item, i) => {
                    const pc = priorityConfig[item.priority] || priorityConfig['MEDIUM']
                    return (
                      <div key={i} className="px-4 py-3.5 hover:bg-white/5 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-semibold text-sm text-white leading-snug flex-1">{item.task}</p>
                          <span className={`px-2 py-0.5 rounded-md text-xs font-bold flex-shrink-0 ${pc.className}`}>
                            {pc.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className="flex items-center gap-1.5 text-xs text-gray-400">
                            <User size={11} className="text-gray-500" />
                            {item.assignee}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-gray-400">
                            <CalendarDays size={11} className="text-gray-500" />
                            {item.deadline}
                          </span>
                          <span className={`flex items-center gap-1.5 text-xs font-medium`}>
                            <Flag size={11} />
                            {pc.label} priority
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


// ─── Main Page ──────────────────────────────────────────────────────────────


export default function PostMeetingPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [meetingData, setMeetingData] = useState<any>(null);
const [loading, setLoading] = useState(true);
const [loadingSummary, setLoadingSummary] = useState(false);
const handleGenerateSummary = async () => {
  try {
    setLoadingSummary(true);

    const res = await api.post(
      `/transcript/${id}/generate-summary`
    );
//console.log('Generated summary:', res.data.summary);
    setMeetingData((prev) => ({
      ...prev,
    summary: res.data.meeting.summary
    }));
  } catch (error) {
    console.error(error);
    toast.error("Failed to generate summary");
  } finally {
    setLoadingSummary(false);
  }
};
 const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});


const fetchMeeting = async () => {
    try {

        const res = await api.get(`/meetings/${id}`);

        setMeetingData(res.data);
       /// console.log('Fetched meeting data:', res.data);

    } catch (err) {
        toast.error("Failed to load meeting");
    } finally {
        setLoading(false);
    }
};



  const toggleItem = (i: number) => {
    setCheckedItems(prev => ({ ...prev, [i]: !prev[i] }))
  }
useEffect(() => {
    fetchMeeting();
}, [id]);
  useEffect(() => {

    if (meetingData?.actionItems) {

        const checked = meetingData.actionItems.reduce(

            (acc: any, item: any, index: number) => {

                acc[index] = item.done;

                return acc;

            },

            {}
        );

        setCheckedItems(checked);

    }

}, [meetingData]);
if (loading) {
    return (
        <div className="text-white flex justify-center items-center h-screen">
            Loading...
        </div>
    )
}
  const handleExportPDF = () => {
    window.print()
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/meeting/${id}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'IntellMeet Meeting Summary',
          text: 'Check out this meeting summary',
          url: shareUrl,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
try {
     await navigator.clipboard.writeText(shareUrl)
        alert('Link copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy link:', err)
      }
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
        {/* Style block for glow and print */}
        <style>{`
          .glow-btn-blue {
            transition: all 0.3s ease;
          }
          .glow-btn-blue:hover:not(:disabled) {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.45);
          }
          @media print {
            .no-print {
              display: none !important;
            }
            main {
              margin-left: 0 !important;
              padding: 0 !important;
            }
          }
        `}</style>

        {/* Header */}
        <div className="sticky top-0 z-30 px-8 py-4 border-b border-white/5 flex items-center justify-between" style={{ background: 'rgba(10, 15, 26, 0.85)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center gap-3">
            <button
              id="back-to-dashboard"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
              Back to Dashboard
            </button>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span>Meeting Complete</span>
            </div>
          </div>
          <div className="flex items-center gap-2 no-print">
            <button
              id="export-pdf-btn"
              onClick={handleExportPDF}
              className="no-print flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <Download size={14} />
              Export PDF
            </button>
            <button
              id="share-btn"
              onClick={handleShare}
              className="no-print glow-btn-blue flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer bg-blue-600 hover:bg-blue-500"
            >
              <Share2 size={14} />
              Share
            </button>
          </div>
        </div>

        <div className="px-8 py-6 max-w-4xl mx-auto space-y-6">
          {/* Meeting Header */}
          <div className="border-b border-white/5 pb-4 mb-2">
            <h1 className="text-3xl font-bold text-white mb-2">{meetingData.title} — Meeting Summary</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
  <Calendar size={14} className="text-gray-500" />
  {meetingData.scheduledAt
    ? new Date(meetingData.scheduledAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "N/A"}
</span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-gray-500" />
                Duration: {meetingData.duration}
              </span>
            <span className="flex items-center gap-1.5">
  <Users size={14} className="text-gray-500" />
  {meetingData.participantEmails?.length || 0} Participants
</span>
            </div>
          </div>

         {/* AI Summary */}
<div className="bg-[rgba(59,130,246,0.05)] border border-blue-500/30 rounded-2xl p-6 backdrop-blur-md">
  <div className="flex items-center gap-2 mb-4">
    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/20">
      <Bot size={16} className="text-blue-400" />
    </div>

    <div>
      <h2 className="font-bold text-white text-base">
        🤖 AI Generated Summary
      </h2>
      <p className="text-xs text-blue-400 mt-0.5">
        Powered by IntellMeet AI
      </p>
    </div>
  </div>
<button
        onClick={handleGenerateSummary}
        disabled={loadingSummary}
        className="w-fit px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm font-medium transition"
      >
        {loadingSummary
          ? "Generating Summary..."
          : "Generate Summary"}
      </button>
  {meetingData.summary ? (
    <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
      {meetingData.summary}
    </p>
  ) : (
    <div className="flex flex-col gap-4">
      <p className="text-gray-500 italic">
        AI summary not generated yet.
      </p>

      
    </div>
  )}
</div>
<div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 mt-6">
  <h2 className="text-lg font-semibold text-white mb-4">
    Action Items
  </h2>

  {meetingData.actionItems?.length > 0 ? (
    <div className="space-y-4">
      {meetingData.actionItems.map((item, index) => (
        <div
          key={index}
          className="bg-white/[0.05] border border-white/10 rounded-xl p-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-white font-medium">
              {item.task}
            </h3>

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                item.priority === "high"
                  ? "bg-red-500/20 text-red-400"
                  : item.priority === "medium"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-green-500/20 text-green-400"
              }`}
            >
              {item.priority.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div>
              <p className="text-gray-400">Assignee</p>
              <p className="text-white">
                {item.assigneeName || "Unassigned"}
              </p>
            </div>

            <div>
              <p className="text-gray-400">Deadline</p>
              <p className="text-white">
                {item.deadline
                  ? new Date(item.deadline).toLocaleDateString()
                  : "No Deadline"}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-400">No action items available.</p>
  )}
</div>
        
          {/* AI Analysis Panel */}
          <AIAnalysisPanel />
<div className="bg-white/[0.04] border border-white/8 backdrop-blur-md rounded-2xl p-6">
  <div className="flex items-center gap-2 pb-4 border-b border-white/5 mb-4">
    <Quote size={18} className="text-blue-400" />
    <h2 className="font-bold text-white text-base">
      Transcript Highlights
    </h2>
  </div>

  <div className="space-y-4">
    {meetingDataa.highlights.map((h, i) => (
      <div
        key={i}
        className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border-l-[3px] border-blue-500"
      >
        <AlertCircle
          size={16}
          className="flex-shrink-0 mt-1 text-blue-400"
        />

        <div>
          <p className="text-sm text-gray-300 italic mb-2">
            "{h.quote}"
          </p>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 font-semibold">
              — {h.speaker}
            </span>

            <span className="text-xs text-slate-500 font-mono">
              {h.time}
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
          {/* Bottom CTA */}
          <div className="flex justify-center pb-6 no-print">
            <button
              onClick={() => navigate('/dashboard')}
              className="glow-btn-blue flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all cursor-pointer bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
            >
              <ChevronLeft size={16} />
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
