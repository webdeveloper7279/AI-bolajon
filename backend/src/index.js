import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authMiddleware } from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";
import childrenRoutes from "./routes/children.js";
import lessonsRoutes from "./routes/lessons.js";
import progressRoutes from "./routes/progress.js";
import videosRoutes from "./routes/videos.js";
import gamesRoutes from "./routes/games.js";
import chatRoutes from "./routes/chat.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import dashboardRoutes from "./routes/dashboard.js";
import lessonProgressRoutes from "./routes/lessonProgress.js";
import achievementsRoutes from "./routes/achievements.js";
import jwt from "jsonwebtoken";
import { User } from "./models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

try {
  await connectDB();
} catch (err) {
  console.error("Exiting: database connection failed.");
  process.exit(1);
}

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ["GET", "POST"] },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Auth required"));
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  socket.on("subscribe_child", (childId) => {
    socket.join(`child:${childId}`);
  });
  socket.on("unsubscribe_child", (childId) => {
    socket.leave(`child:${childId}`);
  });
});

app.set("io", io);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: "Too many requests" },
  })
);

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/children", childrenRoutes);
app.use("/api/lessons", lessonsRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/videos", videosRoutes);
app.use("/api/games", gamesRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/lesson-progress", lessonProgressRoutes);
app.use("/api/achievements", achievementsRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
