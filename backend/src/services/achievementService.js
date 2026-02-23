import { Achievement } from "../models/Achievement.js";
import { Child } from "../models/Child.js";
import { LessonProgress } from "../models/LessonProgress.js";
import { GameScore } from "../models/GameScore.js";
import { VideoProgress } from "../models/VideoProgress.js";

const ACHIEVEMENT_DEFS = [
  { type: "first_lesson", name: "Birinchi dars", description: "Birinchi darsni tugatdingiz", xpBonus: 25 },
  { type: "five_lessons", name: "5 ta dars", description: "5 ta darsni tugatdingiz", xpBonus: 50 },
  { type: "ten_lessons", name: "10 ta dars", description: "10 ta darsni tugatdingiz", xpBonus: 100 },
  { type: "first_game", name: "Birinchi o'yin", description: "Birinchi o'yinni o'ynadingiz", xpBonus: 20 },
  { type: "first_video", name: "Birinchi video", description: "Birinchi videoni ko'rdingiz", xpBonus: 15 },
  { type: "level_3", name: "3-daraja", description: "3-darajaga yetdingiz", xpBonus: 75 },
  { type: "level_5", name: "5-daraja", description: "5-darajaga yetdingiz", xpBonus: 150 },
];

export async function checkAndUnlockAchievements(childId, io, eventPayload = {}) {
  const child = await Child.findById(childId).lean();
  if (!child) return [];

  const unlocked = [];
  const existing = await Achievement.find({ childId }).select("type").lean();
  const have = new Set(existing.map((a) => a.type));

  const lessonCount = await LessonProgress.countDocuments({ childId });
  const gameCount = await GameScore.countDocuments({ childId });
  const videoCount = await VideoProgress.countDocuments({ childId, completed: true });
  const level = child.level || 1;

  const toUnlock = [
    lessonCount >= 1 && "first_lesson",
    lessonCount >= 5 && "five_lessons",
    lessonCount >= 10 && "ten_lessons",
    gameCount >= 1 && "first_game",
    videoCount >= 1 && "first_video",
    level >= 3 && "level_3",
    level >= 5 && "level_5",
  ].filter(Boolean);

  for (const type of toUnlock) {
    if (have.has(type)) continue;
    const def = ACHIEVEMENT_DEFS.find((d) => d.type === type);
    if (!def) continue;
    const achievement = await Achievement.create({
      childId,
      type: def.type,
      name: def.name,
      description: def.description,
      xpBonus: def.xpBonus,
    });
    await Child.findByIdAndUpdate(childId, { $inc: { totalXp: def.xpBonus } });
    have.add(type);
    unlocked.push({ ...def, _id: achievement._id });
    if (io) {
      io.to(`child:${childId}`).emit("achievement_unlocked", {
        achievement: { ...def, _id: achievement._id },
        ...eventPayload,
      });
      io.emit("leaderboard_updated");
    }
  }
  return unlocked;
}

export function xpToLevel(xp) {
  let level = 1;
  let required = 100;
  let total = 0;
  while (total + required <= xp) {
    total += required;
    level++;
    required = Math.floor(required * 1.2);
  }
  return { level, currentXp: xp - total, xpForNextLevel: required };
}
