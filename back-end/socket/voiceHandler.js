const { supabaseAdmin } = require("../config/supabase");
const supabase = supabaseAdmin;

function setupVoiceHandlers(io) {
  io.on("connection", (socket) => {
    // Join voice channel
    socket.on("join-channel", (channelId) => {
      socket.join(`voice:${channelId}`);
      console.log(`User ${socket.user?.id} joined voice channel ${channelId}`);
    });

    // Voice connect
    socket.on("voice-connect", async (channelId) => {
      try {
        const userId = socket.user?.id;
        if (!userId) return;

        // Add to voice session in database
        await supabase
          .from("voice_sessions")
          .upsert({
            channel_id: channelId,
            user_id: userId,
            socket_id: socket.id,
            is_muted: false
          });

        // Get all active voice users
        const { data: sessions } = await supabase
          .from("voice_sessions")
          .select("user_id, is_muted")
          .eq("channel_id", channelId);

        const users = sessions?.map(s => ({ 
          userId: s.user_id, 
          isMuted: s.is_muted 
        })) || [];

        io.to(`voice:${channelId}`).emit("voice-users-updated", { users });
        
        // Notify existing users about new user
        socket.to(`voice:${channelId}`).emit("user-joined-voice", { userId });
      } catch (error) {
        console.error("Error in voice-connect:", error);
      }
    });

    // Voice disconnect
    socket.on("voice-disconnect", async (channelId) => {
      try {
        const userId = socket.user?.id;
        if (!userId) return;

        // Remove from voice session
        await supabase
          .from("voice_sessions")
          .delete()
          .match({ channel_id: channelId, user_id: userId });

        // Get remaining users
        const { data: sessions } = await supabase
          .from("voice_sessions")
          .select("user_id, is_muted")
          .eq("channel_id", channelId);

        const users = sessions?.map(s => ({ 
          userId: s.user_id, 
          isMuted: s.is_muted 
        })) || [];

        io.to(`voice:${channelId}`).emit("voice-users-updated", { users });
        socket.to(`voice:${channelId}`).emit("user-left-voice", { userId });
      } catch (error) {
        console.error("Error in voice-disconnect:", error);
      }
    });

    // Mute/unmute
    socket.on("toggle-mute", async (data) => {
      try {
        const { channelId, isMuted } = data;
        const userId = socket.user?.id;
        
        await supabase
          .from("voice_sessions")
          .update({ is_muted: isMuted })
          .match({ channel_id: channelId, user_id: userId });

        socket.to(`voice:${channelId}`).emit("user-mute-changed", { 
          userId, 
          isMuted 
        });
      } catch (error) {
        console.error("Error in toggle-mute:", error);
      }
    });

    // WebRTC signaling for multi-user
    socket.on("offer", (data) => {
      const { channelId, targetUserId, offer } = data;
      socket.to(`voice:${channelId}`).emit("offer", {
        fromUserId: socket.user?.id,
        targetUserId,
        offer
      });
    });

    socket.on("answer", (data) => {
      const { channelId, targetUserId, answer } = data;
      socket.to(`voice:${channelId}`).emit("answer", {
        fromUserId: socket.user?.id,
        targetUserId,
        answer
      });
    });

    socket.on("ice-candidate", (data) => {
      const { channelId, targetUserId, candidate } = data;
      socket.to(`voice:${channelId}`).emit("ice-candidate", {
        fromUserId: socket.user?.id,
        targetUserId,
        candidate
      });
    });

    // Cleanup on disconnect
    socket.on("disconnect", async () => {
      try {
        const userId = socket.user?.id;
        if (!userId) return;

        // Remove from all voice sessions
        const { data: sessions } = await supabase
          .from("voice_sessions")
          .select("channel_id")
          .eq("user_id", userId);

        for (const session of sessions || []) {
          await supabase
            .from("voice_sessions")
            .delete()
            .match({ channel_id: session.channel_id, user_id: userId });

          // Notify channel users
          const { data: remainingSessions } = await supabase
            .from("voice_sessions")
            .select("user_id, is_muted")
            .eq("channel_id", session.channel_id);

          const users = remainingSessions?.map(s => ({ 
            userId: s.user_id, 
            isMuted: s.is_muted 
          })) || [];

          io.to(`voice:${session.channel_id}`).emit("voice-users-updated", { users });
          io.to(`voice:${session.channel_id}`).emit("user-left-voice", { userId });
        }
      } catch (error) {
        console.error("Error in disconnect cleanup:", error);
      }
    });
  });
}

module.exports = setupVoiceHandlers;