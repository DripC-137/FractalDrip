// functions/index.js

import dotenv from "dotenv";
dotenv.config();

import functions from "firebase-functions";
import express from "express";
import cors from "cors";
import aiRoutes from "./routes/ai.js";

const app = express();

// CORS: Allow all origins, you can restrict this for production
app.use(cors({ origin: true }));

// Parse JSON request bodies
app.use(express.json());

// Request duration logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`🕒 [${req.method}] ${req.originalUrl} - ${duration}ms`);
  });
  next();
});

// Mount AI router on root path
app.use("/", aiRoutes);

// Export Firebase Cloud Function with controlled resources
export const api = functions
  .region("us-central1")
  .runWith({
    memory: "256MB", // Reduced memory for cost-efficiency, increase if needed
    timeoutSeconds: 30, // Reasonable timeout for API calls
    minInstances: 1, // Optional warm instance to reduce cold starts (cost tradeoff)
  })
  .https.onRequest(app);
