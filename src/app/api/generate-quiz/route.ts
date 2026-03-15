// import { NextResponse } from "next/server";
// import Groq from "groq-sdk";

// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// export async function POST(req: Request) {
//   try {
//     const { topic } = await req.json();

//     const chatCompletion = await groq.chat.completions.create({
//       messages: [
//         {
//           role: "system",
//           content: `You are an expert technical instructor. Your task is to generate a high-quality coding quiz.
          
//           STRICT RULES:
//           1. Generate exactly 5 Multiple Choice Questions (MCQs).
//           2. The difficulty should be a mix: 2 Easy, 2 Intermediate, 1 Advanced.
//           3. Return the response ONLY in a valid JSON format.
//           4. Each question must have:
//              - "question": The question text.
//              - "options": An array of 4 distinct strings.
//              - "correctAnswer": The exact string from the options array that is correct.
//              - "explanation": A 1-2 sentence logical reason WHY that answer is correct.
          
//           JSON STRUCTURE:
//           {
//             "questions": [
//               {
//                 "question": "...",
//                 "options": ["A", "B", "C", "D"],
//                 "correctAnswer": "A",
//                 "explanation": "..."
//               }
//             ]
//           }`
//         },
//         {
//           role: "user",
//           content: `Generate a professional quiz for a developer learning platform on the topic: ${topic}.`
//         }
//       ],
//       model: "llama-3.1-8b-instant",
//       response_format: { type: "json_object" }, // यह पक्का करता है कि AI सिर्फ JSON ही भेजे
//       temperature: 0.7, // इसे 0.7 रखने से सवाल हर बार थोड़े अलग और क्रिएटिव आएंगे
//     });

//     const content = chatCompletion.choices[0].message.content;
    
//     if (!content) {
//       throw new Error("AI failed to generate content");
//     }

//     const data = JSON.parse(content);
//     return NextResponse.json(data);

//   } catch (error) {
//     console.error("Groq API Error:", error);
//     return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
//   }
// }


import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const QUIZ_COUNT = 10;

function normalizeQuestions(payload: unknown): QuizQuestion[] {
  if (!payload || typeof payload !== "object" || !("questions" in payload)) {
    return [];
  }

  const rawQuestions = (payload as { questions?: unknown }).questions;

  if (!Array.isArray(rawQuestions)) {
    return [];
  }

  return rawQuestions
    .filter(
      (item): item is QuizQuestion =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as QuizQuestion).question === "string" &&
        Array.isArray((item as QuizQuestion).options) &&
        (item as QuizQuestion).options.length === 4 &&
        (item as QuizQuestion).options.every((option) => typeof option === "string") &&
        typeof (item as QuizQuestion).correctAnswer === "string" &&
        typeof (item as QuizQuestion).explanation === "string" &&
        (item as QuizQuestion).options.includes((item as QuizQuestion).correctAnswer)
    )
    .slice(0, QUIZ_COUNT);
}

async function generateQuizFromLLM(topic: string) {
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are an expert technical instructor. Generate a developer quiz in strict JSON.

STRICT RULES:
1. Generate EXACTLY ${QUIZ_COUNT} multiple choice questions.
2. Difficulty mix must be: 4 Beginner, 3 Intermediate, 3 Advanced.
3. Return ONLY valid JSON with no markdown and no extra text.
4. Every question must include:
   - "question": string
   - "options": array of exactly 4 distinct strings
   - "correctAnswer": string that matches one option exactly
   - "explanation": short sentences explaining why the correct answer is right
5. Keep questions practical and relevant for a learning platform.
        
JSON STRUCTURE:
{
  "questions": [
    {
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": "...",
      "explanation": "..."
    }
  ]
}`,
      },
      {
        role: "user",
        content: `Generate exactly ${QUIZ_COUNT} high-quality quiz questions for the topic: ${topic}. Make sure all ${QUIZ_COUNT} questions are present.`
      }
    ],
    model: "llama-3.1-8b-instant",
    response_format: { type: "json_object" },
    temperature: 0.4,
  });

  const content = chatCompletion.choices[0].message.content;
  return normalizeQuestions(JSON.parse(content || "{}"));
}

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic || typeof topic !== "string") {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    let questions = await generateQuizFromLLM(topic);

    if (questions.length !== QUIZ_COUNT) {
      questions = await generateQuizFromLLM(topic);
    }

    if (questions.length !== QUIZ_COUNT) {
      return NextResponse.json(
        { error: `Failed to generate exactly ${QUIZ_COUNT} quiz questions` },
        { status: 502 }
      );
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Groq API Error:", error);
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
  }
}