import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true },
    type: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    xpBonus: { type: Number, default: 0 },
    unlockedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

achievementSchema.index({ childId: 1, type: 1 }, { unique: true });

export const Achievement = mongoose.model("Achievement", achievementSchema);
