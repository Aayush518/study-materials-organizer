import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

export async function generateStudyNotes(content: string) {
  try {
    const prompt = `Create concise, well-structured study notes from the following content: ${content}
    
    Format the notes with:
    - Clear headings
    - Bullet points for key concepts
    - Important terms in bold
    - Examples where relevant
    - A brief summary at the end`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating study notes:', error);
    throw error;
  }
}

export async function generateQuizQuestions(content: string) {
  try {
    const prompt = `Create 5 multiple-choice questions based on this content: ${content}
    
    For each question:
    1. Write a clear question
    2. Provide 4 options (A, B, C, D)
    3. Indicate the correct answer
    4. Add a brief explanation for why it's correct`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating quiz questions:', error);
    throw error;
  }
}

export async function generateSummary(content: string) {
  try {
    const prompt = `Create a concise summary of this content: ${content}
    
    Include:
    - Main ideas and key points
    - Important concepts
    - Key takeaways
    Keep it clear and easy to understand.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
}

export async function generateFlashcards(content: string) {
  try {
    const prompt = `Create a set of 10 study flashcards from this content: ${content}
    
    For each flashcard:
    - Front: Key term or concept
    - Back: Clear, concise explanation
    
    Format as JSON:
    {
      "flashcards": [
        {
          "front": "term/question",
          "back": "definition/answer"
        }
      ]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw error;
  }
}

export async function explainConcept(concept: string) {
  try {
    const prompt = `Explain this concept in detail: ${concept}
    
    Include:
    - Simple explanation
    - Real-world examples
    - Related concepts
    - Common misconceptions
    - Practice applications`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error explaining concept:', error);
    throw error;
  }
}