// require("dotenv").config();

// Debug environment variables
// console.log("Main file - Environment variables:", {
//   url: process.env.SUPABASE_URL,
//   key: process.env.SUPABASE_SERVICE_KEY ? "Key exists" : "Key missing",
//   envPath: process.cwd() + "/.env",
// });

const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const { initializeDatabase } = require("./config/init-db");
const { createServer } = require("http");
const { Server } = require("socket.io");
const setupMessageHandlers = require("./socket/messageHandler");
const environment = require("./config/environment")
const SUPABASE_URL = environment.SUPABASE_URL 
const SUPABASE_SERVICE_KEY =environment.SUPABASE_SERVICE_KEY 
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});


// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
console.log("Initializing database...");
initializeDatabase()
  .then(() => {
    console.log("Database initialized successfully");
  })
  .catch((error) => {
    console.error("Error initializing database:", error);
  });

// Setup Socket.IO handlers
setupMessageHandlers(io);
const setupVoiceHandlers = require("./socket/voiceHandler");
setupVoiceHandlers(io);

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/books", require("./routes/books.routes"));
app.use("/api/channels", require("./routes/channels.routes"));
app.use("/api/channel", require("./routes/channel.routes"));
app.use("/api/messages", require("./routes/messages.routes"));
app.use("/api/relationships", require("./routes/relationships.routes"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = environment.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`app is listening on port ${PORT}`);
});
