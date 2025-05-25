const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify the token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(403).json({ error: "Invalid token" });
    }

    // Add user info to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Error authenticating token:", error);
    res.status(500).json({ error: "Error authenticating token" });
  }
};

module.exports = { authenticateToken };
