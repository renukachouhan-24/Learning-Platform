import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

interface EvaluatePayload {
  topicId: string;
  task: string;
  code: string;
  previewDoc?: string;
}

interface EvaluationResult {
  passed: boolean;
  score: number;
  feedback: string;
  missing: string[];
}

function getTopicEvaluationGuide(topicId: string) {
  const guides: Record<string, string> = {
    html: "Evaluate only HTML structure and semantic correctness. Do NOT require JavaScript, event listeners, AJAX, or backend behavior.",
    css: "Evaluate only CSS styling, layout, responsiveness, and visual quality. Do NOT require JavaScript logic.",
    js: "Evaluate JavaScript logic, DOM handling, and interactivity expected by the task.",
    react: "Evaluate React component structure, state/props usage, and rendering logic.",
    nextjs: "Evaluate Next.js concepts like routing, pages, API routes, and framework usage.",
    nodejs: "Evaluate backend API/server logic and Express patterns.",
    database: "Evaluate schema/query/CRUD correctness for database tasks.",
    python: "Evaluate Python basics, syntax, and program correctness.",
    "dsa-ai": "Evaluate data structures, algorithms, and complexity-aware implementation.",
    ml: "Evaluate ML workflow correctness, train/test flow, metrics, and model usage.",
    dl: "Evaluate neural network/deep learning implementation correctness.",
    nlp: "Evaluate text preprocessing/NLP pipeline correctness.",
    llm: "Evaluate prompt/API/RAG workflow implementation correctness.",
  };

  return guides[topicId] ?? "Evaluate only what is explicitly required in the task statement.";
}

function sanitizeTopicMismatchedFeedback(result: EvaluationResult, topicId: string) {
  if (topicId !== "html" && topicId !== "css") {
    return result;
  }

  const disallowed = /(javascript|js\s+event|event listener|ajax|fetch\(|api call|backend)/i;
  const cleanedMissing = result.missing.filter((item) => !disallowed.test(item));
  const cleanedFeedback = disallowed.test(result.feedback)
    ? "Good attempt. Focus on completing the exact task requirements for this topic."
    : result.feedback;

  return {
    ...result,
    feedback: cleanedFeedback,
    missing: cleanedMissing,
  };
}

function normalizeEvaluation(payload: unknown): EvaluationResult {
  if (!payload || typeof payload !== "object") {
    return {
      passed: false,
      score: 0,
      feedback: "Could not evaluate the task output. Try improving your solution and re-check.",
      missing: ["No valid evaluation returned"],
    };
  }

  const data = payload as Partial<EvaluationResult>;

  const score = typeof data.score === "number" ? Math.max(0, Math.min(100, data.score)) : 0;

  // Keep unlock behavior deterministic for the app:
  // if score is 70+ then task is considered passed.
  const passed = score >= 70;

  return {
    passed,
    score,
    feedback:
      typeof data.feedback === "string" && data.feedback.trim().length > 0
        ? data.feedback
        : "Improve task completeness and try again.",
    missing: Array.isArray(data.missing)
      ? data.missing.filter((item): item is string => typeof item === "string").slice(0, 4)
      : [],
  };
}

export async function POST(req: Request) {
  try {
    const { topicId, task, code, previewDoc } = (await req.json()) as EvaluatePayload;

    if (!topicId || !task || !code) {
      return NextResponse.json({ error: "topicId, task and code are required" }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `You are a strict coding task evaluator.

Return ONLY valid JSON in this exact shape:
{
  "passed": boolean,
  "score": number,
  "feedback": string,
  "missing": string[]
}

Rules:
1) Evaluate if the submitted solution matches the task objective.
2) Topic-aware evaluation is mandatory. Never ask for skills outside the topic.
3) For HTML and CSS tasks, do not demand JavaScript, backend, AJAX, or API integration unless explicitly asked.
4) Do not ask for features that are not mentioned in task text.
5) Keep expectations beginner-friendly for foundational topics.
6) Score from 0 to 100.
7) Pass only when score >= 70 and core task objective is implemented.
8) feedback must be short and actionable.
9) missing must contain up to 4 concrete missing points.
10) No markdown, no extra keys, no extra text.
`,
        },
        {
          role: "user",
          content: JSON.stringify({
            topicId,
            topicEvaluationGuide: getTopicEvaluationGuide(topicId),
            task,
            submittedCode: code,
            renderedPreviewHtml: previewDoc ?? "",
          }),
        },
      ],
    });

    const raw = completion.choices[0].message.content || "{}";
    const parsed = JSON.parse(raw);
    const result = sanitizeTopicMismatchedFeedback(normalizeEvaluation(parsed), topicId);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Task evaluation error:", error);
    return NextResponse.json({ error: "Failed to evaluate task" }, { status: 500 });
  }
}
