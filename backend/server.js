require('dotenv').config();

const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const meetingRoutes = require('./routes/meetings');
const taskRoutes = require('./routes/tasks');
const aiRoutes = require('./routes/ai');
const webrtcRoutes = require('./routes/webrtc');
const cookieParser = require("cookie-parser");

const registerSocketHandlers = require('./socket/socketHandler');
const socketAuthMiddleware = require('./middleware/socketAuthMiddleware');
const countRouter = require('./routes/count');
const registerTranscriptSocket = require("./socket/transcriptSocket");
const transcriptRoutes = require("./routes/transcriptRoutes");

const app = express();
const server = http.createServer(app);
const dns = require('node:dns');
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:4173'
    ],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
dns.setServers(['1.1.1.1', '1.0.0.1']);
// MongoDB
async function connectDB() {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB Connected");
        //console.log("Database :", conn.connection.name);
       // console.log("Host :", conn.connection.host);

    } catch (err) {
        console.log(err.message);
        process.exit(1);
    }
}

connectDB();

// Socket.io
const io = new Server(server, {
    cors: {
        origin: [
            'http://localhost:5173',
            'http://localhost:4173'
        ],
        credentials: true
    }
});

io.use(socketAuthMiddleware);
registerSocketHandlers(io);
registerTranscriptSocket(io);

//console.log("Transcript Socket Registered");

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/webrtc', webrtcRoutes);
app.use('/api/count',countRouter)
app.use("/api/transcript", transcriptRoutes);

app.get('/', (req, res) => {
    res.send("IntellMeet Backend Running");
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


