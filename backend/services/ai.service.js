const { GoogleGenAI } = require('@google/genai');
const crypto = require('crypto');
const Question = require('../models/Question');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const PROMPTS = {
  base: `You are an expert AI Reasoning Practice generator.
Create a unique reasoning problem.
Return ONLY valid JSON matching this structure:
{
  "topic": "requested topic",
  "difficulty": "requested difficulty",
  "question": "The main question text",
  "options": ["Opt A", "Opt B", "Opt C", "Opt D"],
  "correct_answer": "The exact correct string from options",
  "explanation": "Brief explanation",
  "hint": "Brief hint",
  "pattern_id": "unique code"
}
`
};

const MOCK_QUESTIONS = {
  'Syllogism': {
    "topic": "Syllogism",
    "difficulty": "medium",
    "question": "Statements:\n1. Some cats are dogs.\n2. All dogs are birds.\n\nConclusions:\nI. Some cats are birds.\nII. No cat is a bird.",
    "options": ["Only I follows", "Only II follows", "Both follow", "Neither follows"],
    "correct_answer": "Only I follows",
    "explanation": "Since some cats are dogs and all dogs are birds, those cats that are dogs must also be birds.",
    "hint": "Draw a Venn diagram with Cats overlapping Dogs, and Dogs entirely inside Birds.",
    "pattern_id": "MOCK_SYL_1"
  },
  'Blood Relations': {
    "topic": "Blood Relations",
    "difficulty": "easy",
    "question": "Pointing to a photograph, a man said, 'I have no brother or sister but that man's father is my father's son.' Whose photograph was it?",
    "options": ["His own", "His son's", "His father's", "His nephew's"],
    "correct_answer": "His son's",
    "explanation": "Since he has no brother or sister, 'my father's son' is himself. So, the man in the photograph's father is himself. Thus, it is his son's photograph.",
    "hint": "Who is 'my father's son' if the speaker has no siblings?",
    "pattern_id": "MOCK_BR_1"
  },
  'Puzzle': {
    "topic": "Puzzle",
    "difficulty": "medium",
    "question": "A, B, C, and D are sitting in a row. A is next to B. C is next to D. C is not sitting with A. If D is at the right end, who is sitting to the immediate left of B?",
    "options": ["A", "C", "D", "Cannot be determined"],
    "correct_answer": "Cannot be determined",
    "explanation": "Order could be B A C D or A B C D. Thus, to the left of B could be nobody or A.",
    "hint": "Try placing D at the far right and see the possible arrangements.",
    "pattern_id": "MOCK_PUZ_1"
  }
};

async function generateQuestion(topic, difficulty) {
  const prompt = `
  ${PROMPTS.base}
  Topic: ${topic}
  Difficulty: ${difficulty}
  Produce ONLY raw JSON.
  `;

  let retries = 1;
  while (retries > 0) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      let responseText = response.text;
      
      if (responseText.startsWith('```json')) {
        responseText = responseText.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (responseText.startsWith('```')) {
        responseText = responseText.replace(/^```/, '').replace(/```$/, '').trim();
      }

      const questionData = JSON.parse(responseText);

      if (!questionData.question || !questionData.options || !questionData.correct_answer) {
        throw new Error("Missing fields");
      }

      questionData.question_id = crypto.randomUUID();
      questionData.reasoning_steps = []; 
      questionData.concept = topic; 

      const newQuestion = new Question(questionData);
      await newQuestion.save();

      return questionData;
    } catch (error) {
      console.error('Generation error, falling back to MOCK database due to quota...', error.message);
      
      // MOCK FALLBACK FOR HACKATHON
      const fallback = MOCK_QUESTIONS[topic] || {
        "topic": topic,
        "difficulty": difficulty,
        "question": "Mock Question: If all X are Y, and some Y are Z, what is X to Z?",
        "options": ["Unknown", "All X are Z", "No X are Z", "Some X are Z"],
        "correct_answer": "Unknown",
        "explanation": "Generated from mock fallback because API quota was exceeded.",
        "hint": "Try visualizing.",
        "pattern_id": "MOCK_GENERIC"
      };
      
      const questionData = { ...fallback };
      questionData.question_id = crypto.randomUUID();
      questionData.reasoning_steps = ["Quota Exceeded: Using Mock"]; 
      questionData.concept = "Mock Concept"; 
      
      return questionData;
    }
  }
}

module.exports = { generateQuestion };