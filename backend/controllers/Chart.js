const Meeting = require("../models/Meeting");

const getMeetingChart = async (req, res) => {
  try {
    const meetings = await Meeting.find();

    const week = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
    };

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    meetings.forEach((meeting) => {
      const day = days[new Date(meeting.scheduledAt).getDay()];
      week[day]++;
    });

    const meetingsData = [
      { day: "Mon", meetings: week.Mon },
      { day: "Tue", meetings: week.Tue },
      { day: "Wed", meetings: week.Wed },
      { day: "Thu", meetings: week.Thu },
      { day: "Fri", meetings: week.Fri },
      { day: "Sat", meetings: week.Sat },
      { day: "Sun", meetings: week.Sun },
    ];

    res.json(meetingsData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMeetingChart };