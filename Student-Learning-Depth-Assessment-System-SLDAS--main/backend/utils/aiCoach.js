require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * AI Coach Engine using Google Gemini 1.5 Pro.
 */

const generateLearningRecommendation = async (test, evaluatedAnswers, percentage) => {
  try {
    const API_KEY = "AIzaSyAYj1Rnsj_t8kWI-ppTN8eB3V0-U5emaSc";
    if (!API_KEY) return null;

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const performanceSummary = evaluatedAnswers.map((ans, i) => {
      return `Q${i+1}: Score ${ans.marksAwarded}. Result: ${ans.feedback}`;
    }).join("\n");

    const prompt = `
      You are an expert AI Learning Coach. Analyze student results for: "${test.title}".
      Score: ${percentage}%
      Details:
      ${performanceSummary}
      Provide a highly personalized study roadmap including Mastery, Gap Analysis, and 3-step actionable study roadmap (max 150 words).
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Pro Feedback Error:", error);
    return null;
  }
};

const generateChatResponse = async (resultData, userMessage) => {
  try {
    const API_KEY = "AIzaSyAYj1Rnsj_t8kWI-ppTN8eB3V0-U5emaSc";
    if (!API_KEY) return "AI Chat Unavailable.";

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const context = `
      You are 'Nexus AI Tutor'. Result context for student:
      Assessment: '${resultData.testId?.title || 'Unknown Test'}'.
      Performance: ${resultData.percentage}%.
      Breakdown:
      ${resultData.answers.map((a, i) => `Q${i+1}: ${a.questionId?.question || 'Unknown'}. Answer: ${a.providedAnswer}. Feedback: ${a.feedback}`).join("\n")}
    `;

    const result = await model.generateContent(`Context: ${context}\n\nStudent Doubt: ${userMessage}`);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Pro Chat Error:", error);
    return "Disconnected from AI Core. Please check your API key and quota.";
  }
};

module.exports = { generateLearningRecommendation, generateChatResponse };
