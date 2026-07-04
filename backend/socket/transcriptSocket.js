const { createAssemblyConnection } = require("../services/assemblyService");
const Meeting = require("../models/Meeting");

console.log("transcriptSocket loaded");

const meetingConnections = new Map();
const meetingTranscript = new Map();

module.exports = function registerTranscriptSocket(io) {

    io.on("connection", (socket) => {

        console.log("Socket Connected:", socket.id);

        socket.on("start-transcription", ({ roomId }) => {

            if (!roomId) return;

            if (meetingConnections.has(roomId)) {
                console.log("Already Started");
                return;
            }

            meetingTranscript.set(roomId, "");

            const assembly = createAssemblyConnection(({ text, isFinal }) => {

    console.log("TEXT:", text);
    console.log("FINAL:", isFinal);
                if (!text) return;

                io.to(roomId).emit("transcript", {
                    text,
                    isFinal,
                });

                if (isFinal) {

                    const previous =
                        meetingTranscript.get(roomId) || "";
/*
                    meetingTranscript.set(
                        roomId,
                        previous + " " + text
                    );--*/
                      const updated = previous + " " + text;

        meetingTranscript.set(roomId, updated);

        console.log("UPDATED TRANSCRIPT:", updated);
  console.log(
        "CURRENT:",
        meetingTranscript.get(roomId)
    );
                    console.log("FINAL:", text);

                } else {

                    console.log("PARTIAL:", text);

                }

            });

            meetingConnections.set(roomId, assembly);

            console.log("Assembly Connection Saved");

        });

        socket.on("audio-chunk", ({ roomId, chunk }) => {

            const assembly =
                meetingConnections.get(roomId);

            if (!assembly) {
              //  console.log("No Assembly Connection");
                return;
            }

            try {

                if (assembly.getReadyState() === 1) {

                    assembly.send(chunk);

                } else {

                    console.log("Assembly Not Connected");

                }

            } catch (err) {

                console.error(err);

            }

        });

     socket.on("stop-transcription", async ({ roomId }) => {

    const assembly = meetingConnections.get(roomId);
    if (!assembly) return;

    try {

        const transcript = meetingTranscript.get(roomId) || "";

        console.log("RoomId:", roomId);
        console.log("Transcript:", transcript);

        const meeting = await Meeting.findById(roomId);

        console.log("Meeting Found:", meeting);

        const updated = await Meeting.findByIdAndUpdate(
            roomId,
            { transcript },
            { new: true }
        );

        console.log("Updated:", updated);

        assembly.requestClose();

        meetingConnections.delete(roomId);
        meetingTranscript.delete(roomId);

    } catch (err) {
        console.error(err);
    }
});

        socket.on("disconnect", () => {

            console.log("Disconnected:", socket.id);

        });

    });

};