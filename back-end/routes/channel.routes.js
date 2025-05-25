const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// Get all channels
router.get("/", async (req, res) => {
  try {
    console.log("Fetching all channels");
    const { data, error } = await supabase.from("channels").select("*");

    if (error) {
      console.error("Supabase error in GET /:", error);
      return res.status(500).json({
        error: "Failed to fetch channels",
        details: error.message,
        code: error.code,
      });
    }

    console.log("Found channels:", data);
    res.json(data);
  } catch (error) {
    console.error("Error in GET /:", error);
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
    console.log("Fetching channel with ID:", id);

    const { data, error } = await supabase
      .from("channels")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase error in GET /:id:", error);
      return res.status(500).json({
        error: "Failed to fetch channel",
        details: error.message,
        code: error.code,
      });
    }

    if (!data) {
      console.log("No channel found with ID:", id);
      return res.status(404).json({ error: "Channel not found" });
    }

    console.log("Found channel:", data);
    res.json(data);
  } catch (error) {
    console.error("Error in GET /:id:", error);
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
    console.log("Creating channel:", { name, description });

    const { data, error } = await supabase
      .from("channels")
      .insert([{ name, description }])
      .select()
      .single();

    if (error) {
      console.error("Supabase error in POST /:", error);
      return res.status(500).json({
        error: "Failed to create channel",
        details: error.message,
        code: error.code,
      });
    }

    console.log("Created channel:", data);
    res.status(201).json(data);
  } catch (error) {
    console.error("Error in POST /:", error);
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
    console.log("Joining channel:", { channelId: id, userId: user_id });

    const { data, error } = await supabase
      .from("channel_members")
      .insert([{ channel_id: id, user_id }])
      .select()
      .single();

    if (error) {
      console.error("Supabase error in POST /:id/join:", error);
      return res.status(500).json({
        error: "Failed to join channel",
        details: error.message,
        code: error.code,
      });
    }

    console.log("Joined channel:", data);
    res.status(201).json(data);
  } catch (error) {
    console.error("Error in POST /:id/join:", error);
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
    console.log("Leaving channel:", { channelId: id, userId: user_id });

    const { error } = await supabase
      .from("channel_members")
      .delete()
      .match({ channel_id: id, user_id });

    if (error) {
      console.error("Supabase error in POST /:id/leave:", error);
      return res.status(500).json({
        error: "Failed to leave channel",
        details: error.message,
        code: error.code,
      });
    }

    console.log("Left channel successfully");
    res.status(200).json({ message: "Left channel successfully" });
  } catch (error) {
    console.error("Error in POST /:id/leave:", error);
    res.status(500).json({
      error: "Failed to leave channel",
      details: error.message,
    });
  }
});

module.exports = router;
