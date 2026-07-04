const Meeting = require('../models/Meeting');
const Task = require('../models/Task');

const getMeetings = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const email = req.user.email;
   // console.log(email)
    // Get meetings where the user is either the host or a participant
    const meetings = await Meeting.find({
      $or: [
        { hostId: userId },
        { participantEmails: email }
      ]
    })
      .populate('hostId', 'name email avatar')
      .sort({ scheduledAt: -1 });

    return res.status(200).json(meetings);
  } catch (error) {
    next(error);
  }
};

const createMeeting = async (req, res, next) => {
  try {
    const { title, participantEmails, scheduledAt, status,duration,description } = req.body;

   const hostId = req.user.userId;
 //const hostId = "6860b4d2a5c1d9f8b1234567"; // Existing User _id
    const newMeeting = new Meeting({
      title,
      hostId,
      participantEmails: participantEmails || [],
      scheduledAt,
      duration,
      description,
      status: status || 'scheduled',
    });

    await newMeeting.save();
    return res.status(201).json(newMeeting);
  } catch (error) {
    next(error);
  }
};

const getMeetingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findById(id)
      .populate('hostId', 'name email avatar')
      .populate('participantEmails', 'email');

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found.' });
    }
const userEmail = req.user.email;
    // Authorization check: User must be host or participant
    const userId = req.user.userId;
    const isHost = meeting.hostId?._id?.toString() === userId;
   const isParticipant = meeting.participantEmails.includes(userEmail);

    if (!isHost && !isParticipant) {
      return res.status(403).json({ error: 'Access denied. You are not a participant of this meeting.' });
    }

    return res.status(200).json(meeting);
  } catch (error) {
    next(error);
  }
};

const saveSummary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { summary, actionItems, transcript } = req.body;

    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found.' });
    }

    // Authorize host or participants to save summary
    const userId = req.user.userId;
    const isHost = meeting.hostId.toString() === userId;
    const isParticipant = meeting.participants.includes(userId);

    if (!isHost && !isParticipant) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Update meeting summary, actionItems, transcript
    meeting.summary = summary || meeting.summary;
    meeting.transcript = transcript || meeting.transcript;
    if (actionItems) {
      meeting.actionItems = actionItems;
    }
    meeting.status = 'completed';

    await meeting.save();

    // If new action items are submitted, we can auto-create corresponding tasks
    // mapping the action item assignees to users if matching names/emails are found
    // Here we will keep it simple and return the completed meeting details.
    return res.status(200).json({
      message: 'Meeting summary and action items updated successfully.',
      meeting
    });
  } catch (error) {
    next(error);
  }
};

const deleteMeeting = async (req, res, next) => {
  try {
    const { id } = req.params;

    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found.' });
    }

    // Only host can delete meeting
    if (meeting.hostId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied. Only the host can delete this meeting.' });
    }

    await Meeting.findByIdAndDelete(id);

    // Cascading delete tasks associated with this meeting
    await Task.deleteMany({ meetingId: id });

    return res.status(200).json({ message: 'Meeting and associated tasks deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

const getLatestSummary = async (req, res) => {
  try {
    const meeting = await Meeting.findOne({
      summary: { $ne: "" }
    })
      .sort({ updatedAt: -1 })
      .select("_id title summary transcript actionItems scheduledAt");

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "No summary found",
      });
    }

    return res.status(200).json({
      success: true,
      meeting,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


module.exports = {
  getMeetings,
  createMeeting,
  getMeetingById,
  saveSummary,
  getLatestSummary,
  deleteMeeting,
};
