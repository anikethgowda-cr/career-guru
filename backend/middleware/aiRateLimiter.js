import rateLimit from "express-rate-limit";

/**
 * Rate limiter middleware for AI-intensive endpoints.
 * Protects against spammers, bot attacks, and runaway client loops.
 */
export const aiRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes window
    max: 25, // Limit each user/IP to 25 AI generation requests per window
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    keyGenerator: (req) => {
        // Use user ID if authenticated, otherwise fallback to IP
        return req.userId ? `user_${req.userId}` : req.ip;
    },
    message: {
        success: false,
        message: "You have made too many AI generation requests. Please wait a few minutes before trying again."
    }
});

export default aiRateLimiter;
