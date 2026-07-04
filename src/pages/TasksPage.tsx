import { useState ,useEffect} from 'react'
import Sidebar from '../components/Sidebar'
import { Plus, Tag, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
type Priority = 'HIGH' | 'MEDIUM' | 'LOW'
type Status = 'todo' | 'inprogress' | 'done'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'; 
import api from '../config/api'

interface Task {
  id: string;
  title: string;
  priority: Priority;
  status: Status;
  assignee: string;
  initials: string;
  color: string;
  source: string;
}


const priorityConfig: Record<Priority, { color: string; bg: string; border: string }> = {
  HIGH: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.3)' },
  MEDIUM: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)', border: 'rgba(245, 158, 11, 0.3)' },
  LOW: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)', border: 'rgba(16, 185, 129, 0.3)' },
}


const columnConfig = {
  todo: {
    label: 'TO DO',
    dotColor: '#94a3b8',
    headerBg: 'rgba(255,255,255,0.03)',
    badgeBg: 'bg-white/10 text-slate-300',
  },
  inprogress: {
    label: 'IN PROGRESS',
    dotColor: '#3b82f6',
    headerBg: 'rgba(59, 130, 246, 0.08)',
    badgeBg: 'bg-blue-500/20 text-blue-400',
  },
  done: {
    label: 'DONE',
    dotColor: '#10b981',
    headerBg: 'rgba(16, 185, 129, 0.08)',
    badgeBg: 'bg-green-500/20 text-green-400',
  },
}

  const userName = localStorage.getItem('userName') || 'User'

 const deleteTask = async (id: string) => {
  try {
    await api.delete(`/tasks/${id}`);

    toast.success("Task deleted successfully");

    // UI update
  ///setTask((prev) => prev.filter((task) => task.id !== id));
  } catch (error) {
    console.error(error);
    toast.error("Failed to delete task");
  }
};
function TaskCard({
  task,
  isDone,
}: {
  task: Task;
  isDone: boolean;
  onDelete: (id: string) => void;
}) {
  const pc = priorityConfig[task.priority];

  return (
    <div
      className={`bg-white/5 border border-white/8 rounded-xl p-4
      hover:border-white/15 transition-all duration-200
      hover:-translate-y-0.5 cursor-pointer group
      min-h-[145px] flex flex-col justify-between
      ${isDone ? "opacity-60" : ""}`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <p
            className={`text-sm font-medium leading-snug line-clamp-2 ${
              isDone
                ? "line-through text-slate-500"
                : "text-white group-hover:text-blue-400"
            }`}
          >
            {task.title}
          </p>

          {isDone && (
            <CheckCircle2
              size={14}
              className="flex-shrink-0 mt-0.5 text-green-500"
            />
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: task.color }}
            >
              {(task.initials || "U").charAt(0)}
            </div>

            <span className="text-xs text-slate-400">
              {task.assigneeName || "Unassigned"}
            </span>
          </div>

          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-md border"
            style={{
              color: pc.color,
              background: pc.bg,
              borderColor: pc.border,
            }}
          >
            {task.priority}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2">
          <div className="flex items-center gap-1">
            <Tag size={10} className="text-slate-500" />
            <span className="text-[10px] text-slate-500">
              {task.source}
            </span>
          </div>

          <button
            onClick={() => deleteTask(task.id)}
            className="text-xs text-red-500 hover:text-red-400 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {

 // const totalTasks = Object.values(tasks).flat().length
 // const doneTasks = tasks.done.length
 // const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0
  const navigate = useNavigate();

const [task, setTask] = useState<Task[]>([]);
console.log(task)
  // ==========================

  // Fetch All Tasks
  // ==========================
 

 const fetchTasks = async () => {
  try {
    const response = await api.get("/tasks");

    console.log('data',response.data)
    const formattedTasks: Task[] = response.data.map((t: any) => ({
      id: t._id,
      title: t.title,
      status: t.status as Status,
      priority: t.priority.toUpperCase() as Priority,

      // Temporary values
        assigneeName: t.assigneeName|| "",
  initials: t.assigneeName?.charAt(0) || "U",
      color: "#3b82f6",
      source: `Due: ${new Date(t.deadline).toLocaleDateString()}`
    }));

 //   console.log(formattedTasks);

    setTask(formattedTasks);
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch tasks");
  }
};
  useEffect(() => {
    fetchTasks();
  }, []);

 
 const groupedTasks = {
  todo: task.filter((t) => t.status === "todo"),
  inprogress: task.filter((t) => t.status === "inprogress"),
  done: task.filter((t) => t.status === "done"),
};

  return (
    <div className="flex min-h-screen" style={{ background: '#0a0f1a' }}>
      <div className="hidden lg:block">
  <Sidebar />
</div>

<main className="flex-1 lg:ml-64 min-h-screen w-full">
        {/* Style block for glow */}
        <style>{`
          .glow-btn-blue {
            transition: all 0.3s ease;
          }
          .glow-btn-blue:hover {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
          }
        `}</style>

        {/* Header */}
        <div className="sticky top-0 z-30 px-8 py-5 border-b flex items-center justify-between" style={{ background: 'rgba(10, 15, 26, 0.85)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255, 255, 255, 0.06)' }}>
          <div>
            <h1 className="text-xl font-bold text-white">Task Board</h1>
          {  /*<p className="text-sm text-slate-400 mt-0.5">{doneTasks}/{totalTasks} tasks completed across all meetings</p>*/}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-200">
              <div className="w-2 h-2 rounded-full" style={{ background: '#3b82f6' }} />
              
              <span className="text-xs font-semibold">{userName}</span>
            </div>
            <button
              onClick={() => navigate('/CreateTask')}
              className="glow-btn-blue flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold hover:scale-[1.02] shadow-sm cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
            >
              <Plus size={14} />
              New Task
            </button>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
         
<div className="bg-white/5 rounded-2xl border border-white/8 backdrop-blur-md p-5">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {(Object.entries(groupedTasks).map(([col, colTasks]) => {
    const cfg = columnConfig[col as Status];

    return( <div key={col} className="flex flex-col bg-white/[0.02] border border-white/5 p-4.5 rounded-2xl min-h-[450px]">
  {/* Column Header */}
  <div
    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl mb-4"
    style={{ background: cfg.headerBg }}
  >
    <div className="flex items-center gap-2">
      <div
        className="w-2 h-2 rounded-full"
        style={{ background: cfg.dotColor }}
      />
      <span className="text-xs font-bold tracking-wider text-slate-300">
        {cfg.label}
      </span>
    </div>

    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${cfg.badgeBg}`}
    >
      {colTasks.length}
    </span>
  </div>

  {/* Tasks */}
  <div className="space-y-3">
    {colTasks.length > 0 ? (
      colTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          isDone={col === "done"}
          onDelete={deleteTask}
        />
      ))
    ) : (
      <p className="text-slate-500 text-sm text-center mt-5">
        No Tasks
      </p>
    )}
  </div>
  
</div>)
}))}
            </div>
          </div>

          {/* Kanban Board columns */}
       
        </div>
      </main>
    </div>
  )
}
