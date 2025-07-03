const express = require("express");
const router = express.Router();
const authController = require("../controllers/user.controller");
const { authenticateToken } = require("../middleware/auth");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

// Password reset
router.post("/request-password-reset", authController.requestPasswordReset);
router.post("/reset-password", authController.resetPassword); // Placeholder, handled by Supabase

// Resend email verification
router.post(
  "/resend-email-verification",
  authController.resendEmailVerification
);

// Get current user (protected)
router.get("/me", authenticateToken, authController.getUser);

module.exports = router;
