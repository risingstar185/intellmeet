import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../config/api";
import Sidebar from "../components/Sidebar";
import {
  Calendar,
  Clock,
  Search,
  FileText,
  ChevronRight,
  Video,
} from "lucide-react";

interface Meeting {
  _id: string;
  title: string;
  scheduledAt: string;
  duration?: number;
  status?: string;
}

export default function Meetings() {
  const navigate = useNavigate();

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get("/meetings");

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.meetings || [];

      setMeetings(data);
    } catch (err) {
      setError("Failed to load meetings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const filtered = meetings.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden"   style={{ background: '#0a0f1a' }}>
 <div className="hidden lg:block no-print">
  <Sidebar />
</div>
  <div
  className="
    flex-1
    lg:ml-72
    px-4
    sm:px-6
    lg:px-8
    py-6
    sm:py-10
  "
>

        {/* Header */}

       <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

          <div>

      <h1 className="text-3xl md:text-4xl text-white font-bold">
              Meeting History
            </h1>

            <p className="text-slate-400 mt-2">
              View all your completed and scheduled meetings
            </p>

          </div>

      <div className="bg-blue-600 rounded-xl px-4 py-3 w-full md:w-auto flex items-center justify-between md:justify-center gap-3">

            <p className="text-bold  text-xl text-blue-100">
              Total Meetings
            </p>

            <h2 className=" text-xl text-white  font-bold">
              {meetings.length}
            </h2>

          </div>

        </div>

        {/* Search */}

        <div className="relative mb-8">

          <Search
            size={18}
            className="absolute left-4 top-4 text-slate-500"
          />

          <input
            type="text"
            placeholder="Search meeting..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 text-white rounded-xl pl-12 pr-4 py-4 outline-none border border-slate-700 focus:border-blue-500"
          />

        </div>

        {loading && (
          <div className="text-center py-20">
            Loading meetings...
          </div>
        )}

        {error && (
          <div className="text-center text-red-400 py-20">
            {error}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-24">

            <Video
              size={70}
              className="mx-auto text-slate-500 mb-4"
            />

            <h2 className="text-2xl font-semibold">
              No Meetings Found
            </h2>

            <p className="text-slate-400 mt-2">
              Schedule a meeting to get started.
            </p>

          </div>
        )}

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

          {filtered.map((meeting) => (

            <div
              key={meeting._id}
              onClick={() => {
if (meeting.status === "completed") {
navigate(`/post-meeting/${meeting._id}`);
}
}}
              className="cursor-pointer bg-slate-800 hover:bg-slate-700 transition rounded-2xl p-6 border border-slate-700 hover:border-blue-500"
            >

              <div className="flex justify-between items-center mb-5">

                <FileText
                  className="text-blue-500"
                  size={24}
                />

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold
                  ${
                    meeting.status === "completed"
                      ? "bg-green-500/20 text-green-400"
                      : meeting.status === "live"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {meeting.status || "scheduled"}
                </span>

              </div>

              <h2 className="text-xl text-white font-bold mb-5">
                {meeting.title}
              </h2>

              <div className="space-y-3 text-sm text-slate-300">

                <div className="flex items-center gap-2">

                  <Calendar size={16} />

                  {new Date(
                    meeting.scheduledAt
                  ).toLocaleDateString()}

                </div>

                <div className="flex items-center gap-2">

                  <Clock size={16} />

                  {new Date(
                    meeting.scheduledAt
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}

                </div>

                <div>

                  Duration : {meeting.duration || 0} min

                </div>

              </div>

          <button
  disabled={meeting.status !== "completed"}
  onClick={(e) => {
    e.stopPropagation();

    if (meeting.status === "completed") {
      navigate(`/post-meeting/${meeting._id}`);
    }
  }}
  className={`mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition

${
meeting.status === "completed"
? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
: "bg-slate-700 text-slate-400 cursor-not-allowed"
}`}
>

{meeting.status === "completed"
? "View Summary"
: meeting.status === "live"
? "Meeting is Live"
: "Meeting Not Completed"}

<ChevronRight size={18}/>
</button>

            </div>

          ))}
          <p onClick={()=>navigate('/dashboard')} className="text-center text-red-400 col-span-full cursor-pointer hover:text-red-500 transition mt-4">
           Back To dashboard
          </p>

        </div>

      </div>

    </div>
  );
}