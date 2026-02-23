import mongoose from "mongoose";

const lessonProgressSchema = new mongoose.Schema(
  {
    childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    xpEarned: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now },
    timeSpentSeconds: { type: Number, default: 0 },
  },
  { timestamps: true }
);

lessonProgressSchema.index({ childId: 1, lessonId: 1 }, { unique: true });

export const LessonProgress = mongoose.model("LessonProgress", lessonProgressSchema);
