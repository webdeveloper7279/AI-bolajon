import OpenAI from "openai";
import { ChatHistory } from "../models/ChatHistory.js";
import { Child } from "../models/Child.js";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const MAX_TOKENS_PER_CHILD_DAY = 5000;
const MAX_RESPONSE_TOKENS = 300;
const SYSTEM_PROMPT_AGE = {
  3: "You are a friendly teacher for a 3-year-old. Use very simple words, short sentences, and lots of encouragement. Use emojis.",
  4: "You are a friendly teacher for a 4-year-old. Use simple words and short sentences. Be warm and use some emojis.",
  5: "You are a friendly teacher for a 5-year-old. Use clear, simple language. Be encouraging.",
  6: "You are a friendly teacher for a 6-year-old. Use clear language, a bit more detail.",
  7: "You are a friendly teacher for a 7-year-old. Use clear language with more explanation.",
  8: "You are a friendly teacher for an 8-year-old. Use clear language and light explanations.",
  9: "You are a friendly teacher for a 9-year-old. Use normal but clear language.",
  10: "You are a friendly teacher for a 10-year-old. Use normal language, educational tone.",
  11: "You are a friendly teacher for an 11-year-old. Use normal language.",
  12: "You are a friendly teacher for a 12-year-old. Use normal, educational language.",
};

function getSystemPrompt(age) {
  const a = Math.min(12, Math.max(3, age || 6));
  const base = SYSTEM_PROMPT_AGE[a] || SYSTEM_PROMPT_AGE[6];
  return `${base} You are part of "AI Bolajon" - a safe children's education app. Answer only in Uzbek (Latin). Keep answers concise and child-appropriate. Do not include harmful or adult content.`;
}

export async function chatWithAI(childId, userMessage) {
  if (!openai) {
    return {
      reply: "AI xizmati hozircha sozlanmagan. Keyinroq urinib ko'ring.",
      tokensUsed: 0,
    };
  }

  const child = await Child.findById(childId).lean();
  if (!child) throw new Error("Child not found");

  let chat = await ChatHistory.findOne({ childId }).lean();
  if (!chat) {
    chat = await ChatHistory.create({ childId, messages: [] });
    chat = chat.toObject();
  }

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  let dailyTokensUsed = chat.dailyTokensUsed || 0;
  const lastReset = chat.lastTokenResetAt ? new Date(chat.lastTokenResetAt).toISOString().slice(0, 10) : "";
  if (lastReset !== today) {
    dailyTokensUsed = 0;
    await ChatHistory.updateOne(
      { childId },
      { $set: { dailyTokensUsed: 0, lastTokenResetAt: now } }
    );
  }
  if (dailyTokensUsed >= MAX_TOKENS_PER_CHILD_DAY) {
    return {
      reply: "Bugun chat limiti tugadi. Ertaga qayta urinib ko'ring!",
      tokensUsed: 0,
    };
  }

  const systemPrompt = getSystemPrompt(child.age);
  const messages = [
    { role: "system", content: systemPrompt },
    ...chat.messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    max_tokens: Math.min(MAX_RESPONSE_TOKENS, MAX_TOKENS_PER_CHILD_DAY - dailyTokensUsed),
    temperature: 0.7,
  });

  const assistantMessage = completion.choices[0]?.message?.content || "Javob olinmadi.";
  const tokensUsed = completion.usage?.total_tokens || 0;

  await ChatHistory.findOneAndUpdate(
    { childId },
    {
      $push: {
        messages: [
          { role: "user", content: userMessage, tokens: completion.usage?.prompt_tokens || 0 },
          { role: "assistant", content: assistantMessage, tokens: completion.usage?.completion_tokens || 0 },
        ],
      },
      $inc: { totalTokensUsed: tokensUsed, dailyTokensUsed: tokensUsed },
      $set: { lastActivityAt: new Date() },
    }
  );

  return { reply: assistantMessage, tokensUsed };
}
