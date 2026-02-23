import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    url: { type: String, required: true },
    thumbnail: { type: String },
    durationSeconds: { type: Number, required: true },
    category: { type: String, trim: true },
    isSafe: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Video = mongoose.model("Video", videoSchema);
