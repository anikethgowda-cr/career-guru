import mongoose from "mongoose";

const aiCacheSchema = new mongoose.Schema(
    {
        promptHash: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        response: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },
        modelUsed: {
            type: String,
            default: "gemini"
        },
        createdAt: {
            type: Date,
            default: Date.now,
            // Automatically deletes documents after 7 days to keep database lean
            expires: 60 * 60 * 24 * 7
        }
    },
    { timestamps: true }
);

const AiCache = mongoose.model("AiCache", aiCacheSchema);

export default AiCache;
