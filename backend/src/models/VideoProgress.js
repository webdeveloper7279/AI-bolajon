import mongoose from "mongoose";

const videoProgressSchema = new mongoose.Schema(
  {
    childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true },
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
    watchedSeconds: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

videoProgressSchema.index({ childId: 1, videoId: 1 }, { unique: true });

export const VideoProgress = mongoose.model("VideoProgress", videoProgressSchema);
