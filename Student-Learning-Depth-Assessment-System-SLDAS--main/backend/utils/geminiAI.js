const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Generates personalized learning recommendations for a student based on their test performance.
 * @param {Object} test - The test object.
 * @param {Array} evaluatedAnswers - Evaluated answers containing marks and feedback.
 * @param {Number} percentage - Overall student score percentage.
 */
const generateLearningRecommendation = async (test, evaluatedAnswers, percentage) => {
  try {
    const API_KEY = "AIzaSyAYj1Rnsj_t8kWI-ppTN8eB3V0-U5emaSc";
    if (!API_KEY) {
      console.warn("GEMINI_API_KEY is not defined. Falling back to internal feedback.");
      return null;
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Constructing a detailed performance summary for the prompt
    const performanceSummary = evaluatedAnswers.map((ans, i) => {
      return `Q${i+1}: Score ${ans.marksAwarded}. Result: ${ans.feedback}`;
    }).join("\n");

    const prompt = `
      You are an expert AI Learning Coach. Analyze a student's performance on the assessment: "${test.title}".
      
      Score Data:
      - Raw Score Percentage: ${percentage}%
      - Specific Feedback for Each Question:
      ${performanceSummary}

      Please provide a highly personalized learning roadmap for this student. 
      Your response must include:
      1. **Conceptual Mastery**: What topics they clearly understand.
      2. **Gap Analysis**: What specific logic or depth is missing from their answers.
      3. **Actionable Roadmap**: 3 concrete study steps (e.g., 'Review chapter X', 'Practice descriptive explanations for concept Y').
      
      Format your response as a professional and encouraging summary (max 200 words).
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini AI Feedback Error:", error);
    return null;
  }
};

/**
 * Handles real-time chat between the student and AI about a specific result.
 */
const generateChatResponse = async (resultData, userMessage) => {
  try {
    const API_KEY = "AIzaSyAYj1Rnsj_t8kWI-ppTN8eB3V0-U5emaSc";
    if (!API_KEY) return "AI Chat is currently unavailable.";

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Context preparation
    const context = `
      You are 'Nexus AI Tutor'. The student is asking about their performance in the '${resultData.testId.title}' assessment.
      
      Assessment Context:
      - Student Score: ${resultData.score} Marks (${resultData.percentage}%)
      - Question Breakdown:
      ${resultData.answers.map((a, i) => `Q${i+1}: ${a.questionId.question}. Student Answer: ${a.providedAnswer}. Marks: ${a.marksAwarded}. feedback: ${a.feedback}`).join("\n")}
      
      Student's Doubt: "${userMessage}"
      
      Guidelines:
      1. Be encouraging and educational.
      2. If they ask about a specific question they got wrong, explain the concept clearly.
      3. Refer to the 'Model Answers' if they exist to guide them.
      4. Avoid giving the direct answer if it's a re-testable question, instead explain the logic.
    `;

    const chatResult = await model.generateContent(context);
    const response = await chatResult.response;
    const text = response.text();
    return text || "No clear response from AI. Try rephrasing.";
  } catch (error) {
    console.error("Gemini Chat Error Details:", error);
    return `AI Core Connection Failed: ${error.message}. Please check your API key and internet connection.`;
  }
};

module.exports = { generateLearningRecommendation, generateChatResponse };
