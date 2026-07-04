import { useState,useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../config/api";

//const API_URL = "http://localhost:5000/api/tasks/create";

const CreateTask = () => {
  const navigate = useNavigate();
const [users, setUsers] = useState([]);


const fetchUsers = async () => {
  try {
    const res = await api.get("/count/users");
    setUsers(res.data);
    //console.log(res.data)
  } catch (err) {
    console.log(err);
  }
};

useEffect(() => {
  fetchUsers();
}, []);

  const [formData, setFormData] = useState({
    title: "",
    assigneeName: "",
    priority: "medium",
    status: "todo",
    deadline: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await api.post('/tasks/create', formData);

      toast.success("Task Created Successfully");

     // console.log(res.data);

      navigate("/tasks");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create task");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center items-center p-6">
      <div className="bg-slate-900 w-full max-w-lg rounded-xl p-8 shadow-lg">
        <h1 className="text-2xl ml-30 font-bold text-white mb-6">
          Create Task
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Title */}
          <div>
            <label className="text-white block mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-slate-800 text-white rounded-lg p-3 outline-none"
              placeholder="Enter Task Title"
              required
            />
          </div>

          <div>
  <label className="text-white block mb-2">
    Assignee Name
  </label>

  <select
    name="assigneeName"
    value={formData.assigneeName}
    onChange={handleChange}
    className="w-full bg-slate-800 text-white rounded-lg p-3 outline-none"
  >
    <option value="">Select Assignee</option>

    {users.map((user: any) => (
      <option key={user._id} value={user.name}>
        {user.name}
      </option>
    ))}
  </select>
</div>

          {/* Priority */}
          <div>
            <label className="text-white block mb-2">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full bg-slate-800 text-white rounded-lg p-3 outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="text-white block mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-slate-800 text-white rounded-lg p-3 outline-none"
            >
              <option value="todo">Todo</option>
              <option value="inprogress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          {/* Deadline */}
          <div>
            <label className="text-white block mb-2">Deadline</label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full bg-slate-800 text-white rounded-lg p-3 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
          >
            Create Task
          </button>

        </form>
      </div>
    </div>
  );
};

export default CreateTask;