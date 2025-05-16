const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./routes/user.routes");

const app = express();
dotenv.config();

// middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", userRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to NovelNest API" });
});

const PORT = process.env.PORT || 4000;
//running the server
app.listen(PORT, () => {
  console.log(`app is listening on port ${PORT}`);
});
