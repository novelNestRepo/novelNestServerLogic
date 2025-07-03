// Request password reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const { data, error } =
      await require("../models/user.model").default.requestPasswordReset(email);
    if (error) {
      return res
        .status(400)
        .json({ error: error.message || "Failed to send reset email" });
    }
    return res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("Error in requestPasswordReset:", err);
    return res
      .status(500)
      .json({ error: "Server error during password reset request" });
  }
};

// Handle password reset (Supabase handles this via email link, but you can add a placeholder)
exports.resetPassword = async (req, res) => {
  return res
    .status(501)
    .json({
      error: "Password reset is handled via email link sent by Supabase.",
    });
};

// Send email verification (Supabase sends automatically, but you can trigger resend)
exports.resendEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    // Supabase does not have a direct resend endpoint, but you can re-trigger signUp
    const { data, error } =
      await require("../models/user.model").default.resendEmailVerification(
        email
      );
    if (error) {
      return res
        .status(400)
        .json({
          error: error.message || "Failed to resend verification email",
        });
    }
    return res.status(200).json({ message: "Verification email resent" });
  } catch (err) {
    console.error("Error in resendEmailVerification:", err);
    return res
      .status(500)
      .json({ error: "Server error during email verification resend" });
  }
};
const UserModel = require("./../models/user.model");

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Registration attempt:", { email });

    if (!email || !password) {
      console.log("Missing email or password");
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { data, error } = await UserModel.createUser(email, password);
    console.log("Supabase response:", { data, error });

    if (error) {
      console.error("Registration error:", error);
      return res
        .status(400)
        .json({ error: error.message || "Registration failed" });
    }

    if (!data || !data.user) {
      console.error("No user data returned");
      return res.status(400).json({ error: "Failed to create user" });
    }

    // Return user info and session in the expected format
    return res.status(201).json({
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      session: {
        access_token: data.session?.access_token,
      },
    });
  } catch (err) {
    console.error("Server error during registration:", err);
    return res.status(500).json({ error: "Server error during registration" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { data, error } = await UserModel.loginUser(email, password);

    if (error) {
      return res
        .status(401)
        .json({ error: error.message || "Invalid credentials" });
    }

    // Return user info and session in the expected format
    return res.status(200).json({
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      session: {
        access_token: data.session.access_token,
      },
    });
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).json({ error: "Server error during login" });
  }
};

exports.logout = async (req, res) => {
  try {
    const { error } = await UserModel.logoutUser();

    if (error) {
      return res.status(400).json({ error: error.message || "Logout failed" });
    }

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).json({ error: "Server error during logout" });
  }
};

exports.getUser = async (req, res) => {
  try {
    const { data, error } = await UserModel.getCurrentUser();

    if (error) {
      return res
        .status(401)
        .json({ error: error.message || "Authentication failed" });
    }

    if (!data.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    return res.status(200).json({
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (err) {
    console.error(err.message || err);
    return res.status(500).json({ error: "Server error retrieving user" });
  }
};
