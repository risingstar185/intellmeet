const WebSocket = require("ws");

function createAssemblyConnection(onTranscript) {
  const ws = new WebSocket(
    "wss://streaming.assemblyai.com/v3/ws?sample_rate=16000&language=en",
    {
      headers: {
        Authorization: process.env.ASSEMBLYAI_API_KEY,
      },
    }
  );

  let isOpen = false;

  ws.on("open", () => {
    isOpen = true;
    console.log("✅ AssemblyAI Connected");
  });

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());

    //  console.log("AssemblyAI:", data);

      // Ignore non-transcript events
      if (data.type !== "Turn") return;

      const text = data.transcript || "";
      const isFinal = data.end_of_turn === true;

 //   console.log("TEXT:", text);
    //  console.log("FINAL:", isFinal);
      if (!text.trim()) return;

      onTranscript({
        text,
        isFinal,
      
      });

    } catch (err) {
      console.error("Assembly Parse Error:", err);
    }
  });

  ws.on("error", (err) => {
    console.error("Assembly Error:", err);
  });

  ws.on("close", () => {
    isOpen = false;
    console.log("Assembly Closed");
  });

  return {
    send(chunk) {
      if (!isOpen) {
        console.log("Assembly Not Connected");
        return;
      }

      ws.send(chunk);
    },

    getReadyState() {
      return ws.readyState;
    },

    requestClose() {
  if (
    ws.readyState === WebSocket.OPEN ||
    ws.readyState === WebSocket.CONNECTING
  ) {
    ws.close();
  }
}
  };
}

module.exports = {
  createAssemblyConnection,
};