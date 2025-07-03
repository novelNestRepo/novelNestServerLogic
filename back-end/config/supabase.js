const { createClient } = require("@supabase/supabase-js");
const environment = require('./environment')

// Hardcoded credentials (temporary solution)
const SUPABASE_URL = environment.SUPABASE_URL;
const SUPABASE_ANON_KEY = environment.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY =environment.SUPABASE_SERVICE_KEY;

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
