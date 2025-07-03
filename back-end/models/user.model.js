const supabase = require("../config/supabase");

class UserModel {
  // Request password reset
  static async requestPasswordReset(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo:
          process.env.FRONTEND_URL ||
          "http://localhost:3000/auth/reset-password",
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Resend email verification (Supabase workaround: re-trigger signUp)
  static async resendEmailVerification(email) {
    try {
      // This will send a new verification email if the user exists and is unverified
      const { data, error } = await supabase.auth.signUp({
        email,
        password: "dummy-password", // Supabase will error if user exists, but still sends email
        options: {
          emailRedirectTo:
            process.env.FRONTEND_URL || "http://localhost:3000/auth/callback",
        },
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
  static async createUser(email, password) {
    try {
      console.log("Creating user with email:", email);

      // Validate email and password
      if (!email || !email.includes("@")) {
        throw new Error("Invalid email format");
      }

      if (!password || password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${
            process.env.FRONTEND_URL || "http://localhost:8080"
          }/auth/callback`,
          data: {
            email_confirmed: false,
          },
        },
      });

      console.log("Supabase signUp response:", { data, error });

      if (error) {
        console.error("Supabase signUp error:", error);
        throw error;
      }

      if (!data || !data.user) {
        throw new Error("No user data returned from Supabase");
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error in createUser:", error);
      return { data: null, error };
    }
  }

  static async loginUser(email, password) {
    try {
      console.log("Attempting login for email:", email);

      if (!supabase || !supabase.auth) {
        throw new Error("Supabase auth client not initialized");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Supabase login error:", error);
        throw error;
      }

      console.log("Login successful for user:", data.user?.id);
      return { data, error: null };
    } catch (error) {
      console.error("Error in loginUser:", error);
      return { data: null, error };
    }
  }

  static async logoutUser() {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error("Error in logoutUser:", error);
      return { error };
    }
  }

  static async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      return { data, error };
    } catch (error) {
      console.error("Error in getCurrentUser:", error);
      return { data: null, error };
    }
  }

  static async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      return { data, error };
    } catch (error) {
      console.error("Error in refreshSession:", error);
      return { data: null, error };
    }
  }
}

module.exports = UserModel;
