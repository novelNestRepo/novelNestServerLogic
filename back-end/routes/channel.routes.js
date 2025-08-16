const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../config/supabase");
const supabase = supabaseAdmin;

// Get all channels
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("channels")
      .select("*");

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

// Get a specific channel
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("channels")
      .select("*")
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
    const { name, description } = req.body;

    const { data, error } = await supabase
      .from("channels")
      .insert([{ 
        name, 
        description, 
        is_private: false
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        error: "Failed to create channel",
        details: error.message,
      });
    }

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

    const { data, error } = await supabase
      .from("channel_members")
      .insert([{ channel_id: id, user_id }])
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

    const { error } = await supabase
      .from("channel_members")
      .delete()
      .match({ channel_id: id, user_id });

    if (error) {
      return res.status(500).json({
        error: "Failed to leave channel",
        details: error.message,
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
