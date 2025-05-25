const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./routes/user.routes");
const channelRoutes = require("./routes/channel.routes");
const { initializeDatabase } = require("./config/init-db");

const app = express();
dotenv.config();

// middleware
app.use(
  cors({
    origin: ["http://localhost:8080", "http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database before starting the server
const startServer = async () => {
  try {
    await initializeDatabase();

    // Routes
    app.use("/api/auth", userRoutes);
    app.use("/api/channels", channelRoutes);

    // Root route
    app.get("/", (req, res) => {
      res.json({ message: "Welcome to NovelNest API" });
    });

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`app is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
