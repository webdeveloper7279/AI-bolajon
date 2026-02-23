import "dotenv/config";
import mongoose from "mongoose";
import { Lesson } from "./models/Lesson.js";
import { Video } from "./models/Video.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ai-bolajon";

const lessons = [
  {
    title: "Alifbe — A dan O gacha",
    category: "Alifbe",
    difficulty: 1,
    content: "Bugun A, B, V, G, D harflarini o'rganamiz. Har bir harf uchun rasmlar va misollar.",
    questions: [
      { text: "A harfi qanday talaffuz qilinadi?", options: ["A", "O", "U"], correctAnswer: "A", type: "multiple" },
      { text: "B harfini tanlang", options: ["B", "P", "D"], correctAnswer: "B", type: "multiple" },
    ],
    xpReward: 50,
    order: 1,
  },
  {
    title: "Raqamlar 1-5",
    category: "Raqamlar",
    difficulty: 1,
    content: "1, 2, 3, 4, 5 raqamlarini o'rganamiz. Sanash mashqlari.",
    questions: [
      { text: "3 ta olma nechta?", options: ["2", "3", "4"], correctAnswer: "3", type: "multiple" },
      { text: "5 ning oldingisi qaysi raqam?", options: ["3", "4", "6"], correctAnswer: "4", type: "multiple" },
    ],
    xpReward: 50,
    order: 1,
  },
  {
    title: "Ranglar",
    category: "Ranglar",
    difficulty: 1,
    content: "Qizil, ko'k, yashil, sariq ranglari. Atamalar va mashqlar.",
    questions: [
      { text: "Quyosh qanday rang?", options: ["Ko'k", "Sariq", "Yashil"], correctAnswer: "Sariq", type: "multiple" },
    ],
    xpReward: 40,
    order: 1,
  },
];

const videos = [
  { title: "YouTube Shorts video", description: "YouTube dan video", url: "https://www.youtube.com/embed/WO87qGh7btI", durationSeconds: 60, category: "YouTube", order: 1, isSafe: true },
  { title: "Alifbe o'rganamiz", description: "A-Z harflar", url: "https://example.com/v1", durationSeconds: 320, category: "Alifbe", order: 2 },
  { title: "Raqamlar 1-10", description: "Raqamlarni o'rganish", url: "https://example.com/v2", durationSeconds: 255, category: "Raqamlar", order: 3 },
  { title: "Ranglar va shakllar", description: "Ranglar", url: "https://example.com/v3", durationSeconds: 360, category: "Ranglar", order: 4 },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  await Lesson.deleteMany({});
  await Video.deleteMany({});
  await Lesson.insertMany(lessons);
  await Video.insertMany(videos);
  console.log("Seed done: lessons and videos added.");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
