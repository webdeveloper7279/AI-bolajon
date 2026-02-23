import { Router } from "express";
import { Child } from "../models/Child.js";

const router = Router();

// Reyting: barcha ro'yxatdan o'tgan bolalar — faqat ism va ball ko'rinadi, boshqa shaxsiy ma'lumot yo'q
router.get("/", async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const children = await Child.find()
      .sort({ totalXp: -1 })
      .limit(limit)
      .select("name totalXp level")
      .lean();

    const list = children.map((c, i) => ({
      rank: i + 1,
      childName: c.name,
      totalXp: c.totalXp || 0,
      level: c.level || 1,
    }));

    res.json(list);
  } catch (e) {
    next(e);
  }
});

export default router;
