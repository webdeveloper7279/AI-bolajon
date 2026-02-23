import { Router } from "express";
import { GameScore } from "../models/GameScore.js";
import { Child } from "../models/Child.js";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { submitGameScoreSchema } from "../validators/game.js";
import { checkAndUnlockAchievements, xpToLevel } from "../services/achievementService.js";

const router = Router();
const XP_PER_SCORE_POINT = 2;
const MAX_XP_PER_GAME = 100;

router.post(
  "/submit",
  authMiddleware,
  validate(submitGameScoreSchema),
  async (req, res, next) => {
    try {
      const { childId, gameType, score, maxScore, metadata } = req.valid;

      const child = await Child.findOne({ _id: childId, parentId: req.user._id });
      if (!child) return res.status(404).json({ error: "Child not found" });

      const percent = Math.min(100, Math.round((score / maxScore) * 100));
      const xpEarned = Math.min(MAX_XP_PER_GAME, Math.round(percent * (XP_PER_SCORE_POINT / 10)));

      await GameScore.create({
        childId,
        gameType,
        score,
        maxScore,
        xpEarned,
        metadata,
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
