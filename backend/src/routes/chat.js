import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { chatMessageSchema } from "../validators/chat.js";
import { Child } from "../models/Child.js";
import { chatWithAI } from "../services/openaiService.js";

const router = Router();
router.use(authMiddleware);

router.post("/message", validate(chatMessageSchema), async (req, res, next) => {
  try {
    const { childId, message } = req.valid;
    const child = await Child.findOne({ _id: childId, parentId: req.user._id });
    if (!child) return res.status(404).json({ error: "Child not found" });

    const { reply, tokensUsed } = await chatWithAI(childId, message);

    res.json({ reply, tokensUsed });
  } catch (e) {
    next(e);
  }
});

router.get("/history/:childId", async (req, res, next) => {
  try {
    const childId = req.params.childId;
    const child = await Child.findOne({ _id: childId, parentId: req.user._id });
    if (!child) return res.status(404).json({ error: "Child not found" });

    const { ChatHistory } = await import("../models/ChatHistory.js");
    const chat = await ChatHistory.findOne({ childId }).lean();
    res.json({ messages: chat?.messages || [] });
  } catch (e) {
    next(e);
  }
});

export default router;
