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

// Get all channels
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { data: channels, error } = await supabase
      .from("channels")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;

    res.json(channels);
  } catch (error) {
    console.error("Error fetching channels:", error);
    res.status(500).json({ error: "Failed to fetch channels" });
  }
});

// Get a specific channel
router.get("/:channelId", authenticateToken, async (req, res) => {
  try {
    const { channelId } = req.params;

    const { data: channel, error } = await supabase
      .from("channels")
      .select("*")
      .eq("id", channelId)
      .single();

    if (error) throw error;

    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }

    res.json(channel);
  } catch (error) {
    console.error("Error fetching channel:", error);
    res.status(500).json({ error: "Failed to fetch channel" });
  }
});

// Create a new channel
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Channel name is required" });
    }

    const { data: channel, error } = await supabase
      .from("channels")
      .insert([
        {
          name,
          description,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.json(channel);
  } catch (error) {
    console.error("Error creating channel:", error);
    res.status(500).json({ error: "Failed to create channel" });
  }
});

// Join a channel
router.post("/:channelId/join", authenticateToken, async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user.id;

    // Check if user is already a member
    const { data: existingMember, error: checkError } = await supabase
      .from("channel_members")
      .select("*")
      .match({ channel_id: channelId, user_id: userId })
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError;
    }

    if (existingMember) {
      return res
        .status(400)
        .json({ error: "Already a member of this channel" });
    }

    // Add user to channel
    const { data: member, error } = await supabase
      .from("channel_members")
      .insert([
        {
          channel_id: channelId,
          user_id: userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.json(member);
  } catch (error) {
    console.error("Error joining channel:", error);
    res.status(500).json({ error: "Failed to join channel" });
  }
});

// Leave a channel
router.post("/:channelId/leave", authenticateToken, async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from("channel_members")
      .delete()
      .match({ channel_id: channelId, user_id: userId });

    if (error) throw error;

    res.json({ message: "Left channel successfully" });
  } catch (error) {
    console.error("Error leaving channel:", error);
    res.status(500).json({ error: "Failed to leave channel" });
  }
});

// Get channel members
router.get("/:channelId/members", authenticateToken, async (req, res) => {
  try {
    const { channelId } = req.params;

    const { data: members, error } = await supabase
      .from("channel_members")
      .select("user_id, user:auth.users!user_id(id, email, user_metadata)")
      .eq("channel_id", channelId);

    if (error) throw error;

    res.json(members);
  } catch (error) {
    console.error("Error fetching channel members:", error);
    res.status(500).json({ error: "Failed to fetch channel members" });
  }
});

module.exports = router;
