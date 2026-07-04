const Meeting = require("../models/Meeting");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const generateSummary = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await Meeting.findById(meetingId);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    if (!meeting.transcript || meeting.transcript.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Transcript is empty",
      });
    }

    const prompt = `
You are an AI Meeting Assistant.

Read the meeting transcript carefully.

Transcript:
${meeting.transcript}

Return ONLY JSON.

{
  "summary":"Short meeting summary",

  "actionItems":[
    {
      "task":"Task name",
      "assigneeName":"Person name or empty string",
      "priority":"high",
      "deadline":""
    }
  ]
}

Rules:
- Do not write markdown.
- Do not use \`\`\`.
- Return only JSON.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let text = response.text;

    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(text);

    meeting.summary = parsed.summary || "";
    meeting.actionItems = parsed.actionItems || [];
    meeting.status = "completed";

    await meeting.save();

    return res.status(200).json({
      success: true,
      meeting,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  generateSummary,
};