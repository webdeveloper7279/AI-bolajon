import mongoose from "mongoose";

const gameScoreSchema = new mongoose.Schema(
  {
    childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true },
    gameType: { type: String, required: true, enum: ["logic", "math"] },
    score: { type: Number, required: true, min: 0 },
    maxScore: { type: Number, required: true },
    xpEarned: { type: Number, default: 0 },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

gameScoreSchema.index({ childId: 1, gameType: 1, createdAt: -1 });

export const GameScore = mongoose.model("GameScore", gameScoreSchema);
