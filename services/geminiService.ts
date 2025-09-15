
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateCourseDescription = async (courseName: string): Promise<string> => {
  if (!API_KEY) {
    return "AI features are disabled. Please configure the API key.";
  }
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a concise and engaging course description for a course titled "${courseName}". The description should be around 50-70 words.`,
        config: {
          temperature: 0.7,
          topP: 1,
          topK: 32,
        },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating course description:", error);
    return "Failed to generate description. Please try again.";
  }
};

export const summarizeFeedback = async (feedbackMessages: string[]): Promise<string> => {
    if (!API_KEY) {
      return "AI features are disabled. Please configure the API key.";
    }
    if (feedbackMessages.length === 0) {
        return "No feedback selected to summarize.";
    }

    const prompt = `
    As an expert in educational feedback analysis, please summarize the following student feedback entries.
    Identify common themes, overall sentiment (positive, negative, mixed), and provide 2-3 actionable suggestions for course improvement based on the feedback.
    Format your response clearly with headings for "Summary", "Common Themes", "Overall Sentiment", and "Actionable Suggestions".

    Feedback Entries:
    ${feedbackMessages.map((msg, index) => `${index + 1}. "${msg}"`).join('\n')}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              temperature: 0.5,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error summarizing feedback:", error);
        return "Failed to summarize feedback. Please try again.";
    }
};
