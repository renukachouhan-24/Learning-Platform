// "use client";
// import { useParams } from "next/navigation";
// import { useState } from "react";
// import { coursesData} from "@/lib/coursesData";

// interface QuizQuestion {
//   question: string;
//   options: string[];
//   correctAnswer: string;
//   explanation: string;
// }

// export default function TopicPage() {
//   const { id } = useParams();
//   const [loading, setLoading] = useState(false);
//   const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
//   const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
//   const [showResults, setShowResults] = useState(false);
 
//   const allTopics = Object.values(coursesData).flatMap(course => course.topics);
//   const currentTopic = allTopics.find(t => t.id === id);

//   // AI Quiz Generate करने का फंक्शन
//   const generateQuiz = async () => {
//     setLoading(true);
//     setShowResults(false);
//     try {
//       const response = await fetch("/api/generate-quiz", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ topic: id }),
//       });
//       const data = await response.json();
//       // मान लेते हैं कि AI हमें 'questions' एरे दे रहा है
//       setQuiz(data.questions || []);
//     } catch (error) {
//       console.error("Error generating quiz:", error);
//     }
//     setLoading(false);
//   };

//   const handleOptionSelect = (qIdx: number, option: string) => {
//     setSelectedAnswers({ ...selectedAnswers, [qIdx]: option });
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 pb-20">
//       {/* 3. यहाँ currentTopic का इस्तेमाल करें */}
//       <div className="bg-black w-full aspect-video max-h-125 flex items-center justify-center">
//         {currentTopic ? (
//           <iframe
//             className="w-full h-full max-w-4xl"
//             src={`https://www.youtube.com/embed/${currentTopic.videoHindi}`}
//             title={currentTopic.title}
//             allowFullScreen
//           ></iframe>
//         ) : (
//           <p className="text-white">Video not found</p>
//         )}
//       </div>

//       <div className="max-w-4xl mx-auto p-6 mt-8">
//         <h1 className="text-3xl font-bold mb-4">
//           {currentTopic ? currentTopic.title : "Learning Topic"}
//         </h1>
        
//         {/* 2. AI Quiz Controller */}
//         <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-xl font-bold">Practice Quiz</h2>
//             <button 
//               onClick={generateQuiz}
//               disabled={loading}
//               className="px-6 py-2 bg-purple-600 text-white rounded-full font-bold hover:bg-purple-700 disabled:bg-gray-400 transition-all"
//             >
//               {loading ? "AI is thinking..." : "✨ Generate AI Quiz"}
//             </button>
//           </div>

//           {/* 3. Quiz Questions Display */}
//           {quiz.length > 0 && (
//             <div className="space-y-8">
//               {quiz.map((q, qIdx) => (
//                 <div key={qIdx} className="border-b pb-6">
//                   <p className="font-semibold text-lg mb-4">{qIdx + 1}. {q.question}</p>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                     {q.options.map((opt: string) => (
//                       <button
//                         key={opt}
//                         onClick={() => handleOptionSelect(qIdx, opt)}
//                         className={`p-3 rounded-xl border text-left transition-all ${
//                           selectedAnswers[qIdx] === opt ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 hover:bg-gray-100"
//                         }`}
//                       >
//                         {opt}
//                       </button>
//                     ))}
//                   </div>
//                   {showResults && (
//                     <div className={`mt-3 p-3 rounded-lg text-sm ${selectedAnswers[qIdx] === q.correctAnswer ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
//                       {selectedAnswers[qIdx] === q.correctAnswer ? "✅ Correct!" : `❌ Wrong. Answer: ${q.correctAnswer}`}
//                       <p className="mt-1 italic opacity-80">{q.explanation}</p>
//                     </div>
//                   )}
//                 </div>
//               ))}
              
//               {!showResults && (
//                 <button 
//                   onClick={() => setShowResults(true)}
//                   className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold text-xl hover:bg-green-700 transition-all"
//                 >
//                   Submit Quiz
//                 </button>
//               )}
//             </div>
//           )}

//           {quiz.length === 0 && !loading && (
//             <p className="text-center text-gray-400 py-10">Click the button above to generate a fresh AI quiz for this topic!</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


// "use client";
// import { useParams, useRouter } from "next/navigation";
// import { useState } from "react";
// import { coursesData } from "@/lib/coursesData";

// interface QuizQuestion {
//   question: string;
//   options: string[];
//   correctAnswer: string;
//   explanation: string;
// }

// export default function TopicPage() {
//   const { id } = useParams();
//   const router = useRouter();
//   const [activeTab, setActiveTab] = useState<"video" | "quiz" | "tasks">("video");
//   const [loading, setLoading] = useState(false);
//   const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
//   const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
//   const [showResults, setShowResults] = useState(false);

//   const allTopics = Object.values(coursesData).flatMap(course => course.topics);
//   const currentTopic = allTopics.find(t => t.id === id);

//   const generateQuiz = async () => {
//     setLoading(true);
//     setShowResults(false);
//     setSelectedAnswers({});
//     try {
//       const response = await fetch("/api/generate-quiz", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ topic: id }),
//       });

//       if (!response.ok) {
//         throw new Error("Quiz generation failed");
//       }

//       const data = await response.json();
//       setQuiz(data.questions || []);
//     } catch (error) {
//       console.error("Error generating quiz:", error);
//       setQuiz([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const score = quiz.reduce((total, question, index) => {
//     return total + (selectedAnswers[index] === question.correctAnswer ? 1 : 0);
//   }, 0);

//   if (!currentTopic) return <div className="bg-[#0a0a0c] text-white h-screen flex items-center justify-center">Loading...</div>;

//   return (
//     <div className="min-h-screen bg-[#0a0a0c] text-white font-sans selection:bg-blue-500/30">
//       {/* Top Header */}
//       <div className="max-w-5xl mx-auto px-6 py-8">
//         <button onClick={() => router.back()} className="text-gray-500 hover:text-white mb-6 transition-colors">← Back</button>
//         <div className="flex items-center gap-4">
//             <h1 className="text-3xl font-black">{currentTopic.title}</h1>
//             <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-widest font-bold text-gray-400">Step 1</span>
//         </div>
//         <p className="text-gray-500 mt-2">{currentTopic.description}</p>
//       </div>

//       {/* Tabs Navigation */}
//       <div className="max-w-5xl mx-auto px-6 mb-8">
//         <div className="bg-[#121214] p-1.5 rounded-2xl border border-white/5 inline-flex">
//           {(["video", "quiz", "tasks"] as const).map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-8 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
//                 activeTab === tab ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
//               }`}
//             >
//               {tab}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Main Content Area */}
//       <div className="max-w-5xl mx-auto px-6 pb-20">
        
//         {/* --- VIDEO TAB --- */}
//         {activeTab === "video" && (
//           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
//             <div className="relative aspect-video rounded-4xl overflow-hidden border border-white/10 bg-black shadow-2xl shadow-blue-500/5">
//               <iframe
//                 className="w-full h-full"
//                 src={`https://www.youtube.com/embed/${currentTopic.videoHindi}`}
//                 title={currentTopic.title}
//                 allowFullScreen
//               ></iframe>
//             </div>
//             <p className="text-center text-gray-500 text-sm italic">After watching, head over to the Quiz tab to test your knowledge.</p>
//           </div>
//         )}

//         {/* --- QUIZ TAB --- */}
//         {activeTab === "quiz" && (
//           <div className="bg-[#121214] rounded-4xl border border-white/5 p-8 md:p-12 animate-in fade-in zoom-in-95 duration-500">
//             <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
//                 <div>
//                     <h2 className="text-2xl font-black mb-1">AI Practice Quiz</h2>
//                     <p className="text-gray-500 text-sm">Powered by Llama 3.1 8B</p>
//                 </div>
//                 <button 
//                   onClick={generateQuiz}
//                   disabled={loading}
//                   className="px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
//                 >
//                   {loading ? "AI is generating..." : "✨ Generate Quiz"}
//                 </button>
//             </div>

//             {quiz.length > 0 ? (
//                 <div className="space-y-12">
//                 {showResults && (
//                   <div className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-6">
//                     <p className="text-sm uppercase tracking-[0.2em] text-blue-300 font-bold">Quiz Result</p>
//                     <h3 className="mt-2 text-3xl font-black">{score} / {quiz.length}</h3>
//                     <p className="mt-2 text-sm text-gray-400">Each question now shows the correct answer and the explanation.</p>
//                   </div>
//                 )}
//                     {quiz.map((q, qIdx) => (
//                         <div key={qIdx} className="space-y-6">
//                             <p className="text-xl font-bold leading-relaxed">{qIdx + 1}. {q.question}</p>
//                             <div className="grid grid-cols-1 gap-3">
//                                 {q.options.map((opt) => (
//                                     <button
//                                         key={opt}
//                                         onClick={() => handleOptionSelect(qIdx, opt)}
//                                         className={`p-5 rounded-2xl border text-left transition-all font-medium ${
//                                             showResults
//                                               ? opt === q.correctAnswer
//                                                 ? "bg-green-500/10 border-green-500 text-green-300"
//                                                 : selectedAnswers[qIdx] === opt
//                                                   ? "bg-red-500/10 border-red-500 text-red-300"
//                                                   : "bg-white/5 border-white/5 text-gray-400"
//                                               : selectedAnswers[qIdx] === opt
//                                                 ? "bg-blue-600/10 border-blue-500 text-blue-400"
//                                                 : "bg-white/5 border-white/5 hover:border-white/10"
//                                         }`}
//                                     >
//                                         {opt}
//                                     </button>
//                                 ))}
//                             </div>
//                             {showResults && (
//                                 <div className={`rounded-2xl border p-5 ${selectedAnswers[qIdx] === q.correctAnswer ? "border-green-500/30 bg-green-500/10" : "border-red-500/30 bg-red-500/10"}`}>
//                                     <p className="font-bold text-sm uppercase tracking-wider text-white/80">
//                                       Your answer: {selectedAnswers[qIdx] || "Not answered"}
//                                     </p>
//                                     <p className="mt-2 text-base font-semibold text-white">
//                                       Correct answer: {q.correctAnswer}
//                                     </p>
//                                     <p className="mt-3 text-sm leading-7 text-gray-300">
//                                       {q.explanation}
//                                     </p>
//                                 </div>
//                             )}
//                         </div>
//                     ))}
//                     {!showResults && (
//                         <button onClick={() => setShowResults(true)} className="w-full py-5 bg-white text-black rounded-3xl font-black text-lg hover:bg-gray-200 transition-all">Submit Answers</button>
//                     )}
//                 </div>
//             ) : (
//                 <div className="text-center py-20">
//                     <p className="text-gray-600 mb-6">Ready to test your skills? Click the generate button above.</p>
//                 </div>
//             )}
//         </div>
//         )}

//         {/* --- TASKS TAB --- */}
//         {activeTab === "tasks" && (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
//             <div className="p-8 bg-linear-to-br from-white/5 to-transparent border border-white/5 rounded-4xl">
//                 <span className="text-blue-500 text-xs font-black uppercase tracking-widest">Task 1</span>
//                 <h3 className="text-2xl font-bold mt-2 mb-4">Structure Webpage</h3>
//                 <p className="text-gray-400 text-sm mb-6">Create a page with one heading, one paragraph and an image.</p>
//                 <button className="text-xs font-bold bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors">Mark Completed</button>
//             </div>
//           </div>
//         )}

//       </div>
//     </div>
//   );

//   function handleOptionSelect(qIdx: number, option: string) {
//     if (showResults) return;
//     setSelectedAnswers({ ...selectedAnswers, [qIdx]: option });
//   }
// }


"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { coursesData } from "@/lib/coursesData";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

const WEB_PREVIEW_TOPICS = new Set(["html", "css", "js"]);

function isFirestoreOfflineError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return msg.includes("client is offline") || msg.includes("unavailable") || msg.includes("network");
}

function handleFirestoreSyncError(error: unknown, label: "load" | "save") {
  if (isFirestoreOfflineError(error)) {
    return;
  }

  if (process.env.NODE_ENV === "development") {
    console.warn(`Firestore progress ${label} warning:`, error);
  }
}

function getTaskStarterCode(topicId: string, task: string) {
  if (topicId === "html") {
    return `<!DOCTYPE html>
<html>
  <head>
    <title>Mini Task</title>
  </head>
  <body>
    <h1>${task}</h1>
    <p>Start building here...</p>
  </body>
</html>`;
  }

  if (topicId === "css") {
    return `/* Task: ${task} */
body {
  font-family: Arial, sans-serif;
  background: #f5f5f5;
  margin: 0;
  padding: 24px;
}

.card {
  max-width: 360px;
  margin: 0 auto;
  padding: 20px;
  border-radius: 12px;
  background: white;
}`;
  }

  if (topicId === "js") {
    return `// Task: ${task}
const app = document.getElementById("app");
let count = 0;

function render() {
  app.innerHTML = \`<h2>Counter: \${count}</h2>\`;
}

render();`;
  }

  return `# ${task}\n\n# Write your solution here`;
}

function buildPreviewDoc(topicId: string, code: string) {
  if (topicId === "html") {
    return code;
  }

  if (topicId === "css") {
    return `<!DOCTYPE html>
<html>
  <head>
    <style>${code}</style>
  </head>
  <body>
    <div class="card">
      <h2>Preview Card</h2>
      <p>Your CSS changes are visible here.</p>
      <button>Demo Button</button>
    </div>
  </body>
</html>`;
  }

  if (topicId === "js") {
    return `<!DOCTYPE html>
<html>
  <body>
    <div id="app"></div>
    <script>${code}</script>
  </body>
</html>`;
  }

  return "";
}

export default function TopicPage() {
  const { id } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"video" | "quiz" | "tasks">("video");
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  // --- NEW: Video Language & Dynamic ID Logic ---
  const [videoLanguage, setVideoLanguage] = useState<"Hindi" | "English">("English");
  const [dynamicVideoId, setDynamicVideoId] = useState<string>("");
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoError, setVideoError] = useState<string>("");
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [activeTaskIndex, setActiveTaskIndex] = useState<number | null>(null);
  const [taskDrafts, setTaskDrafts] = useState<Record<number, string>>({});
  const [taskCheckLoading, setTaskCheckLoading] = useState(false);
  const [taskFeedback, setTaskFeedback] = useState<Record<number, { passed: boolean; score: number; feedback: string; missing: string[] }>>({});
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const allTopics = Object.values(coursesData).flatMap(course => course.topics);
  const currentTopic = allTopics.find(t => t.id === id);

  useEffect(() => {
    if (!currentTopic || typeof window === "undefined") return;

    // Step 1: Load from localStorage immediately (fast, offline)
    const saved = window.localStorage.getItem(`mini-tasks:${currentTopic.id}`);
    const parsed = saved ? JSON.parse(saved) : [];
    const localCompleted: number[] = Array.isArray(parsed)
      ? parsed.filter((item): item is number => typeof item === "number")
      : [];
    setCompletedTasks(localCompleted);

    const savedDrafts = window.localStorage.getItem(`mini-task-drafts:${currentTopic.id}`);
    setTaskDrafts(savedDrafts ? (JSON.parse(savedDrafts) as Record<number, string>) : {});
    setActiveTaskIndex(null);

    // Step 2: Sync from Firestore if user is logged in (cross-device)
    if (user) {
      const docRef = doc(db, "users", user.uid, "progress", currentTopic.id);
      getDoc(docRef)
        .then((snap) => {
          if (snap.exists()) {
            const firestoreData = snap.data();
            const firestoreCompleted: number[] = Array.isArray(firestoreData.completedTasks)
              ? firestoreData.completedTasks.filter((item: unknown): item is number => typeof item === "number")
              : [];
            // Merge: union of localStorage + Firestore (tak koi bhi device ka data na khoye)
            const merged = Array.from(
              new Set([...localCompleted, ...firestoreCompleted])
            ).sort((a, b) => a - b);
            setCompletedTasks(merged);
            window.localStorage.setItem(`mini-tasks:${currentTopic.id}`, JSON.stringify(merged));

            // If local has newer progress, push merged state back to Firestore.
            if (merged.length !== firestoreCompleted.length) {
              setDoc(docRef, { completedTasks: merged }, { merge: true }).catch((err) => {
                handleFirestoreSyncError(err, "save");
              });
            }
          }
        })
        .catch((err) => handleFirestoreSyncError(err, "load"));
    }
  }, [currentTopic, user]);

  useEffect(() => {
    const fetchTopVideo = async () => {
      if (!currentTopic) {
        return;
      }

      const cacheKey = `topic-video:${currentTopic.id}:${videoLanguage}`;

      if (typeof window !== "undefined") {
        const cachedVideoId = window.sessionStorage.getItem(cacheKey);

        if (cachedVideoId) {
          setDynamicVideoId(cachedVideoId);
          setVideoError("");
          setVideoLoading(false);
          return;
        }
      }

      setVideoLoading(true);
      setDynamicVideoId("");
      setVideoError("");

      try {
        const params = new URLSearchParams({
          topic: currentTopic.title,
          description: currentTopic.description,
          lang: videoLanguage,
        });

        const res = await fetch(`/api/get-videos?${params.toString()}`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          const fallback = videoLanguage === "Hindi" ? currentTopic.videoHindi : currentTopic.videoEnglish;
          setDynamicVideoId(fallback);
          if (typeof window !== "undefined") window.sessionStorage.setItem(cacheKey, fallback);
          return;
        }

        if (data.videoId) {
          setDynamicVideoId(data.videoId);
          if (typeof window !== "undefined") {
            window.sessionStorage.setItem(cacheKey, data.videoId);
          }
        } else {
          const fallback = videoLanguage === "Hindi" ? currentTopic.videoHindi : currentTopic.videoEnglish;
          setDynamicVideoId(fallback);
        }
      } catch (error) {
        console.error("Error fetching YouTube video:", error);
        const fallback = videoLanguage === "Hindi" ? currentTopic.videoHindi : currentTopic.videoEnglish;
        setDynamicVideoId(fallback);
        setVideoError("");
      } finally {
        setVideoLoading(false);
      }
    };
    
    if (currentTopic) fetchTopVideo();
  }, [videoLanguage, currentTopic]);

  const generateQuiz = async () => {
    setLoading(true);
    setShowResults(false);
    setSelectedAnswers({});
    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: id }),
      });
      const data = await response.json();
      setQuiz(data.questions || []);
    } catch (error) {
      console.error("Error generating quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const score = quiz.reduce((total, question, index) => {
    return total + (selectedAnswers[index] === question.correctAnswer ? 1 : 0);
  }, 0);

  const completedSet = new Set(completedTasks);
  let unlockedIndex = 0;
  while (completedSet.has(unlockedIndex)) {
    unlockedIndex += 1;
  }

  const openTaskWorkspace = (index: number) => {
    if (!currentTopic) return;
    if (index > unlockedIndex) return;

    setActiveTaskIndex(index);

    if (!taskDrafts[index]) {
      const starter = getTaskStarterCode(currentTopic.id, currentTopic.miniTasks[index]);
      const updatedDrafts = { ...taskDrafts, [index]: starter };
      setTaskDrafts(updatedDrafts);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(`mini-task-drafts:${currentTopic.id}`, JSON.stringify(updatedDrafts));
      }
    }

    setTimeout(() => {
      workspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const updateTaskDraft = (index: number, value: string) => {
    if (!currentTopic) return;

    const updatedDrafts = { ...taskDrafts, [index]: value };
    setTaskDrafts(updatedDrafts);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(`mini-task-drafts:${currentTopic.id}`, JSON.stringify(updatedDrafts));
    }
  };

  const evaluateActiveTask = async () => {
    if (!currentTopic || activeTaskIndex === null) return;

    const code = (taskDrafts[activeTaskIndex] ?? "").trim();
    if (!code) {
      setTaskFeedback((prev) => ({
        ...prev,
        [activeTaskIndex]: {
          passed: false,
          score: 0,
          feedback: "Code editor is empty. Add your solution first.",
          missing: ["No code submitted"],
        },
      }));
      return;
    }

    setTaskCheckLoading(true);
    try {
      const previewDoc = WEB_PREVIEW_TOPICS.has(currentTopic.id)
        ? buildPreviewDoc(currentTopic.id, taskDrafts[activeTaskIndex] ?? "")
        : "";

      const res = await fetch("/api/evaluate-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: currentTopic.id,
          task: currentTopic.miniTasks[activeTaskIndex],
          code: taskDrafts[activeTaskIndex] ?? "",
          previewDoc,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(String(data.error || "Task evaluation failed"));
      }

      setTaskFeedback((prev) => ({
        ...prev,
        [activeTaskIndex]: {
          passed: Boolean(data.passed),
          score: typeof data.score === "number" ? data.score : 0,
          feedback: typeof data.feedback === "string" ? data.feedback : "Try improving the solution.",
          missing: Array.isArray(data.missing)
            ? data.missing.filter((item: unknown): item is string => typeof item === "string")
            : [],
        },
      }));

      if (data.passed && activeTaskIndex <= unlockedIndex && !completedSet.has(activeTaskIndex)) {
        const updated = [...completedTasks, activeTaskIndex].sort((a, b) => a - b);
        setCompletedTasks(updated);
        // Save to localStorage (fast, offline)
        if (typeof window !== "undefined") {
          window.localStorage.setItem(`mini-tasks:${currentTopic.id}`, JSON.stringify(updated));
        }
        // Save to Firestore (cross-device, account-based)
        if (user) {
          const docRef = doc(db, "users", user.uid, "progress", currentTopic.id);
          setDoc(docRef, { completedTasks: updated }, { merge: true }).catch((err) => {
            handleFirestoreSyncError(err, "save");
          });
        }
      }
    } catch (error) {
      setTaskFeedback((prev) => ({
        ...prev,
        [activeTaskIndex]: {
          passed: false,
          score: 0,
          feedback: error instanceof Error ? error.message : "Task evaluation failed",
          missing: [],
        },
      }));
    } finally {
      setTaskCheckLoading(false);
    }
  };

  if (!currentTopic) return <div className="bg-[#f4f3f9] text-slate-700 h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f4f3f9] text-slate-900 font-sans selection:bg-purple-100">
      {/* Top Header */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <button onClick={() => router.back()} className="text-slate-500 hover:text-violet-500 mb-6 transition-colors font-medium">← Back to Path</button>
        <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black">{currentTopic.title}</h1>
            <span className="px-3 py-1 bg-violet-50 border border-violet-100 rounded-full text-[10px] uppercase tracking-widest font-bold text-slate-500">Step 1</span>
        </div>
        <p className="text-slate-500 mt-2">{currentTopic.description}</p>
      </div>

      {/* Tabs Navigation & Language Toggle */}
      <div className="max-w-5xl mx-auto px-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 inline-flex shadow-sm">
          {(["video", "quiz", "tasks"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
                activeTab === tab ? "bg-violet-500 text-white shadow" : "text-slate-500 hover:text-violet-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* --- Language Toggle Pill (Video Style) --- */}
        {activeTab === "video" && (
          <div className="flex bg-white p-1 rounded-full border border-slate-200 shadow-sm">
                <button 
                    onClick={() => setVideoLanguage("English")}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold transition-all ${videoLanguage === "English" ? "bg-violet-500 text-white shadow" : "text-slate-500"}`}
                >
                    🇺🇸 English
                </button>
                <button 
                    onClick={() => setVideoLanguage("Hindi")}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold transition-all ${videoLanguage === "Hindi" ? "bg-violet-500 text-white shadow" : "text-slate-500"}`}
                >
                    🇮🇳 Hindi
                </button>
            </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        
        {/* --- VIDEO TAB --- */}
        {activeTab === "video" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative aspect-video rounded-4xl overflow-hidden border border-slate-200 bg-white shadow-lg flex items-center justify-center">
              {videoLoading ? (
                  <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-slate-500 text-sm font-medium">Finding best {videoLanguage} tutorial...</p>
                  </div>
              ) : dynamicVideoId ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${dynamicVideoId}`}
                  title={currentTopic.title}
                  allowFullScreen
                ></iframe>
              ) : videoError ? (
                <div className="px-6 text-center">
                  <p className="text-red-500 font-semibold">{videoError}</p>
                  <p className="mt-2 text-sm text-slate-500">Check your YouTube API key and quota, then try again.</p>
                </div>
              ) : (
                <p className="text-slate-500">Video not found</p>
              )}
            </div>
            <p className="text-center text-slate-500 text-sm italic">Showing most popular {videoLanguage} tutorial for {currentTopic.title}.</p>
          </div>
        )}

        {/* --- QUIZ TAB --- */}
        {activeTab === "quiz" && (
          <div className="bg-white rounded-4xl border border-slate-200 p-8 md:p-12 animate-in fade-in zoom-in-95 duration-500 shadow-sm">
            <div className="flex justify-between items-center mb-10 border-b border-slate-100 pb-6">
                <div>
                    <h2 className="text-2xl font-black mb-1">AI Practice Quiz</h2>
                </div>
                <button 
                  onClick={generateQuiz}
                  disabled={loading}
                  className="px-6 py-3 bg-linear-to-r from-violet-500 to-pink-400 text-white rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? "AI is thinking..." : "✨ Generate 10 Questions"}
                </button>
            </div>

            {quiz.length > 0 ? (
                <div className="space-y-12">
                {showResults && (
                  <div className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-6 animate-in zoom-in-95">
                      <p className="text-sm uppercase tracking-[0.2em] text-violet-500 font-bold">Quiz Result</p>
                    <h3 className="mt-2 text-3xl font-black">{score} / {quiz.length}</h3>
                  </div>
                )}
                    {quiz.map((q, qIdx) => (
                        <div key={qIdx} className="space-y-6">
                            <p className="text-xl font-bold leading-relaxed">{qIdx + 1}. {q.question}</p>
                            <div className="grid grid-cols-1 gap-3">
                                {q.options.map((opt) => (
                                    <button
                                        key={opt}
                                        disabled={showResults}
                                        onClick={() => handleOptionSelect(qIdx, opt)}
                                        className={`p-5 rounded-2xl border text-left transition-all font-medium ${
                                            showResults
                                              ? opt === q.correctAnswer
                                                ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                                                : selectedAnswers[qIdx] === opt
                                                  ? "bg-red-50 border-red-500 text-red-700"
                                                  : "bg-slate-50 border-slate-200 text-slate-500"
                                              : selectedAnswers[qIdx] === opt
                                                ? "bg-violet-50 border-violet-500 text-violet-600"
                                                : "bg-slate-50 border-slate-200 hover:border-violet-200"
                                        }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                            {showResults && (
                              <div className={`rounded-2xl border p-6 animate-in slide-in-from-left-4 ${selectedAnswers[qIdx] === q.correctAnswer ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`w-2 h-2 rounded-full ${selectedAnswers[qIdx] === q.correctAnswer ? "bg-emerald-500" : "bg-red-500"}`}></div>
                                  <p className="text-xs uppercase tracking-widest font-black text-slate-500">Explanation</p>
                                    </div>
                                <p className="text-sm leading-7 text-slate-700 italic">
                                      {q.explanation}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                    {!showResults && (
                          <button onClick={() => setShowResults(true)} className="w-full py-5 bg-linear-to-r from-violet-500 to-pink-400 text-white rounded-3xl font-black text-lg hover:opacity-95 transition-all shadow">Submit Answers</button>
                    )}
                </div>
            ) : (
                      <div className="text-center py-20 bg-violet-50 rounded-4xl border border-dashed border-violet-200">
                        <p className="text-slate-500 mb-6">Ready to test your knowledge about {currentTopic.title}?</p>
                </div>
            )}
        </div>
        )}

        {/* --- TASKS TAB --- */}
        {activeTab === "tasks" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="p-6 rounded-3xl border border-violet-100 bg-violet-50">
              <p className="text-xs uppercase tracking-widest text-violet-500 font-black">Mini Tasks</p>
              <h3 className="text-2xl font-black mt-2">{currentTopic.title} Coding Drills</h3>
              <p className="text-slate-500 mt-2 text-sm">
                Completed {completedTasks.length}/{currentTopic.miniTasks.length}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentTopic.miniTasks.map((task, index) => {
                const isDone = completedSet.has(index);
                const isLocked = index > unlockedIndex;

                return (
                  <div
                    key={task}
                    className={`p-8 border rounded-4xl relative overflow-hidden ${
                      isDone
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <span className="text-6xl font-black italic">{String(index + 1).padStart(2, "0")}</span>
                    </div>

                    <span className="text-violet-500 text-xs font-black uppercase tracking-widest">Challenge</span>
                    <h4 className="text-xl font-bold mt-2 mb-4">Task {index + 1}</h4>
                    <p className="text-slate-600 text-sm mb-8 leading-relaxed">{task}</p>

                    <div className={`mb-3 text-xs font-bold uppercase tracking-widest ${isDone ? "text-emerald-600" : isLocked ? "text-slate-400" : "text-violet-500"}`}>
                      {isDone ? "Completed" : isLocked ? "Locked" : "Ready to Solve"}
                    </div>

                    <button
                      type="button"
                      onClick={() => openTaskWorkspace(index)}
                      disabled={isLocked}
                      className="mt-3 w-full py-3 border rounded-xl font-bold transition-all bg-violet-50 hover:bg-violet-100 border-violet-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isLocked ? "Complete Previous Task" : activeTaskIndex === index ? "Workspace Opened" : "Open Workspace"}
                    </button>
                  </div>
                );
              })}
            </div>

            {activeTaskIndex !== null && (
              <div ref={workspaceRef} className="rounded-4xl border border-slate-200 bg-white p-6 md:p-8 space-y-5 shadow-sm">
                <div>
                  <p className="text-xs uppercase tracking-widest text-violet-500 font-black">Task Workspace</p>
                  <h4 className="text-2xl font-black mt-2">Task {activeTaskIndex + 1}</h4>
                  <p className="text-slate-500 mt-2 text-sm">{currentTopic.miniTasks[activeTaskIndex]}</p>
                </div>

                <textarea
                  value={taskDrafts[activeTaskIndex] ?? ""}
                  onChange={(e) => updateTaskDraft(activeTaskIndex, e.target.value)}
                  className="w-full min-h-65 rounded-2xl bg-slate-50 border border-slate-200 p-4 text-sm font-mono outline-none focus:border-violet-500"
                  spellCheck={false}
                />

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={evaluateActiveTask}
                    disabled={taskCheckLoading}
                    className="px-5 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-bold disabled:opacity-50"
                  >
                    {taskCheckLoading ? "Checking..." : "Check with AI"}
                  </button>
                  <p className="text-xs text-slate-500">Pass this task to unlock the next one.</p>
                </div>

                {taskFeedback[activeTaskIndex] && (
                  <div className={`rounded-2xl border p-4 ${taskFeedback[activeTaskIndex].passed ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
                    <p className="font-bold">
                      {taskFeedback[activeTaskIndex].passed ? "Passed" : "Needs Improvement"} · Score {taskFeedback[activeTaskIndex].score}/100
                    </p>
                    <p className="mt-2 text-sm text-slate-700">{taskFeedback[activeTaskIndex].feedback}</p>
                    {taskFeedback[activeTaskIndex].missing.length > 0 && (
                      <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">
                        {taskFeedback[activeTaskIndex].missing.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {WEB_PREVIEW_TOPICS.has(currentTopic.id) ? (
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-widest text-violet-500 font-black">Live Preview</p>
                    <iframe
                      title="task-preview"
                      className="w-full h-80 rounded-2xl border border-slate-200 bg-white"
                      srcDoc={buildPreviewDoc(currentTopic.id, taskDrafts[activeTaskIndex] ?? "")}
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    Live UI preview is available for HTML, CSS, and JavaScript tasks.
                    For this topic, write code here and run/test it in your local IDE.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );

  function handleOptionSelect(qIdx: number, option: string) {
    if (showResults) return;
    setSelectedAnswers({ ...selectedAnswers, [qIdx]: option });
  }
}