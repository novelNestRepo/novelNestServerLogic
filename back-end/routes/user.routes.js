const express = require("express");
const router = express.Router();
const authController = require("../controllers/user.controller");
const { auth } = require("../config/supabase");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", authController.getUser);

module.exports = router;
