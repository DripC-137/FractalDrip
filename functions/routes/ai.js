import express from "express";
import { genAI, cohere } from "../clients.js";

const router = express.Router();

// ✅ Pre-initialize Gemini model to avoid cold delay
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

/**
 * GET /api/
 * Health check
 */
router.get("/", (req, res) => {
  res.send("✅ AI Router is alive!");
});

/**
 * POST /api/chat
 * Body: { prompt: string, model: "gemini" | "cohere" }
 */
router.post("/chat", async (req, res) => {
  const { prompt, model } = req.body;

  if (!prompt || !model) {
    return res.status(400).json({ error: "Missing prompt or model" });
  }

  const start = Date.now();
  let responseText = "No response";

  try {
    switch (model) {
      case "gemini": {
        const result = await geminiModel.generateContent(prompt);
        const text = await result.response.text();
        responseText = text?.trim() || responseText;
        break;
      }

      case "cohere": {
        const result = await cohere.generate({
          prompt,
          model: "command-r-plus",  // ✅ Updated to new model
          max_tokens: 300,
          temperature: 0.8,
        });

        console.log("🧠 Cohere raw result:", result);

        if (result.body?.meta?.warnings) {
          console.warn("⚠️ Cohere Warnings:", result.body.meta.warnings);
        }

        responseText = result.body?.generations?.[0]?.text?.trim() || responseText;
        break;
      }

      default:
        return res.status(400).json({ error: "Invalid model name" });
    }

    console.log(`✅ [${model}] responded in ${Date.now() - start}ms`);
    return res.json({ success: true, response: responseText });

  } catch (err) {
    console.error("❌ AI Error:", err);
    return res.status(500).json({ error: "AI request failed" });
  }
});

export default router;
