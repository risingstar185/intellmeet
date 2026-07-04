const express = require("express");
const transcriptRoutes = express.Router();

const {
    generateSummary,
} = require("../controllers/transcriptController");
//const {analyzeTranscript} = require("../controllers/analyzeTranscript");

transcriptRoutes.post("/:meetingId/generate-summary", generateSummary);
// routes/transcriptRoutes.js

//transcriptRoutes.post("/:meetingId/analyze", analyzeTranscript);
module.exports = transcriptRoutes;

//await axios.post(
//    `/api/transcript/${meetingId}/generate-summary`
//);