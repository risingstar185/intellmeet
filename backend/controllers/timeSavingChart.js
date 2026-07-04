const Meeting = require("../models/Meeting");


const getAITimeSavedChart = async (req, res) => {
  try {
    const meetings = await Meeting.find();

    const weeks = {
      "Week 1": 0,
      "Week 2": 0,
      "Week 3": 0,
      "Week 4": 0,
    };

    meetings.forEach((meeting) => {
      const date = new Date(meeting.scheduledAt);
      const day = date.getDate();

      let week = "";

      if (day <= 7) week = "Week 1";
      else if (day <= 14) week = "Week 2";
      else if (day <= 21) week = "Week 3";
      else week = "Week 4";

      // duration ko hours me convert karke add kar rahe hain
      weeks[week] += (meeting.duration || 0) / 60;
    });

    res.json([
      { week: "Week 1", saved: Number(weeks["Week 1"].toFixed(1)) },
      { week: "Week 2", saved: Number(weeks["Week 2"].toFixed(1)) },
      { week: "Week 3", saved: Number(weeks["Week 3"].toFixed(1)) },
      { week: "Week 4", saved: Number(weeks["Week 4"].toFixed(1)) },
    ]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAITimeSavedChart };