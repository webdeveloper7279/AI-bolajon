import "dotenv/config";
import mongoose from "mongoose";
import { Video } from "./models/Video.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ai-bolajon";

const youtubeVideo = {
  title: "YouTube Shorts video",
  description: "YouTube dan video",
  url: "https://www.youtube.com/embed/WO87qGh7btI",
  durationSeconds: 60,
  category: "YouTube",
  order: 0,
  isSafe: true,
};

async function addVideo() {
  await mongoose.connect(MONGODB_URI);
  const exists = await Video.findOne({ url: youtubeVideo.url });
  if (exists) {
    console.log("Video allaqachon mavjud.");
    process.exit(0);
    return;
  }
  await Video.create(youtubeVideo);
  console.log("YouTube video qo'shildi.");
  process.exit(0);
}

addVideo().catch((e) => {
  console.error(e);
  process.exit(1);
});
