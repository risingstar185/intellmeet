

const rooms = new Map();

/**
 * Get or create a room and return its participant map.
 */
function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Map());
  }
  return rooms.get(roomId);
}

/**
 * Build a serialisable participant list for a room.
 */
function getRoomParticipants(roomId) {
  const room = rooms.get(roomId);
  if (!room) return [];
  return Array.from(room.values());
}

/**
 * Clean up empty rooms to avoid memory leaks.
 */
function pruneRoom(roomId) {
  const room = rooms.get(roomId);
  if (room && room.size === 0) {
    rooms.delete(roomId);
  }
}

module.exports = function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // ─── join-room ────────────────────────────────────────────────────────────
   // socket.on('join-room', ({ roomId, userId, userName }) => {
    //  if (!roomId || !userId || userId !== socket.data.userId) {
      //  console.warn(`[Socket] Unauthorized join attempt for user ${userId} (socket: ${socket.id})`);
     //   return;
      //}
      socket.on("join-room", ({ roomId, userId, userName }) => {

    console.log("JWT User:", socket.data.userId);
    console.log("Frontend User:", userId);

    if (!roomId || !userId || userId !== socket.data.userId) {
        console.log("FAILED");
        return;
    }

    console.log("SUCCESS");



    socket.join(roomId)



      // Track participant in room state
      const room = getRoom(roomId);
      const participant = { socketId: socket.id, userId, userName, joinedAt: Date.now() };
      room.set(socket.id, participant);

      // Stash on socket for easy access on disconnect
      socket.data.roomId = roomId;
      socket.data.userId = userId;
      socket.data.userName = userName;

      console.log(`[Socket] ${userName} (${socket.id}) joined room ${roomId} — ${room.size} participants`);

      // Notify everyone else in the room that a new peer arrived
      socket.to(roomId).emit('user-connected', {
        socketId: socket.id,
        userId,
        userName,
      });

      // Send the new participant the full current list (so they can initiate offers)
      const existingPeers = getRoomParticipants(roomId).filter(p => p.socketId !== socket.id);
      socket.emit('room-participants', existingPeers);

      // Broadcast updated participant list to the whole room
      io.to(roomId).emit('participant-presence', getRoomParticipants(roomId));
          console.log('hello',io.sockets.adapter.rooms.get(roomId))

console.log("Room Size:", room?.size);
               console.log("JOIN ROOM",roomId,socket.id)
    });

    // ─── send-message ─────────────────────────────────────────────────────────
    socket.on('send-message', ({ roomId, message }) => {
      if (!roomId || !message) return;

      const payload = {
        id: `${socket.id}-${Date.now()}`,
        senderId: socket.data.userId,
        senderName: socket.data.userName || 'Unknown',
        text: message.text,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        isAI: false,
      };

      // Broadcast to everyone in the room (including sender for confirmation)
      io.to(roomId).emit('receive-message', payload);
    });

    // ─── WebRTC signaling ─────────────────────────────────────────────────────

   /* // Relay a WebRTC offer to a specific peer
    socket.on('webrtc-offer', ({ to, offer }) => {
      io.to(to).emit('webrtc-offer', {
        from: socket.id,
        offer,
      });
      console.log("Creating offer")
    });
*/
socket.on("webrtc-offer", ({ to, offer }) => {
  console.log("========== OFFER ==========");
  console.log("FROM :", socket.id);
  console.log("TO   :", to);

  console.log("Socket Exists :", io.sockets.sockets.has(to));

  io.to(to).emit("webrtc-offer", {
    from: socket.id,
    offer,
  });

  console.log("Offer emitted");
});
    // Relay a WebRTC answer to the initiating peer
    socket.on('webrtc-answer', ({ to, answer }) => {
      io.to(to).emit('webrtc-answer', {
        from: socket.id,
        answer,
      });
    });

    // Relay ICE candidates between peers
    socket.on('ice-candidate', ({ to, candidate }) => {
      io.to(to).emit('ice-candidate', {
        from: socket.id,
        candidate,
      });
    });

    // ─── Typing indicators ────────────────────────────────────────────────────

    socket.on('typing-start', ({ roomId }) => {
      socket.to(roomId).emit('typing-start', {
        socketId: socket.id,
        userName: socket.data.userName,
      });
    });

    socket.on('typing-stop', ({ roomId }) => {
      socket.to(roomId).emit('typing-stop', {
        socketId: socket.id,
      });
    });

    // ─── Disconnect ───────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const { roomId, userId, userName } = socket.data;

      if (roomId) {
        const room = rooms.get(roomId);
        if (room) {
          room.delete(socket.id);
          pruneRoom(roomId);

          console.log(`[Socket] ${userName} (${socket.id}) left room ${roomId}`);

          // Notify remaining participants
          socket.to(roomId).emit('user-disconnected', {
            socketId: socket.id,
            userId,
            userName,
          });

          // Broadcast updated presence list
          io.to(roomId).emit('participant-presence', getRoomParticipants(roomId));
        }
      }

      console.log(`[Socket] Disconnected: ${socket.id}`);
    });
  });
};
