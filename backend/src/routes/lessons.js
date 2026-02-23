import { Router } from "express";
import { Lesson } from "../models/Lesson.js";
import { LessonProgress } from "../models/LessonProgress.js";
import { Child } from "../models/Child.js";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { completeLessonSchema, lessonIdParamSchema } from "../validators/lesson.js";
import { checkAndUnlockAchievements, xpToLevel } from "../services/achievementService.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const lessons = await Lesson.find({ isPublished: true })
      .sort({ category: 1, order: 1, createdAt: 1 })
      .lean();
    res.json(lessons);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", validate(lessonIdParamSchema, { params: true }), async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.validParams.id).lean();
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });
    res.json(lesson);
  } catch (e) {
    next(e);
  }
});

router.post(
  "/complete",
  authMiddleware,
  validate(completeLessonSchema),
  async (req, res, next) => {
    try {
      const { lessonId, score, timeSpentSeconds, childId } = req.valid;
      const child = await Child.findOne({ _id: childId, parentId: req.user._id });
      if (!child) return res.status(404).json({ error: "Child not found" });

      const lesson = await Lesson.findById(lessonId).lean();
      if (!lesson) return res.status(404).json({ error: "Lesson not found" });

      const existing = await LessonProgress.findOne({ childId, lessonId });
      if (existing) return res.status(400).json({ error: "Lesson already completed" });

      const xpEarned = Math.round((score / 100) * (lesson.xpReward || 50));
      await LessonProgress.create({
        childId,
        lessonId,
        score,
        xpEarned,
        timeSpentSeconds: timeSpentSeconds || 0,
      });

      const updated = await Child.findByIdAndUpdate(
        childId,
        { $inc: { totalXp: xpEarned } },
        { new: true }
      ).lean();

      const { level } = xpToLevel(updated.totalXp);
      await Child.updateOne({ _id: childId }, { $set: { level } });

      const achievements = await checkAndUnlockAchievements(childId, req.io);

      if (req.io) {
        req.io.to(`child:${childId}`).emit("xp_updated", {
          totalXp: updated.totalXp,
          xpEarned,
          level,
        });
        req.io.emit("leaderboard_updated");
      }

      res.json({
        xpEarned,
        totalXp: updated.totalXp,
        level,
        achievements,
      });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
