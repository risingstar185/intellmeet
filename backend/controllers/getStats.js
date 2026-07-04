const Meeting = require("../models/Meeting");
const Task = require("../models/Task");
const User = require("../models/User");

const getStats = async (req, res) => {
  try {
    const totalMeetings = await Meeting.countDocuments();
    const totalTasks = await Task.countDocuments();
    const totalUsers = await User.countDocuments();

      // Average Meeting Duration
    const meetings = await Meeting.find();

    const totalDuration = meetings.reduce(
      (sum, meeting) => sum + (meeting.duration || 0),
      0
    );

    const avgDuration =
      meetings.length > 0
        ? Math.round(totalDuration / meetings.length)
        : 0;

    // Task Completion Rate
    const completedTasks = await Task.countDocuments({
      status: "done",
    });

    const taskCompletionRate =
      totalTasks > 0
        ? ((completedTasks / totalTasks) * 100).toFixed(1)
        : 0;
    // AI time saved logic (example)
    const aiTimeSaved = totalMeetings * 15; 
    // assume 15 min saved per meeting

    return res.json({
      totalMeetings,
      totalTasks,
      totalUsers,
      avgDuration,
      taskCompletionRate,
      aiTimeSaved,
    });
  } catch (error) {
    res.status(500).json({ error: "Stats error" });
  }
};



// controllers/userController.js

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStats,getUsers };
