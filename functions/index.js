import dotenv from "dotenv";      // ✅ Load environment variables
dotenv.config();                  // ✅ Apply them

import functions from "firebase-functions";
import express from "express";
import cors from "cors";
import aiRoutes from "./routes/ai.js";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ✅ Request time logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`🕒 [${req.method}] ${req.originalUrl} - ${duration}ms`);
  });
  next();
});

app.use("/", aiRoutes);

// ✅ Cloud Function with memory + timeout controls
export const api = functions
  .region("us-central1")
  .runWith({
    memory: "256MB",     // 🔧 Reduce from 512MB if not needed
    timeoutSeconds: 30,  // ✅ Reasonable timeout for API use
    minInstances: 1      // ⚡️ Keep warm for faster response (optional cost)
  })
  .https.onRequest(app);
