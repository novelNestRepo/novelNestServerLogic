const supabase = require("./supabase");

async function initializeDatabase() {
  try {
    console.log("Initializing database...");

    // Create channels table
    const { error: createChannelsError } = await supabase
      .from("channels")
      .select("id")
      .limit(1);

    if (createChannelsError) {
      console.error("Error checking channels table:", createChannelsError);
      return;
    }

    // Create channel_members table
    const { error: createMembersError } = await supabase
      .from("channel_members")
      .select("id")
      .limit(1);

    if (createMembersError) {
      console.error(
        "Error checking channel_members table:",
        createMembersError
      );
      return;
    }

    // Create default general channel if it doesn't exist
    const { data: existingChannel, error: checkError } = await supabase
      .from("channels")
      .select("id")
      .eq("name", "General")
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking for existing channel:", checkError);
      return;
    }

    if (!existingChannel) {
      const { error: insertError } = await supabase.from("channels").insert([
        {
          name: "General",
          description: "General voice channel",
        },
      ]);

      if (insertError) {
        console.error("Error creating default channel:", insertError);
        return;
      }
      console.log("Created default General channel");
    } else {
      console.log("General channel already exists");
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

module.exports = { initializeDatabase };
