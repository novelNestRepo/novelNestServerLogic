import { db } from "../config/db";
import { channels } from "../models/channel";
import { channelMembers } from "../models/channelMember";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";

export const createChannel = async (req: Request, res: Response) => {
  try {
    const { name, user_id } = req.body;
    if (!name || !user_id) {
      return res.status(400).json({ error: "Name and user_id are required" });
    }
    const channelId = uuidv4();
    await db.insert(channels).values({
      id: channelId,
      name,
      created_by: user_id,
    });
    await db.insert(channelMembers).values({
      channel_id: channelId,
      user_id,
    });
    // Generate join link (could be /join/:channelId)
    const joinLink = `/channels/${channelId}/join`;
    return res.status(201).json({ channelId, joinLink });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create channel" });
  }
};

export const joinChannel = async (req: Request, res: Response) => {
  try {
    const { channelId } = req.params;
    const { user_id } = req.body;
    if (!channelId || !user_id) {
      return res
        .status(400)
        .json({ error: "channelId and user_id are required" });
    }
    // Check if already a member
    const existing = await db.query.channelMembers.findFirst({
      where: (cm, { eq }) =>
        eq(cm.channel_id, channelId) && eq(cm.user_id, user_id),
    });
    if (existing) {
      return res.status(200).json({ message: "Already a member" });
    }
    await db.insert(channelMembers).values({
      channel_id: channelId,
      user_id,
    });
    return res.status(200).json({ message: "Joined channel" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to join channel" });
  }
};
