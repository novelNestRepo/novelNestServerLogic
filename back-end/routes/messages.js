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

// Get conversation history between two users
router.get("/conversation/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUserId})`
      )
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Mark unread messages as read
    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .match({ receiver_id: currentUserId, sender_id: userId, read_at: null });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

// Get messages for a specific channel
router.get("/channel/:channelId", authenticateToken, async (req, res) => {
  try {
    const { channelId } = req.params;
    const { data: messages, error } = await supabase
      .from("messages")
      .select(
        `
        *,
        sender:sender_id (
          email,
          user_metadata
        )
      `
      )
      .eq("channel_id", channelId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Mark unread messages as read
    await supabase
      .from("messages")
      .update({ status: "read" })
      .match({
        channel_id: channelId,
        status: { in: ["sent", "delivered"] },
      });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching channel messages:", error);
    res.status(500).json({ error: "Failed to fetch channel messages" });
  }
});

// Get all channels
router.get("/channels", authenticateToken, async (req, res) => {
  try {
    const { data: channels, error } = await supabase
      .from("channels")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    res.json(channels);
  } catch (error) {
    console.error("Error fetching channels:", error);
    res.status(500).json({ error: "Failed to fetch channels" });
  }
});

// Create a new channel
router.post("/channels", authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;

    const { data: channel, error } = await supabase
      .from("channels")
      .insert([{ name, description }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(channel);
  } catch (error) {
    console.error("Error creating channel:", error);
    res.status(500).json({ error: "Failed to create channel" });
  }
});

// Send a message to a channel
router.post("/send", authenticateToken, async (req, res) => {
  try {
    const { channelId, content } = req.body;
    const senderId = req.user.id;

    if (!channelId || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data: message, error } = await supabase
      .from("messages")
      .insert([
        {
          content,
          sender_id: senderId,
          channel_id: channelId,
          status: "sent",
          reactions: {},
        },
      ])
      .select(
        `
        *,
        sender:sender_id (
          email,
          user_metadata
        )
      `
      )
      .single();

    if (error) throw error;

    res.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Edit a message
router.put("/:messageId", authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    // Verify message ownership
    const { data: message, error: fetchError } = await supabase
      .from("messages")
      .select("sender_id")
      .eq("id", messageId)
      .single();

    if (fetchError) throw fetchError;

    if (message.sender_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to edit this message" });
    }

    const { data: updatedMessage, error } = await supabase
      .from("messages")
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", messageId)
      .select(
        `
        *,
        sender:sender_id (
          email,
          user_metadata
        )
      `
      )
      .single();

    if (error) throw error;
    res.json(updatedMessage);
  } catch (error) {
    console.error("Error editing message:", error);
    res.status(500).json({ error: "Failed to edit message" });
  }
});

// Delete a message
router.delete("/:messageId", authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;

    // Verify message ownership
    const { data: message, error: fetchError } = await supabase
      .from("messages")
      .select("sender_id")
      .eq("id", messageId)
      .single();

    if (fetchError) throw fetchError;

    if (message.sender_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this message" });
    }

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
});

// Add a reaction to a message
router.post("/:messageId/reactions", authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;

    // Get current message
    const { data: message, error: fetchError } = await supabase
      .from("messages")
      .select("reactions")
      .eq("id", messageId)
      .single();

    if (fetchError) throw fetchError;

    // Update reactions
    const reactions = message.reactions || {};
    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }
    if (!reactions[emoji].includes(req.user.id)) {
      reactions[emoji].push(req.user.id);
    }

    // Update message with new reactions
    const { data: updatedMessage, error } = await supabase
      .from("messages")
      .update({ reactions })
      .eq("id", messageId)
      .select(
        `
        *,
        sender:sender_id (
          email,
          user_metadata
        )
      `
      )
      .single();

    if (error) throw error;
    res.json(updatedMessage);
  } catch (error) {
    console.error("Error adding reaction:", error);
    res.status(500).json({ error: "Failed to add reaction" });
  }
});

module.exports = router;
