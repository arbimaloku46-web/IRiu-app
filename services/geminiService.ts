import { GoogleGenAI } from "@google/genai";
import { Project } from "../types";

// Using the requested model and thinking budget
const MODEL_NAME = "gemini-3-pro-preview";
const THINKING_BUDGET = 32768;

export const analyzeProjectProgress = async (project: Project, specificQuery?: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY not found in environment variables.");
    return "AI Analysis unavailable: API Key missing.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Constructing a context-rich prompt for the thinking model
    const updatesText = project.updates
      .sort((a, b) => b.weekNumber - a.weekNumber)
      .map(u => `Week ${u.weekNumber} (${u.date}): ${u.description}`)
      .join("\n");

    const userPrompt = specificQuery 
      ? `User Question: ${specificQuery}` 
      : "Please provide a comprehensive executive summary of the construction progress, identifying any potential risks, delays, or notable achievements based on the weekly logs.";

    const prompt = `
      You are an expert construction project manager AI assistant for the 'Ndërtimi' app.
      
      Project Details:
      Name: ${project.name}
      Location: ${project.location}
      Status: ${project.status}
      Description: ${project.description}

      Weekly Progress Logs:
      ${updatesText}

      Task:
      ${userPrompt}

      Format your response with clear headings and bullet points using Markdown.
      Be analytical and professional.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: THINKING_BUDGET },
        // maxOutputTokens is intentionally omitted as per instructions when using thinkingBudget
      }
    });

    return response.text || "No analysis could be generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while generating the analysis. Please try again later.";
  }
};
