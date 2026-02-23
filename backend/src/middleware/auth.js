import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token required" });
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    User.findById(decoded.userId)
      .then((user) => {
        if (!user) return res.status(401).json({ error: "User not found" });
        req.user = user;
        next();
      })
      .catch(() => res.status(401).json({ error: "Invalid token" }));
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return next();
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    User.findById(decoded.userId)
      .then((user) => {
        req.user = user || null;
        next();
      })
      .catch(() => next());
  } catch {
    next();
  }
}
