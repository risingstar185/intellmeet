const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");

dotenv.config();

let client = null;

function getClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  if (!client) {
    client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  return client;
}

// Retry helper
async function withRetry(fn, retries = 3) {
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      const status =
        err?.status ||
        err?.error?.code ||
        err?.statusCode;

      // Retry only for temporary server errors
      if ((status === 503 || status === 429) && i < retries - 1) {
        const delay = (i + 1) * 2000;
        console.log(`Retrying Gemini request in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      throw err;
    }
  }

  throw lastError;
}

// Generate text
async function generateText(prompt) {
  const ai = getClient();

  const response = await withRetry(async () => {
    return await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
  });

  return response.text;
}

// Meeting Summary
async function generateSummary(transcript) {
  const prompt = `
You are an expert meeting assistant.

Summarize the following meeting transcript into 4-5 concise bullet points.

Transcript:
${transcript}
`;

  return await generateText(prompt);
}

// Extract Action Items
async function extractActionItems(transcript) {
  const prompt = `
Extract every action item from the meeting transcript.

Return ONLY valid JSON.

Format:

[
  {
    "task":"string",
    "assignee":"string",
    "deadline":"string",
    "priority":"high"
  }
]

Rules:
- assignee = "Unassigned" if missing.
- deadline = "Not specified" if missing.
- priority = high, medium or low only.
- Do NOT return markdown.
- Return only JSON.

Transcript:
${transcript}
`;

  const text = await generateText(prompt);

  try {
    return JSON.parse(
      text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim()
    );
  } catch (err) {
    console.error("Gemini returned invalid JSON:");
    console.log(text);

    return [];
  }
}

module.exports = {
  generateSummary,
  extractActionItems,
};