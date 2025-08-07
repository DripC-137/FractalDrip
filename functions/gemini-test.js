// functions/gemini-test.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent("What's the capital of France?");
    const response = await result.response;
    const text = response.text();

    console.log("✅ Gemini Response:", text);
  } catch (error) {
    console.error("❌ Gemini Test Error:", error);
  }
}

test();
