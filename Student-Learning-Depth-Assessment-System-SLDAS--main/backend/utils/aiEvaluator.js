const evaluateAnswer = async (providedAnswer, modelAnswer, maxMarks) => {
  if (!providedAnswer || providedAnswer.trim() === '') {
    return { marks: 0, feedback: "No answer provided.", similarityScore: 0 };
  }

  // NLP Semantic Word Overlap Logic instead of simple strict edit distance
  function calculateWordOverlap(provided, model) {
    // Normalize strings: lowercase and remove punctuation
    const normalize = (s) => (s || '').toLowerCase().replace(/[^\w\s]/g, '').trim();
    
    // Create arrays of words from both answers, ignoring very short common words
    const pWords = normalize(provided).split(/\s+/).filter(w => w.length > 2 && w.trim() !== '');
    const mWords = normalize(model).split(/\s+/).filter(w => w.length > 2 && w.trim() !== '');
    
    // If the model answer has no meaningful keywords, full marks as default
    if (mWords.length === 0) return pWords.length === 0 ? 1.0 : 0.0;
    
    let matches = 0;
    for (const mw of mWords) {
      // Check for exact match or substring match (to handle plurals/tenses)
      // E.g. "gravity" and "gravitational" or "cell" and "cells"
      const isMatch = pWords.some(pw => pw === mw || pw.includes(mw) || mw.includes(pw));
      if (isMatch) matches++;
    }
    
    // The score is the ratio of model keywords found in the provided answer
    return matches / mWords.length;
  }
  
  const matchRatio = calculateWordOverlap(providedAnswer, modelAnswer);
  
  let marksAwarded = 0;
  let feedback = "";
  
  if (matchRatio >= 0.8) {
    marksAwarded = maxMarks;
    feedback = "Excellent understanding! Your reasoning covers the core concepts well.";
  } else if (matchRatio >= 0.5) {
    marksAwarded = Math.max(1, Math.floor(maxMarks * 0.7));
    feedback = "Good, you understand the basics but missed some key terminology or details. Try to elaborate more.";
  } else if (matchRatio >= 0.3) {
    marksAwarded = Math.max(1, Math.floor(maxMarks * 0.4));
    feedback = "You have missed some critical points. Improve your explanation clarity and include relevant core concepts.";
  } else {
    marksAwarded = 0;
    feedback = "Poor concept clarity. Your answer missed the key details of the topic.";
  }
  
  return {
    marks: marksAwarded,
    feedback: feedback,
    similarityScore: (matchRatio * 100).toFixed(2)
  };
};

module.exports = { evaluateAnswer };
