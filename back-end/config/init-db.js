const supabase = require("./supabase");

async function initializeDatabase() {
  try {
    console.log("Initializing database...");

    // Create tables
    const { error: messagesError } = await supabase.rpc(
      "create_messages_table"
    );
    if (messagesError) {
      console.error("Error creating messages table:", messagesError);
      return;
    }

    const { error: channelsError } = await supabase.rpc(
      "create_channels_table"
    );
    if (channelsError) {
      console.error("Error creating channels table:", channelsError);
      return;
    }

    const { error: relationshipsError } = await supabase.rpc(
      "create_user_relationships_table"
    );
    if (relationshipsError) {
      console.error(
        "Error creating user_relationships table:",
        relationshipsError
      );
      return;
    }

    // Check if general channel exists
    const { data: generalChannel, error: generalError } = await supabase
      .from("channels")
      .select("*")
      .eq("name", "General")
      .single();

    if (generalError && generalError.code !== "PGRST116") {
      console.error("Error checking general channel:", generalError);
      return;
    }

    // Create general channel if it doesn't exist
    if (!generalChannel) {
      const { error: createError } = await supabase.from("channels").insert([
        {
          name: "General",
          description: "General discussion channel",
          is_private: false,
          created_by: "00000000-0000-0000-0000-000000000000", // System user ID
        },
      ]);

      if (createError) {
        console.error("Error creating general channel:", createError);
        return;
      }

      console.log("Created default General channel");
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

module.exports = { initializeDatabase };
