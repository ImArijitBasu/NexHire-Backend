import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("No GEMINI_API_KEY found!");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function run() {
  try {
    console.log("Testing Gemini API connection...");
    const result = await model.generateContent("Hello, respond with a JSON object { \"success\": true }");
    console.log("Response text:", result.response.text());
  } catch (error) {
    console.error("Gemini API Error:", error);
  }
}

run();
