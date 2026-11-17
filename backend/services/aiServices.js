import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import AiCache from "../models/aiCacheSchema.js";

// Helper: Convert prompt into a fixed 64-character SHA-256 hash
const getPromptHash = (context) => {
    const text = typeof context === "string" ? context.trim() : JSON.stringify(context);
    return crypto.createHash("sha256").update(text).digest("hex");
};

// Helper: Retrieve all available API keys from environment
const getApiKeys = () => {
    const rawKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "";
    const keys = rawKeys.split(",").map((k) => k.trim()).filter(Boolean);
    return keys.length > 0 ? keys : [""];
};

let currentKeyIndex = 0;

/**
 * Clean & Production-Ready AI Service
 * 1. MongoDB Caching: 0 tokens on cache hit (expires in 7 days via TTL)
 * 2. Token Swapping: Automatically rotates API keys on errors or rate limits
 * 3. Safe Parsing: Forces application/json and strips markdown
 */
const aiService = async (context, options = {}) => {
    const { bypassCache = false, maxOutputTokens = 8192, temperature = 0.2 } = options;
    const promptHash = getPromptHash(context);

    // ── 1. Check MongoDB Cache ──────────────────────────────────────────────
    if (!bypassCache) {
        try {
            const cached = await AiCache.findOne({ promptHash });
            if (cached?.response) {
                console.log(`[AI Cache Hit: MongoDB] ⚡ 0 tokens used (Hash: ${promptHash.substring(0, 8)}...)`);
                return cached.response;
            }
        } catch (err) {
            console.warn("[AI Cache Read Warning]:", err.message);
        }
    }

    // ── 2. Call Gemini with Key Swapping & Retries ─────────────────────────
    const keys = getApiKeys();
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const maxRetries = Math.max(keys.length, 3);
    let lastError = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        const activeKey = keys[currentKeyIndex % keys.length];

        try {
            const ai = new GoogleGenAI({ apiKey: activeKey });

            console.log(`[AI Request] Calling Gemini (Key #${(currentKeyIndex % keys.length) + 1}, Attempt ${attempt + 1}/${maxRetries})...`);

            const response = await ai.models.generateContent({
                model,
                contents: context,
                config: {
                    responseMimeType: "application/json",
                    maxOutputTokens,
                    temperature,
                },
            });

            // Clean up any markdown wrapping (```json ... ```)
            let text = (response.text || "").trim();
            text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

            if (!text) {
                throw new Error("Gemini returned an empty response");
            }

            const result = JSON.parse(text);

            // ── 3. Save to MongoDB Cache Asynchronously (Non-blocking) ─────
            AiCache.findOneAndUpdate(
                { promptHash },
                { promptHash, response: result, modelUsed: model },
                { upsert: true, new: true }
            ).catch((err) => console.warn("[AI Cache Save Warning]:", err.message));

            return result;

        } catch (error) {
            lastError = error;
            console.warn(`[AI Attempt ${attempt + 1} Failed]:`, error.message);

            // Token Swapping: Rotate to next API key if multiple keys exist
            if (keys.length > 1) {
                currentKeyIndex = (currentKeyIndex + 1) % keys.length;
                console.log(`[AI Key Swapped] Now using Key #${(currentKeyIndex % keys.length) + 1}`);
            }

            // Brief pause before retry (1s, 2s, ...)
            if (attempt < maxRetries - 1) {
                await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
            }
        }
    }

    // If all retries and keys failed
    console.error("[AI Service Failed after all retries]:", lastError?.message);
    throw lastError;
};

export default aiService;
