import { Router } from "express";
import { Child } from "../models/Child.js";
import { LessonProgress } from "../models/LessonProgress.js";
import { Lesson } from "../models/Lesson.js";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { childIdParamSchema } from "../validators/child.js";
import { xpToLevel } from "../services/achievementService.js";

const router = Router();
router.use(authMiddleware);

router.get("/child/:id", validate(childIdParamSchema, { params: true }), async (req, res, next) => {
  try {
    const { id: childId } = req.validParams;
    const child = await Child.findOne({ _id: childId, parentId: req.user._id }).lean();
    if (!child) return res.status(404).json({ error: "Child not found" });

    const totalLessons = await Lesson.countDocuments({ isPublished: true });
    const completedCount = await LessonProgress.countDocuments({ childId });
    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    const { level, currentXp, xpForNextLevel } = xpToLevel(child.totalXp || 0);

    res.json({
      childId,
      totalXp: child.totalXp || 0,
      level,
      currentXp,
      xpForNextLevel,
      completedLessons: completedCount,
      totalLessons,
      progressPercent,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
