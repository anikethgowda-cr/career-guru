import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import AiCache from "../models/aiCacheSchema.js";

// Fast in-memory cache for ultra-fast duplicate hits (max 300 entries in RAM)
const memoryCache = new Map();
const MAX_MEMORY_CACHE_SIZE = 300;

const getPromptHash = (context) => {
  const normalized = typeof context === "string" ? context.trim() : JSON.stringify(context);
  return crypto.createHash("sha256").update(normalized).digest("hex");
};

// Retrieve available API keys (supports comma-separated list or single key)
const getApiKeys = () => {
  const rawKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
  const keys = rawKeys
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  return keys.length > 0 ? keys : [""];
};

let currentKeyIndex = 0;

import mongoose from "mongoose";

/**
 * Enhanced production AI Service with:
 * 1. Two-tier caching (Memory + MongoDB TTL) -> 0 tokens on cache hit
 * 2. Exponential backoff and retries on 429 / 503 errors
 * 3. Multi-key rotation on rate limits
 * 4. Token guardrails (supports full 8192 tokens for large plans/questions)
 */
const aiService = async (context, options = {}) => {
  // Use 8192 to prevent cutting off large course plans (6 weeks) or 40+ interview questions
  const { bypassCache = false, maxOutputTokens = 8192, temperature = 0.2 } = options;
  const promptHash = getPromptHash(context);

  // ── Tier 1: In-Memory Cache (0ms latency, 0 tokens) ─────────────────────
  if (!bypassCache && memoryCache.has(promptHash)) {
    console.log(`[AI Cache Hit: RAM] ⚡ Prompt hash: ${promptHash.substring(0, 8)}... (0 tokens used)`);
    return memoryCache.get(promptHash);
  }

  // ── Tier 2: MongoDB Persistent Cache (10ms, 0 tokens) ───────────────────
  if (!bypassCache && mongoose.connection.readyState === 1) {
    try {
      const cached = await AiCache.findOne({ promptHash });
      if (cached && cached.response) {
        console.log(`[AI Cache Hit: DB] ⚡ Prompt hash: ${promptHash.substring(0, 8)}... (0 tokens used)`);
        // Promote to RAM cache for next time
        if (memoryCache.size >= MAX_MEMORY_CACHE_SIZE) {
          const firstKey = memoryCache.keys().next().value;
          memoryCache.delete(firstKey);
        }
        memoryCache.set(promptHash, cached.response);
        return cached.response;
      }
    } catch (cacheErr) {
      console.warn("[AI Cache Read Warning]:", cacheErr.message);
      // Non-fatal, continue to Gemini
    }
  }

  // ── Tier 3: Call Google Gemini with Exponential Backoff & Key Rotation ─
  const keys = getApiKeys();
  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const activeApiKey = keys[currentKeyIndex % keys.length];

    try {
      const ai = new GoogleGenAI({
        apiKey: activeApiKey,
      });

      const modelName = process.env.GEMINI_MODEL || "gemini-3.6-flash";

      const response = await ai.models.generateContent({
        model: modelName,
        contents: context,
        config: {
          responseMimeType: "application/json",
          maxOutputTokens,
          temperature,
        },
      });

      let text = (response.text || "").trim();

      // Clean up markdown wrapping if present
      if (text.startsWith("```json")) {
        text = text.replace(/^```json\s*/, "");
        text = text.replace(/\s*```$/, "");
      } else if (text.startsWith("```")) {
        text = text.replace(/^```\s*/, "");
        text = text.replace(/\s*```$/, "");
      }

      text = text.trim();

      if (!text) {
        throw new Error("Gemini returned an empty response");
      }

      let result;
      try {
        result = JSON.parse(text);
      } catch (parseErr) {
        // Attempt basic salvage if output was cut off at the very end
        console.warn(`[AI JSON Parse Warning]: ${parseErr.message}. Attempting recovery...`);
        let sanitized = text;
        if (!sanitized.endsWith("}") && !sanitized.endsWith("]")) {
          // If JSON was cut off inside an array/object, close open braces
          const openBraces = (sanitized.match(/{/g) || []).length;
          const closeBraces = (sanitized.match(/}/g) || []).length;
          const openBrackets = (sanitized.match(/\[/g) || []).length;
          const closeBrackets = (sanitized.match(/]/g) || []).length;

          // Remove trailing incomplete key/string or comma
          sanitized = sanitized.replace(/,?\s*"[^"]*"?\s*:\s*"?$/, "");
          sanitized = sanitized.replace(/,\s*$/, "");

          sanitized += "]".repeat(Math.max(0, openBrackets - closeBrackets));
          sanitized += "}".repeat(Math.max(0, openBraces - closeBraces));

          try {
            result = JSON.parse(sanitized);
            console.log("[AI JSON Recovery] Successfully repaired JSON response!");
          } catch {
            throw parseErr; // Re-throw to trigger retry
          }
        } else {
          throw parseErr;
        }
      }

      // Save to RAM cache
      if (memoryCache.size >= MAX_MEMORY_CACHE_SIZE) {
        const firstKey = memoryCache.keys().next().value;
        memoryCache.delete(firstKey);
      }
      memoryCache.set(promptHash, result);

      // Save to MongoDB asynchronously (non-blocking)
      AiCache.findOneAndUpdate(
        { promptHash },
        { promptHash, response: result, modelUsed: modelName },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).catch((saveErr) => console.warn("[AI Cache Write Warning]:", saveErr.message));

      return result;

    } catch (error) {
      lastError = error;
      const isRateLimit = error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("quota") || error?.message?.includes("RESOURCE_EXHAUSTED");
      const isTransient = error?.status === 503 || error?.status === 500 || error?.code === "ECONNRESET";
      const isParseError = error instanceof SyntaxError || error?.message?.includes("JSON") || error?.message?.includes("empty response");

      console.warn(`[AI Attempt ${attempt + 1}/${maxRetries} failed]: ${error.message}`);

      // Rotate API key if multiple keys are available
      if (keys.length > 1) {
        currentKeyIndex = (currentKeyIndex + 1) % keys.length;
        console.log(`[AI Key Rotation] Switched to key #${currentKeyIndex + 1}`);
      }

      // Retry on rate limit, transient server error, or bad/empty JSON
      if ((isRateLimit || isTransient || isParseError) && attempt < maxRetries - 1) {
        const backoffMs = Math.pow(2, attempt) * 1000 + Math.floor(Math.random() * 500);
        console.log(`[AI Backoff] Retrying in ${backoffMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      } else if (!isRateLimit && !isTransient && !isParseError) {
        throw error;
      }
    }
  }

  console.error("Failed to generate AI response after retries:", lastError);
  throw lastError;
};

export default aiService;