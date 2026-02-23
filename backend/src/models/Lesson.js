import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [String],
  correctAnswer: { type: String, required: true },
  type: { type: String, enum: ["multiple", "text"], default: "multiple" },
});

const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    difficulty: { type: Number, required: true, min: 1, max: 5 },
    content: { type: String, required: true },
    questions: [questionSchema],
    xpReward: { type: Number, default: 50 },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

lessonSchema.index({ category: 1, order: 1 });

export const Lesson = mongoose.model("Lesson", lessonSchema);
