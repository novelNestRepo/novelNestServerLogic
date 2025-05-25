const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Hardcoded credentials (temporary solution)
const SUPABASE_URL = "https://rjjdutprvrlrtmjtesfg.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqamR1dHBydnJscnRtanRlc2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1Mjg4MTMsImV4cCI6MjA1ODEwNDgxM30.yIu03W0BVWisiVF0FhqEC1Kl6U3gKNusUin6DBMu3TU";
const SUPABASE_SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqamR1dHBydnJscnRtanRlc2ZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjUyODgxMywiZXhwIjoyMDU4MTA0ODEzfQ.sTUC5dKobOkOf3LENtqnCg5op-0DtVb6isJkXPL1FlY";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_KEY) {
  throw new Error("Missing Supabase environment variables");
}

// Initialize Supabase client with better error handling
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
    storage: {
      getItem: (key) => null,
      setItem: (key, value) => {},
      removeItem: (key) => {},
    },
  },
});

// Initialize admin client for privileged operations
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
    storage: {
      getItem: (key) => null,
      setItem: (key, value) => {},
      removeItem: (key) => {},
    },
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

module.exports = { supabase, supabaseAdmin };
