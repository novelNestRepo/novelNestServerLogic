const express = require("express");
const router = express.Router();
const authController = require("../controllers/user.controller");
const { auth } = require("../config/supabase");
const supabase = require("../config/supabase");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

// Get current user
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error("Error getting user:", error);
      return res.status(401).json({ error: "Invalid token" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Error in GET /me:", error);
    res.status(500).json({
      error: "Failed to get user data",
      details: error.message,
    });
  }
});

module.exports = router;
