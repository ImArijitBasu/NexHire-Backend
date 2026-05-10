import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const geminiModel = genAI.getGenerativeModel({ 
  model: 'gemini-flash-latest',
  generationConfig: {
    responseMimeType: 'application/json',
    temperature: 0.7,
  }
});

export const geminiChatModel = genAI.getGenerativeModel({ 
  model: 'gemini-flash-latest',
  generationConfig: {
    temperature: 0.8,
  }
});

export default genAI;
