import mongoose from "mongoose";

const childSchema = new mongoose.Schema(
  {
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 3, max: 12 },
    interests: [{ type: String, trim: true }],
    avatar: { type: String, default: null },
    totalXp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
  },
  { timestamps: true }
);

childSchema.index({ parentId: 1 });

export const Child = mongoose.model("Child", childSchema);
