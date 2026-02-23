import { Router } from "express";
import { Child } from "../models/Child.js";
import { Lesson } from "../models/Lesson.js";
import { LessonProgress } from "../models/LessonProgress.js";
import { GameScore } from "../models/GameScore.js";
import { VideoProgress } from "../models/VideoProgress.js";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { childIdParamSchema } from "../validators/child.js";

const router = Router();
router.use(authMiddleware);

router.get(
  "/analytics/:id",
  validate(childIdParamSchema, { params: true }),
  async (req, res, next) => {
    try {
      const childId = req.validParams.id;
      const child = await Child.findOne({ _id: childId, parentId: req.user._id }).lean();
      if (!child) return res.status(404).json({ error: "Child not found" });

      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const totalLessons = await Lesson.countDocuments({ isPublished: true });
      const [completedLessons, gameScores, gameBreakdown, videoProgress, weeklyProgress] = await Promise.all([
        LessonProgress.countDocuments({ childId }),
        GameScore.aggregate([
          { $match: { childId: child._id } },
          { $group: { _id: null, totalScore: { $sum: "$score" }, totalMax: { $sum: "$maxScore" }, count: { $sum: 1 } } },
        ]).then((r) => r[0] || { totalScore: 0, totalMax: 0, count: 0 }),
        GameScore.aggregate([
          { $match: { childId: child._id } },
          { $group: { _id: "$gameType", totalScore: { $sum: "$score" }, totalMax: { $sum: "$maxScore" } } },
        ]),
        VideoProgress.aggregate([
          { $match: { childId: child._id } },
          { $group: { _id: null, totalWatched: { $sum: "$watchedSeconds" }, completed: { $sum: { $cond: ["$completed", 1, 0] } } } },
        ]).then((r) => r[0] || { totalWatched: 0, completed: 0 }),
        LessonProgress.aggregate([
          { $match: { childId: child._id, completedAt: { $gte: weekAgo } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
              count: { $sum: 1 },
              xp: { $sum: "$xpEarned" },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

      const totalStudyTimeSeconds =
        (await LessonProgress.aggregate([
          { $match: { childId: child._id } },
          { $group: { _id: null, total: { $sum: "$timeSpentSeconds" } } },
        ]).then((r) => r[0]?.total || 0)) +
        (videoProgress.totalWatched || 0);

      const mathGames = gameBreakdown.find((g) => g._id === "math");
      const logicGames = gameBreakdown.find((g) => g._id === "logic");
      const mathPercent = mathGames && mathGames.totalMax > 0
        ? Math.min(100, Math.round((mathGames.totalScore / mathGames.totalMax) * 100))
        : 0;
      const logicPercent = logicGames && logicGames.totalMax > 0
        ? Math.min(100, Math.round((logicGames.totalScore / logicGames.totalMax) * 100))
        : 0;
      const gamesPercent = gameScores.totalMax > 0
        ? Math.min(100, Math.round((gameScores.totalScore / gameScores.totalMax) * 100))
        : 0;
      const matematikPercent = totalLessons > 0
        ? Math.min(100, Math.round((completedLessons / totalLessons) * 100))
        : 0;

      res.json({
        childId,
        totalXp: child.totalXp || 0,
        level: child.level || 1,
        completedLessons,
        totalLessons,
        totalStudyTimeSeconds,
        weeklyProgress: weeklyProgress.map((d) => ({
          date: d._id,
          lessonsCompleted: d.count,
          xpEarned: d.xp,
        })),
        gamesPlayed: gameScores.count,
        videosCompleted: videoProgress.completed,
        resultsOverview: {
          matematik: Math.round((matematikPercent + mathPercent) / 2) || matematikPercent,
          mantiq: logicPercent,
          oyinlar: gamesPercent,
        },
      });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
