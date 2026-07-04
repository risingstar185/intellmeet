import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from '../config/api'
import { useNavigate } from "react-router-dom";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Meeting {
  _id: string;
  title: string;
  hostId: User;
  participantEmails: string[];
  transcript: string;
  summary: string;
  recordingUrl: string;
  status: string;
  scheduledAt: string;
  duration: number;
  createdAt: string;
}

const MeetingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeeting();
  }, []);

  const fetchMeeting = async () => {
    try {
      const res = await api.get(`/meetings/${id}`);
      setMeeting(res.data);
      //console.log('meeting',res.data)
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
const handleDelete = async () => {

  const confirmDelete = window.confirm(
    "Are you sure you want to delete this meeting?"
  );

  if (!confirmDelete) return;

  try {
    await api.delete(`/meetings/${id}`);

    alert("Meeting deleted successfully");

    navigate("/meetings"); // Meeting list page
  } catch (error) {
    console.error(error);
    alert("Failed to delete meeting");
  }
};
  
  if (loading) {
    return <h2 className="text-center mt-10">Loading...</h2>;
  }

  if (!meeting) {
    return <h2 className="text-center mt-10">Meeting not found</h2>;
  }
return (
<div className="min-h-screen bg-[#0F172A] py-10 px-6">
    <div className="max-w-6xl mx-auto bg-[#1E293B] rounded-3xl shadow-2xl border border-gray-700 overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 p-8">
    <h1 className="text-4xl font-bold text-white">
        {meeting.title}
    </h1>

    <p className="text-blue-100 mt-2">
        📅 {new Date(meeting.scheduledAt).toLocaleString()}
    </p>
  <button
  onClick={handleDelete}
  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg transition"
>
  Delete
</button>
</div>


<div className="p-8 bg-[#111827]">

        {/* Meeting Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="bg-[#1F2937] rounded-2xl p-6 border border-gray-700 shadow-lg hover:shadow-blue-500/10 transition">
            <h2 className="text-2xl font-bold text-white mb-6">
    Meeting Information
</h2>

            <div className="space-y-3">

              <div>
                <span className="text-white font-bold">
                  Host
                </span>
                <p className="text-white">{meeting.hostId?.name}</p>
              </div>

              <div>
                <span className="text-white font-bold">
                  Host Email
                </span>
                <p className="text-white">{meeting.hostId?.email}</p>
              </div>

              <div>
                <span className="text-white font-bold">
                  Status
                </span>

                <span
                  className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium
                    ${
                      meeting.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : meeting.status === "live"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                >
                  {meeting.status}
                </span>
              </div>

              <div>
                <span className="text-white font-bold">
                  Duration
                </span>
                <p className="text-white ">{meeting.duration} Minutes</p>
              </div>

            </div>
          </div>

          {/* Participants */}
          <div className="bg-[#1F2937] rounded-2xl p-6 border border-gray-700 shadow-lg hover:shadow-blue-500/10 transition">
            <h2 className="text-lg text-white font-bold mb-4">
              Participants By Email
            </h2>

            {meeting.participantEmails.length > 0 ? (
              <div className="space-y-3">
                {meeting.participantEmails.map((email) => (
                  <div
                    key={email}
                    className=" rounded-lg  py-3 text-green-400 "
                  >
                    {email}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                No Participants Added
              </p>
            )}
          </div>

        </div>
{/* Summary */}
        <div className="mt-8 bg-[#1F2937] rounded-xl p-6 shadow-sm">
          <h2 className="text-xl  mb-3 text-white font-bold">
            Meeting Description
          </h2>

          <p className="text-white leading-7">
            {meeting.description || "No Description available."}
          </p>
        </div>
    
        
      </div>
    </div>
  </div>
);
}

export default MeetingDetailsPage;