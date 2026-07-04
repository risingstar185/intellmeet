const User = require("../models/User");
const Meeting = require("../models/Meeting");
const Task = require("../models/Task");

const getTopContributors = async (req, res) => {
  try {
    const users = await User.find().select("name email role");

    const contributors = await Promise.all(
      users.map(async (user) => {
        // Host + Participant meetings
        const meetings = await Meeting.countDocuments({
          $or: [
            { hostId: user._id },
            { participantEmails: user.email },
          ],
        });

        // Completed Tasks
       const tasks = await Task.countDocuments({
  assigneeName: user.name,
  status: "done",
});

        const efficiency =
          meetings === 0
            ? 0
            : Math.round((tasks / meetings) * 100);

        return {
          id: user._id,
          name: user.name,
          role: user.role || "Member",
          initials: user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase(),
          meetings,
          tasks,
          efficiency: `${Math.min(efficiency, 100)}%`,
        };
      })
    );

    contributors.sort((a, b) => b.meetings - a.meetings);

    res.json(contributors);
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  getTopContributors,
};