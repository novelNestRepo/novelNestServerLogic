const express = require("express");
const router = express.Router();
const { supabase } = require("../config/supabase");
const { authenticateToken } = require("../middleware/auth");

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    console.log("Attempting to register user:", email);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/auth/callback`,
      },
    });

    if (error) {
      console.error("Registration error:", error);
      throw error;
    }

    console.log("Registration successful:", data);
    res.status(201).json(data);
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      error: error.message,
      details: error.details || "No additional details available",
    });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt received:", { email });

    if (!email || !password) {
      console.log("Missing credentials:", {
        email: !!email,
        password: !!password,
      });
      return res.status(400).json({ error: "Email and password are required" });
    }

    console.log("Attempting Supabase login...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("Supabase response:", {
      hasData: !!data,
      hasError: !!error,
      errorMessage: error?.message,
      errorDetails: error?.details,
    });

    if (error) {
      console.error("Login error details:", {
        message: error.message,
        status: error.status,
        details: error.details,
        stack: error.stack,
      });
      throw error;
    }

    if (!data) {
      console.error("No data received from Supabase");
      throw new Error("No data received from Supabase");
    }

    if (!data.session) {
      console.error("No session data received");
      throw new Error("No session data received");
    }

    const userData = {
      message: "Login successful",
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || email.split("@")[0],
      },
      token: data.session.access_token,
    };

    console.log("Login successful for:", email);
    res.json(userData);
  } catch (error) {
    console.error("Error logging in:", {
      message: error.message,
      status: error.status,
      details: error.details,
      stack: error.stack,
    });
    res.status(500).json({
      error: error.message,
      details: error.details || "No additional details available",
      status: error.status,
    });
  }
});

// Get current user
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(req.user.id);

    if (error) throw error;

    res.json({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email.split("@")[0],
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: error.message });
  }
});

// Logout user
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
