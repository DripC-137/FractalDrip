// functions/routes/ai.js

import express from "express";
import { genAI, cohere } from "../clients.js";

const router = express.Router();

// Pre-initialize Gemini 2.5 Pro model once to reduce latency on cold start
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

/**
 * Health check route
 */
router.get("/", (req, res) => {
  res.send("✅ AI Router is alive!");
});

/**
 * POST /chat
 * Body: { prompt: string, model: "gemini" | "cohere" }
 * Returns: { success: boolean, response: string }
 */
router.post("/chat", async (req, res) => {
  const { prompt, model } = req.body;

  if (typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "Invalid or missing prompt" });
  }
  if (!["gemini", "cohere"].includes(model)) {
    return res.status(400).json({ error: "Invalid model name" });
  }

  const startTime = Date.now();

  try {
    let responseText = "";

    if (model === "gemini") {
      // Gemini 2.5 pro generative AI call
      const result = await geminiModel.generateContent(prompt);
      responseText = (await result.response.text())?.trim() || "No response";
    } else if (model === "cohere") {
      // Cohere Command R+ summarization/retrieval
      const result = await cohere.generate({
        prompt,
        model: "command-r-plus",
        max_tokens: 300,
        temperature: 0.8,
      });

      // Log raw response for diagnostics
      console.log("🧠 Cohere raw result:", result);

      // Warn on API warnings if any
      if (result.body?.meta?.warnings) {
        console.warn("⚠️ Cohere API Warnings:", result.body.meta.warnings);
      }

      responseText = result.body?.generations?.[0]?.text?.trim() || "No response";
    }

    console.log(`✅ [${model}] responded in ${Date.now() - startTime}ms`);
    return res.json({ success: true, response: responseText });
  } catch (error) {
    console.error("❌ AI request failed:", error);
    return res.status(500).json({ error: "AI request failed" });
  }
});

export default router;
