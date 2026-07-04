const mongoose = require("mongoose");

const actionItemSchema = new mongoose.Schema(
  {
    task: {
      type: String,
      required: true,
      trim: true,
    },
    assigneeName: {
      type: String,
      default: "",
      trim: true,
    },
    deadline: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
  },
  {
    _id: false,
  }
);

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
   participantEmails: [
  {
    type: String,
    trim: true,
    lowercase: true,
  }
],
duration: {
  type: Number,
  required: true,
  min: 1,
},
description:{
    type: String,
      default: "",
},
    transcript: {
      type: String,
      default: "",
    },

    summary: {
      type: String,
      default: "",
    },

    actionItems: {
      type: [actionItemSchema],
      default: [],
    },

    recordingUrl: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["scheduled", "live", "completed"],
      default: "scheduled",
    },

    scheduledAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Meeting", meetingSchema);