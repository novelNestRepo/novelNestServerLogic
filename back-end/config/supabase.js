const { createClient } = require("@supabase/supabase-js");

const supabaseUrl =
  process.env.SUPABASE_URL || "https://rjjdutprvrlrtmjtesfg.supabase.co";
const supabaseKey =
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqamR1dHBydnJscnRtanRlc2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1Mjg4MTMsImV4cCI6MjA1ODEwNDgxM30.yIu03W0BVWisiVF0FhqEC1Kl6U3gKNusUin6DBMu3TU";

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL and Key must be provided");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Test the connection
supabase
  .from("channels")
  .select("count")
  .then(({ data, error }) => {
    if (error) {
      console.error("Supabase connection error:", error);
    } else {
      console.log("Supabase connected successfully");
    }
  });

module.exports = supabase;
