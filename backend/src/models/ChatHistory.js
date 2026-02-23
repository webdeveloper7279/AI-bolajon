import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  tokens: { type: Number, default: 0 },
});

const chatHistorySchema = new mongoose.Schema(
  {
    childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true },
    messages: [messageSchema],
  totalTokensUsed: { type: Number, default: 0 },
  dailyTokensUsed: { type: Number, default: 0 },
  lastTokenResetAt: { type: Date, default: Date.now },
  lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

chatHistorySchema.index({ childId: 1 });

export const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);
