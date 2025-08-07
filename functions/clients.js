// functions/clients.js

import dotenv from "dotenv";
dotenv.config(); // ✅ Load .env

import { GoogleGenerativeAI } from "@google/generative-ai";
import cohereSDK from "cohere-ai";

// ✅ Check that env vars are loaded correctly
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const COHERE_API_KEY = process.env.COHERE_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("❌ Missing GEMINI_API_KEY in .env");
}
if (!COHERE_API_KEY) {
  throw new Error("❌ Missing COHERE_API_KEY in .env");
}

// ✅ Initialize clients
export const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
cohereSDK.init(COHERE_API_KEY);

export const cohere = cohereSDK;
