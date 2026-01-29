
import { GoogleGenAI } from "@google/genai";
import { ApplicationFormData } from "../types";

export const analyzeApplication = async (data: ApplicationFormData): Promise<string> => {
  // Initialize Gemini API client following guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const compPref = data.compensationPreference === 'equity' 
    ? 'Enthusiastic about Equity/Long-term growth' 
    : 'Prefers Salary/Direct payment';

  // Prompt updated to remove social sites
  const prompt = `
    You are the AI Recruiter for Nexlify. A candidate has just applied for the ${data.appliedRole} position.
    
    Candidate Name: ${data.firstName} ${data.lastName}
    Years of Experience: ${data.yearsOfExperience}
    Compensation Preference: ${compPref}
    Tech Stack: ${data.techStack.join(', ')}
    Personal Sites: ${data.personalSites}
    Portfolio Samples/Cover Letter: ${data.portfolioSamples}
    Current Project: ${data.currentProject}
    
    The role is primarily equity-based, which Nexlify uses to align long-term interests.
    
    Please provide a very short, professional, and encouraging summary (2-3 sentences) acknowledging their background (especially their ${data.yearsOfExperience} of experience) and their compensation choice in a positive light.
    Mention that a human recruiter will review their portfolio shortly.
    Be inspiring.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Access .text property directly as per guidelines
    return response.text || "Thank you for applying! Our team will be in touch shortly.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Application submitted successfully! Our team will review your profile and reach out via email.";
  }
};
