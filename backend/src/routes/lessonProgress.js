import { Router } from "express";
import { LessonProgress } from "../models/LessonProgress.js";
import { Child } from "../models/Child.js";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { childIdParamSchema } from "../validators/child.js";

const router = Router();
router.use(authMiddleware);

router.get("/child/:id", validate(childIdParamSchema, { params: true }), async (req, res, next) => {
  try {
    const childId = req.validParams.id;
    const child = await Child.findOne({ _id: childId, parentId: req.user._id });
    if (!child) return res.status(404).json({ error: "Child not found" });

    const list = await LessonProgress.find({ childId })
      .populate("lessonId", "title category difficulty xpReward order")
      .sort({ completedAt: -1 })
      .lean();

    res.json(list.map((p) => ({ lessonId: p.lessonId?._id, score: p.score, xpEarned: p.xpEarned, completedAt: p.completedAt })));
  } catch (e) {
    next(e);
  }
});

export default router;
