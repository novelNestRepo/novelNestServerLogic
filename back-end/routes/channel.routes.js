const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// Get all channels with member counts
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("channels")
      .select(`
        *,
        channel_members(count),
        voice_sessions(count)
      `);

    if (error) {
      return res.status(500).json({
        error: "Failed to fetch channels",
        details: error.message,
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch channels",
      details: error.message,
    });
  }
});

// Get a specific channel with members and voice users
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("channels")
      .select(`
        *,
        channel_members(
          user_id,
          role,
          joined_at
        ),
        voice_sessions(
          user_id,
          is_muted,
          joined_at
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({ error: "Channel not found" });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch channel",
      details: error.message,
    });
  }
});

// Create a new channel
router.post("/", async (req, res) => {
  try {
    const { name, description, is_private = false, max_users = 10 } = req.body;
    const created_by = req.user?.id || "00000000-0000-0000-0000-000000000000";

    const { data, error } = await supabase
      .from("channels")
      .insert([{ 
        name, 
        description, 
        is_private, 
        max_users,
        channel_type: 'voice',
        created_by 
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        error: "Failed to create channel",
        details: error.message,
      });
    }

    // Add creator as admin
    await supabase
      .from("channel_members")
      .insert([{ 
        channel_id: data.id, 
        user_id: created_by, 
        role: 'admin' 
      }]);

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({
      error: "Failed to create channel",
      details: error.message,
    });
  }
});

// Join a channel
router.post("/:id/join", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    // Check if channel exists and has space
    const { data: channel } = await supabase
      .from("channels")
      .select("max_users, channel_members(count)")
      .eq("id", id)
      .single();

    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }

    if (channel.channel_members[0].count >= channel.max_users) {
      return res.status(400).json({ error: "Channel is full" });
    }

    const { data, error } = await supabase
      .from("channel_members")
      .upsert([{ channel_id: id, user_id, role: 'member' }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        error: "Failed to join channel",
        details: error.message,
      });
    }

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({
      error: "Failed to join channel",
      details: error.message,
    });
  }
});

// Leave a channel
router.post("/:id/leave", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    // Remove from channel members
    const { error: memberError } = await supabase
      .from("channel_members")
      .delete()
      .match({ channel_id: id, user_id });

    // Remove from voice session if active
    const { error: voiceError } = await supabase
      .from("voice_sessions")
      .delete()
      .match({ channel_id: id, user_id });

    if (memberError) {
      return res.status(500).json({
        error: "Failed to leave channel",
        details: memberError.message,
      });
    }

    res.status(200).json({ message: "Left channel successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Failed to leave channel",
      details: error.message,
    });
  }
});

module.exports = router;
