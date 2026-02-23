import { Router } from "express";
import { Child } from "../models/Child.js";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createChildSchema, updateChildSchema, childIdParamSchema } from "../validators/child.js";
import { xpToLevel } from "../services/achievementService.js";

const router = Router();
router.use(authMiddleware);

router.post("/", validate(createChildSchema), async (req, res, next) => {
  try {
    const child = await Child.create({
      parentId: req.user._id,
      ...req.valid,
    });
    res.status(201).json(child);
  } catch (e) {
    next(e);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const list = await Child.find({ parentId: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", validate(childIdParamSchema, { params: true }), async (req, res, next) => {
  try {
    const child = await Child.findOne({
      _id: req.validParams.id,
      parentId: req.user._id,
    }).lean();
    if (!child) return res.status(404).json({ error: "Child not found" });
    const { level } = xpToLevel(child.totalXp || 0);
    res.json({ ...child, level });
  } catch (e) {
    next(e);
  }
});

router.patch(
  "/:id",
  validate(childIdParamSchema, { params: true }),
  validate(updateChildSchema, { bodyOnly: true }),
  async (req, res, next) => {
    try {
      const child = await Child.findOneAndUpdate(
        { _id: req.validParams.id, parentId: req.user._id },
        { $set: req.valid },
        { new: true, runValidators: true }
      );
      if (!child) return res.status(404).json({ error: "Child not found" });
      res.json(child);
    } catch (e) {
      next(e);
    }
  }
);

router.delete(
  "/:id",
  validate(childIdParamSchema, { params: true }),
  async (req, res, next) => {
    try {
      const result = await Child.findOneAndDelete({
        _id: req.validParams.id,
        parentId: req.user._id,
      });
      if (!result) return res.status(404).json({ error: "Child not found" });
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

export default router;
