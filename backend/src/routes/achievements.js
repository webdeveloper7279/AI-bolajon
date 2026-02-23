import { Router } from "express";
import { Achievement } from "../models/Achievement.js";
import { Child } from "../models/Child.js";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { childIdParamSchema } from "../validators/child.js";

const router = Router();
router.use(authMiddleware);

router.get(
  "/child/:id",
  validate(childIdParamSchema, { params: true }),
  async (req, res, next) => {
    try {
      const childId = req.validParams.id;
      const child = await Child.findOne({ _id: childId, parentId: req.user._id });
      if (!child) return res.status(404).json({ error: "Child not found" });

      const achievements = await Achievement.find({ childId })
        .sort({ unlockedAt: -1 })
        .lean();

      const totalStars = achievements.reduce((s, a) => s + (a.xpBonus || 0) / 10, 0);
      const streak = 0; // TODO: calculate from activity

      res.json({
        childId,
        totalStars: Math.round(totalStars) || achievements.length * 3,
        achievementCount: achievements.length,
        streak,
        achievements: achievements.map((a) => ({
          _id: a._id,
          type: a.type,
          name: a.name,
          description: a.description,
          xpBonus: a.xpBonus,
          unlockedAt: a.unlockedAt,
        })),
      });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
