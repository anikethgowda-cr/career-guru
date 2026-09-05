import { GoogleGenAI } from "@google/genai";

const aiService = async (context) => {
  try {
    console.log(
      "Gemini key available:",
      !!process.env.GEMINI_API_KEY
    );

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",

      contents: context,

      config: {
        responseMimeType: "application/json",
      },
    });


    let text = response.text.trim();

    // Remove markdown if Gemini still returns ```json
    if (text.startsWith("```json")) {
      text = text.replace(/^```json\s*/, "");
      text = text.replace(/\s*```$/, "");
    } else if (text.startsWith("```")) {
      text = text.replace(/^```\s*/, "");
      text = text.replace(/\s*```$/, "");
    }

    
    const result = JSON.parse(text);
    
    return result;

  } catch (error) {
    console.error(
      "Failed to generate AI response:",
      error
    );

    throw error;
  }
};

export default aiService;