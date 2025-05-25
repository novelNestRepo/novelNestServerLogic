const supabase = require("../config/supabase");

function setupMessageHandlers(io) {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);
      if (error || !user) {
        return next(new Error("Authentication error"));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.user.id);

    // Handle joining a channel
    socket.on("join_channel", (channelId) => {
      socket.join(`channel:${channelId}`);
      console.log(`User ${socket.user.id} joined channel ${channelId}`);
    });

    // Handle leaving a channel
    socket.on("leave_channel", (channelId) => {
      socket.leave(`channel:${channelId}`);
      console.log(`User ${socket.user.id} left channel ${channelId}`);
    });

    // Handle new messages
    socket.on("send_message", async (data) => {
      try {
        const { content, channelId } = data;

        const { data: message, error } = await supabase
          .from("messages")
          .insert([
            {
              content,
              sender_id: socket.user.id,
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

        // Broadcast the message to all users in the channel
        io.to(`channel:${channelId}`).emit("new_message", message);

        // Update message status to delivered after a short delay
        setTimeout(async () => {
          const { data: updatedMessage, error: updateError } = await supabase
            .from("messages")
            .update({ status: "delivered" })
            .eq("id", message.id)
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

          if (!updateError && updatedMessage) {
            io.to(`channel:${channelId}`).emit(
              "message_updated",
              updatedMessage
            );
          }
        }, 1000);
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", "Failed to send message");
      }
    });

    // Handle message editing
    socket.on("edit_message", async (data) => {
      try {
        const { messageId, content, channelId } = data;

        const { data: message, error } = await supabase
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

        io.to(`channel:${channelId}`).emit("message_updated", message);
      } catch (error) {
        console.error("Error editing message:", error);
        socket.emit("error", "Failed to edit message");
      }
    });

    // Handle message deletion
    socket.on("delete_message", async (data) => {
      try {
        const { messageId, channelId } = data;

        const { error } = await supabase
          .from("messages")
          .delete()
          .eq("id", messageId);

        if (error) throw error;

        io.to(`channel:${channelId}`).emit("message_deleted", messageId);
      } catch (error) {
        console.error("Error deleting message:", error);
        socket.emit("error", "Failed to delete message");
      }
    });

    // Handle message reactions
    socket.on("add_reaction", async (data) => {
      try {
        const { messageId, emoji, channelId } = data;

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
        if (!reactions[emoji].includes(socket.user.id)) {
          reactions[emoji].push(socket.user.id);
        }

        // Update message with new reactions
        const { data: updatedMessage, error: updateError } = await supabase
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

        if (updateError) throw updateError;

        io.to(`channel:${channelId}`).emit("message_updated", updatedMessage);
      } catch (error) {
        console.error("Error adding reaction:", error);
        socket.emit("error", "Failed to add reaction");
      }
    });

    // Handle typing indicators
    socket.on("typing_start", (channelId) => {
      socket.to(`channel:${channelId}`).emit("typing_start", socket.user.id);
    });

    socket.on("typing_stop", (channelId) => {
      socket.to(`channel:${channelId}`).emit("typing_stop", socket.user.id);
    });

    // Handle message read status
    socket.on("mark_as_read", async (data) => {
      try {
        const { messageId, channelId } = data;

        const { data: message, error } = await supabase
          .from("messages")
          .update({ status: "read" })
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

        io.to(`channel:${channelId}`).emit("message_updated", message);
      } catch (error) {
        console.error("Error marking message as read:", error);
        socket.emit("error", "Failed to mark message as read");
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.user.id);
    });
  });
}

module.exports = setupMessageHandlers;
