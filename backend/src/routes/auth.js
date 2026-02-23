import { Router } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validators/auth.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_EXPIRY = "7d";

router.post("/register", validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, name } = req.valid;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already registered" });
    const user = await User.create({ email, password, name });
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    res.status(201).json({
      user: { id: user._id, email: user.email, name: user.name },
      token,
      expiresIn: JWT_EXPIRY,
    });
  } catch (e) {
    next(e);
  }
});

router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.valid;
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ error: "Invalid email or password" });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: "Invalid email or password" });
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    res.json({
      user: { id: user._id, email: user.email, name: user.name },
      token,
      expiresIn: JWT_EXPIRY,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
