import express from "express";
import { genAI, cohereClient } from "./clients.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("✅ AI Router is alive!");
});

router.post("/chat", async (req, res) => {
  const { prompt, model } = req.body;

  if (!prompt || !model) {
    return res.status(400).json({ error: "Missing prompt or model" });
  }

  try {
    let responseText;

    if (model === "gemini") {
      const chat = genAI.getGenerativeModel({ model: "gemini-pro" }).startChat();
      const result = await chat.sendMessage(prompt);
      responseText = result.response.text();
    } else if (model === "cohere") {
      const result = await cohereClient.generate({
        prompt,
        model: "command",
        max_tokens: 300,
        temperature: 0.8,
      });
      responseText = result.generations?.[0]?.text?.trim() || "No response";
    } else {
      return res.status(400).json({ error: "Invalid model" });
    }

    return res.json({ success: true, response: responseText });
  } catch (err) {
    console.error("❌ AI Error:", err);
    return res.status(500).json({ error: "AI request failed" });
  }
});

export default router;
