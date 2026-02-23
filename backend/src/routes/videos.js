import { Router } from "express";
import { Video } from "../models/Video.js";
import { VideoProgress } from "../models/VideoProgress.js";
import { Child } from "../models/Child.js";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { videoProgressSchema } from "../validators/video.js";
import { checkAndUnlockAchievements } from "../services/achievementService.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const videos = await Video.find().sort({ order: 1, createdAt: 1 }).lean();
    res.json(videos);
  } catch (e) {
    next(e);
  }
});

router.post(
  "/progress",
  authMiddleware,
  validate(videoProgressSchema),
  async (req, res, next) => {
    try {
      const { videoId, watchedSeconds, completed } = req.valid;
      const childId = req.valid.childId;

      const child = await Child.findOne({ _id: childId, parentId: req.user._id });
      if (!child) return res.status(404).json({ error: "Child not found" });

      const video = await Video.findById(videoId).lean();
      if (!video) return res.status(404).json({ error: "Video not found" });

      const completionPercent = Math.min(
        100,
        Math.round((watchedSeconds / video.durationSeconds) * 100)
      );

      const update = {
        watchedSeconds,
        completed: completed || completionPercent >= 90,
      };
      if (update.completed) update.completedAt = new Date();

      const progress = await VideoProgress.findOneAndUpdate(
        { childId, videoId },
        { $set: update },
        { new: true, upsert: true }
      ).lean();

      const achievements = await checkAndUnlockAchievements(childId, req.io);

      res.json({
        progress: {
          ...progress,
          completionPercent,
        },
        achievements,
      });
    } catch (e) {
      next(e);
    }
  }
);

router.get("/progress/:childId", authMiddleware, async (req, res, next) => {
  try {
    const childId = req.params.childId;
    const child = await Child.findOne({ _id: childId, parentId: req.user._id });
    if (!child) return res.status(404).json({ error: "Child not found" });

    const list = await VideoProgress.find({ childId })
      .populate("videoId", "title durationSeconds thumbnail")
      .lean();
    res.json(list);
  } catch (e) {
    next(e);
  }
});

export default router;
