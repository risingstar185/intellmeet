const Meeting = require("../models/Meeting");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const generateSummary = async (req, res) => {
  try {
    const { meetingId } = req.params;

    // Find Meeting
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

    // Gemini Prompt
    const prompt = `
You are an expert AI Meeting Assistant.

Analyze the following meeting transcript carefully.

Transcript:
${meeting.transcript}

Return ONLY valid JSON.

{
  "summary": "Write a concise meeting summary in 4-8 sentences.",

  "actionItems": [
    {
      "task": "Action item",
      "assigneeName": "Person responsible or empty string",
      "deadline": "YYYY-MM-DD or empty string",
      "priority": "high"
    }
  ]
}

Instructions:

1. Generate a professional meeting summary.

2. Extract ONLY actionable tasks.

3. If no assignee exists use "".

4. If no deadline exists use "".

5. Priority must be one of:
high
medium
low

6. Infer priority:
- high = urgent / ASAP / today / immediately / critical
- medium = normal work
- low = optional / later

7. Do not invent tasks.

8. Return ONLY JSON.

9. No markdown.

10. No \`\`\`.
`;

    // Gemini Response
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
console.log(parsed);
console.log(parsed.actionItems);
    // Save Summary
    meeting.summary = parsed.summary || "";

    // Save Action Items
    meeting.actionItems = (parsed.actionItems || []).map((item) => ({
      task: item.task || "",
      assigneeName: item.assigneeName || "",
      deadline: item.deadline ? new Date(item.deadline) : undefined,
      priority: ["high", "medium", "low"].includes(
        String(item.priority).toLowerCase()
      )
        ? String(item.priority).toLowerCase()
        : "medium",
    }));

    meeting.status = "completed";

    await meeting.save();

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
  generateSummary,
};