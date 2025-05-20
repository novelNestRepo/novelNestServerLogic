import { Router } from "express";
import { createChannel, joinChannel } from "../controllers/channelController";

const router = Router();

router.post("/", createChannel); // POST /channels
router.post("/:channelId/join", joinChannel); // POST /channels/:channelId/join

export default router;
