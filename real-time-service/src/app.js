// src/app.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const Redis = require("ioredis");
const jwt = require("jsonwebtoken");
const channelRoutes = require("./routes/channelRoutes").default;

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Redis client (optional for development)
let redis;
try {
  redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
} catch (error) {
  console.warn(
    "Redis connection failed, some features may be limited:",
    error.message
  );
  redis = null;
}

// Middleware
app.use(cors());
app.use(express.json());

// JWT verification middleware
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Socket middleware to authenticate connections
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }

  const user = verifyToken(token);
  if (!user) {
    return next(new Error("Invalid token"));
  }

  socket.user = user;
  next();
});

// Socket connection handler
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user.username}`);

  // Join user to their personal room
  socket.join(`user:${socket.user.id}`);

  // Handle joining a book discussion channel
  socket.on("join-channel", async (channelId) => {
    socket.join(`channel:${channelId}`);

    // Get recent messages for this channel
    const messages = await redis.lrange(`channel:${channelId}:messages`, 0, 49);
    socket.emit("recent-messages", {
      channelId,
      messages: messages.map((msg) => JSON.parse(msg)),
    });

    // Notify channel about new user
    socket.to(`channel:${channelId}`).emit("user-joined", {
      channelId,
      user: {
        id: socket.user.id,
        username: socket.user.username,
      },
    });
  });

  // Handle leaving a channel
  socket.on("leave-channel", (channelId) => {
    socket.leave(`channel:${channelId}`);
    socket.to(`channel:${channelId}`).emit("user-left", {
      channelId,
      userId: socket.user.id,
    });
  });

  // Handle sending a message
  socket.on("send-message", async (data) => {
    const { channelId, content } = data;

    const message = {
      id: Date.now().toString(),
      content,
      channelId,
      userId: socket.user.id,
      username: socket.user.username,
      timestamp: new Date().toISOString(),
    };

    // Store message in Redis if available
    if (redis) {
      await redis.lpush(
        `channel:${channelId}:messages`,
        JSON.stringify(message)
      );
      await redis.ltrim(`channel:${channelId}:messages`, 0, 99); // Keep only last 100 messages
    }

    // Broadcast to channel
    io.to(`channel:${channelId}`).emit("new-message", message);
  });

  // Handle active users in voice channel
  socket.on("voice-connect", (channelId) => {
    // Add user to active voice users if Redis is available
    if (redis) {
      redis.sadd(`channel:${channelId}:voice`, socket.user.id);

      // Get all active users in this voice channel
      redis.smembers(`channel:${channelId}:voice`).then((users) => {
        // Broadcast updated user list to all in channel
        io.to(`channel:${channelId}`).emit("voice-users-updated", {
          channelId,
          users,
        });
      });
    } else {
      // Broadcast single user update when Redis is not available
      io.to(`channel:${channelId}`).emit("voice-users-updated", {
        channelId,
        users: [socket.user.id],
      });
    }
  });

  // Handle disconnect from voice
  socket.on("voice-disconnect", (channelId) => {
    redis.srem(`channel:${channelId}:voice`, socket.user.id);
    redis.smembers(`channel:${channelId}:voice`).then((users) => {
      io.to(`channel:${channelId}`).emit("voice-users-updated", {
        channelId,
        users,
      });
    });
  });

  // Handle user typing indicator
  socket.on("typing", (channelId) => {
    socket.to(`channel:${channelId}`).emit("user-typing", {
      channelId,
      userId: socket.user.id,
      username: socket.user.username,
    });
  });

  // Handle disconnection
  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${socket.user.username}`);

    // Remove user from all voice channels
    const userChannels = await redis.keys(`channel:*:voice`);
    for (const channelKey of userChannels) {
      const channelId = channelKey.split(":")[1];
      redis.srem(channelKey, socket.user.id);

      // Notify others that user left voice
      redis.smembers(channelKey).then((users) => {
        io.to(`channel:${channelId}`).emit("voice-users-updated", {
          channelId,
          users,
        });
      });
    }
  });
});

// REST endpoints for channel management
app.post("/api/channels", async (req, res) => {
  const { name, description, type, bookId } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const channelId = Date.now().toString();
  const channel = {
    id: channelId,
    name,
    description,
    type,
    bookId,
    createdBy: user.id,
    createdAt: new Date().toISOString(),
  };

  // Store channel info
  await redis.set(`channel:${channelId}:info`, JSON.stringify(channel));

  // Add to list of channels
  await redis.sadd("channels", channelId);

  res.status(201).json(channel);
});

// Get all channels
app.get("/api/channels", async (req, res) => {
  const channelIds = await redis.smembers("channels");
  const channels = [];

  for (const id of channelIds) {
    const channelInfo = await redis.get(`channel:${id}:info`);
    if (channelInfo) {
      channels.push(JSON.parse(channelInfo));
    }
  }

  res.json(channels);
});

// Get specific channel
app.get("/api/channels/:id", async (req, res) => {
  const { id } = req.params;
  const channelInfo = await redis.get(`channel:${id}:info`);

  if (!channelInfo) {
    return res.status(404).json({ error: "Channel not found" });
  }

  const channel = JSON.parse(channelInfo);
  const activeUsers = await redis.smembers(`channel:${id}:voice`);

  res.json({
    ...channel,
    activeUsers,
  });
});

// Add channel routes
app.use("/api/channels", channelRoutes);

// Start server
require("dotenv").config();
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Real-time server running on port ${PORT}`);
});

module.exports = { app, server, io };
