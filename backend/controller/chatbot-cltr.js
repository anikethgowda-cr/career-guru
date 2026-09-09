import aiService from "../services/aiServices.js";

export const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        const prompt = `
            You are CareerPilot, an AI career assistant for students and job seekers.

            Your job is to help users with:
            - Career guidance
            - Job preparation
            - Resume improvement
            - Interview preparation
            - Technical skills
            - Learning roadmaps
            - Job search guidance
            - Professional development

            Answer the user's question clearly and practically.

            Use Markdown formatting when useful:
            - Use headings for sections
            - Use bullet points for lists
            - Use numbered lists for steps
            - Use bold text for important terms
            - Use code blocks for code
            - Keep responses concise and easy to read

            User message:
            ${message.trim()}

            Return ONLY valid JSON.

            Return exactly this structure:

            {
                "reply": "Your response to the user"
            }
        `;

        const result = await aiService(prompt);

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("AI CHAT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to generate AI response"
        });
    }
};