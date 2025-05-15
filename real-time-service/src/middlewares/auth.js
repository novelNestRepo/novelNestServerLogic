const jwt = require("jsonwebtoken");

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }

  const user = verifyToken(token);
  if (!user) {
    return next(new Error("Authentication error: Invalid token"));
  }

  socket.user = user;
  next();
};

const authenticateHttp = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: "Invalid token" });
  }

  req.user = user;
  next();
};

module.exports = {
  verifyToken,
  authenticateSocket,
  authenticateHttp,
};
