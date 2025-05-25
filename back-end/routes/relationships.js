const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const { authenticateToken } = require("../middleware/auth");

// Hardcoded credentials (temporary solution)
const SUPABASE_URL = "https://rjjdutprvrlrtmjtesfg.supabase.co";
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqamR1dHBydnJscnRtandlc2ZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTY5NjQwMCwiZXhwIjoyMDU1MjcyNDAwfQ.2Xw3Yw3Yw3Yw3Yw3Yw3Yw3Yw3Yw3Yw3Yw3Yw3Yw3Yw";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Get all relationships for a user
router.get("/:userId", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("relationships")
      .select(
        `
        *,
        follower:follower_id (
          email,
          user_metadata
        ),
        following:following_id (
          email,
          user_metadata
        )
      `
      )
      .or(
        `follower_id.eq.${req.params.userId},following_id.eq.${req.params.userId}`
      );

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Follow a user
router.post("/follow", async (req, res) => {
  try {
    const { follower_id, following_id } = req.body;
    const { data, error } = await supabase
      .from("relationships")
      .insert([{ follower_id, following_id }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unfollow a user
router.delete("/unfollow", async (req, res) => {
  try {
    const { follower_id, following_id } = req.body;
    const { error } = await supabase
      .from("relationships")
      .delete()
      .match({ follower_id, following_id });

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get followers list
router.get("/followers", authenticateToken, async (req, res) => {
  try {
    const { data: followers, error } = await supabase
      .from("user_relationships")
      .select(
        "follower_id, follower:auth.users!follower_id(id, email, user_metadata)"
      )
      .eq("following_id", req.user.id);

    if (error) throw error;

    res.json(followers);
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ error: "Failed to fetch followers" });
  }
});

// Get following list
router.get("/following", authenticateToken, async (req, res) => {
  try {
    const { data: following, error } = await supabase
      .from("user_relationships")
      .select(
        "following_id, following:auth.users!following_id(id, email, user_metadata)"
      )
      .eq("follower_id", req.user.id);

    if (error) throw error;

    res.json(following);
  } catch (error) {
    console.error("Error fetching following:", error);
    res.status(500).json({ error: "Failed to fetch following" });
  }
});

module.exports = router;
