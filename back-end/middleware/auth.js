const UserModel = require("../models/user.model");

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Get current user
    const { data, error } = await UserModel.getCurrentUser();

    if (error || !data.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Set user in request object
    req.user = data.user;
    next();
  } catch (err) {
    console.error(err.message || err);
    return res
      .status(500)
      .json({ error: "Server error during authentication" });
  }
};

module.exports = authMiddleware;
