"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { coursesData } from "@/lib/coursesData";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { ArrowLeft, BookOpenText, Brain, CheckCircle2, Code2, Languages, PlayCircle, Sparkles } from "lucide-react";
import { calculateStreakUpdate, getTodayDateString } from "@/lib/streakUtils";

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
  const getScopedTaskKey = (topicId: string, uid: string) => `mini-tasks:${uid}:${topicId}`;
  const getScopedDraftKey = (topicId: string, uid: string) => `mini-task-drafts:${uid}:${topicId}`;

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
    if (!currentTopic || !user) return;

    const currentPathId = Object.entries(coursesData).find(([, course]) =>
      course.topics.some((topic) => topic.id === currentTopic.id)
    )?.[0];

    if (!currentPathId) return;

    const profileDocRef = doc(db, "users", user.uid);
    setDoc(
      profileDocRef,
      {
        lastVisitedTopicId: currentTopic.id,
        lastVisitedTopicTitle: currentTopic.title,
        lastVisitedPathId: currentPathId,
        lastVisitedAt: serverTimestamp(),
      },
      { merge: true }
    ).catch((err) => handleFirestoreSyncError(err, "save"));
  }, [currentTopic, user]);

  useEffect(() => {
    if (!currentTopic || typeof window === "undefined" || !user) return;

    const scopedTaskKey = getScopedTaskKey(currentTopic.id, user.uid);
    const scopedDraftKey = getScopedDraftKey(currentTopic.id, user.uid);

    // Step 1: Load from localStorage immediately (fast, offline)
    const scopedSaved = window.localStorage.getItem(scopedTaskKey);
    const legacySaved = window.localStorage.getItem(`mini-tasks:${currentTopic.id}`);
    const saved = scopedSaved ?? legacySaved;
    const parsed = saved ? JSON.parse(saved) : [];
    const localCompleted: number[] = Array.isArray(parsed)
      ? parsed.filter((item): item is number => typeof item === "number")
      : [];
    if (!scopedSaved && localCompleted.length > 0) {
      window.localStorage.setItem(scopedTaskKey, JSON.stringify(localCompleted));
    }
    setCompletedTasks(localCompleted);

    const scopedSavedDrafts = window.localStorage.getItem(scopedDraftKey);
    const legacySavedDrafts = window.localStorage.getItem(`mini-task-drafts:${currentTopic.id}`);
    const savedDrafts = scopedSavedDrafts ?? legacySavedDrafts;
    if (!scopedSavedDrafts && legacySavedDrafts) {
      window.localStorage.setItem(scopedDraftKey, legacySavedDrafts);
    }
    setTaskDrafts(savedDrafts ? (JSON.parse(savedDrafts) as Record<number, string>) : {});
    setActiveTaskIndex(null);

    // Step 2: Sync from Firestore (cross-device)
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
          window.localStorage.setItem(scopedTaskKey, JSON.stringify(merged));

          // If local has newer progress, push merged state back to Firestore.
          if (merged.length !== firestoreCompleted.length) {
            setDoc(docRef, { completedTasks: merged }, { merge: true }).catch((err) => {
              handleFirestoreSyncError(err, "save");
            });
          }
        }
      })
      .catch((err) => handleFirestoreSyncError(err, "load"));
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

    const uid = user?.uid ?? auth.currentUser?.uid;
    if (!uid) return;

    setActiveTaskIndex(index);

    if (!taskDrafts[index]) {
      const starter = getTaskStarterCode(currentTopic.id, currentTopic.miniTasks[index]);
      const updatedDrafts = { ...taskDrafts, [index]: starter };
      setTaskDrafts(updatedDrafts);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(getScopedDraftKey(currentTopic.id, uid), JSON.stringify(updatedDrafts));
      }
    }

    setTimeout(() => {
      workspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const updateTaskDraft = (index: number, value: string) => {
    if (!currentTopic) return;

    const uid = user?.uid ?? auth.currentUser?.uid;
    if (!uid) return;

    const updatedDrafts = { ...taskDrafts, [index]: value };
    setTaskDrafts(updatedDrafts);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(getScopedDraftKey(currentTopic.id, uid), JSON.stringify(updatedDrafts));
    }
  };

  const updateDailyStreak = async (awardXp: boolean) => {
    if (!user) return;

    const profileDocRef = doc(db, "users", user.uid);
    const todayDate = getTodayDateString();

    try {
      const profileSnap = await getDoc(profileDocRef);

      const data = profileSnap.exists() ? profileSnap.data() : {};
      const previousLastActiveDate = typeof data.lastActiveDate === "string" ? data.lastActiveDate : null;
      const previousCurrentStreak = typeof data.currentStreak === "number" ? data.currentStreak : 0;
      const previousLongestStreak = typeof data.longestStreak === "number" ? data.longestStreak : 0;
      const previousTotalXP = typeof data.totalXP === "number" ? data.totalXP : 0;

      const newStreak = calculateStreakUpdate(previousLastActiveDate, previousCurrentStreak);
      const newLongestStreak = Math.max(previousLongestStreak, newStreak);
      const nextTotalXP = awardXp ? previousTotalXP + 20 : previousTotalXP;
      const nextLevel = Math.floor(nextTotalXP / 100) + 1;

      await setDoc(
        profileDocRef,
        {
          lastActiveDate: todayDate,
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          ...(awardXp ? { totalXP: nextTotalXP, level: nextLevel } : {}),
        },
        { merge: true }
      );
    } catch (err) {
      handleFirestoreSyncError(err, "save");
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

      const isNewCompletion = data.passed && activeTaskIndex <= unlockedIndex && !completedSet.has(activeTaskIndex);

      // Streak should update whenever user passes a task (even if task was already completed before).
      if (data.passed) {
        await updateDailyStreak(isNewCompletion);
      }

      if (isNewCompletion) {
        const updated = [...completedTasks, activeTaskIndex].sort((a, b) => a - b);
        setCompletedTasks(updated);
        // Save to localStorage (fast, offline)
        if (typeof window !== "undefined" && user) {
          window.localStorage.setItem(getScopedTaskKey(currentTopic.id, user.uid), JSON.stringify(updated));
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

  const topicTaskTotal = currentTopic.miniTasks.length;
  const topicTaskDone = completedTasks.length;
  const topicTaskPercent = topicTaskTotal > 0 ? Math.round((topicTaskDone / topicTaskTotal) * 100) : 0;

  return (
    <div className="app-surface min-h-screen bg-[#f4f3f9] text-slate-900 font-sans selection:bg-purple-100 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 rounded-full bg-violet-200/45 blur-3xl" />
      <div className="pointer-events-none absolute top-24 -right-16 w-80 h-80 rounded-full bg-pink-200/45 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 w-md h-112 rounded-full bg-cyan-100/45 blur-3xl" />

      {/* Top Header */}
      <div className="relative z-10 w-full px-3 md:px-4 py-6">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:text-violet-500 hover:shadow"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Path
        </button>

        <div className="rounded-3xl border border-violet-200/40 bg-white/95 backdrop-blur-xl p-6 md:p-8 shadow-[0_16px_45px_rgba(124,58,237,0.08)]">
          <div className="flex items-start gap-4 mb-3">
            <div className="flex-1">
              <h1 className="text-4xl font-black bg-clip-text text-transparent bg-linear-to-r from-violet-600 to-pink-600">{currentTopic.title}</h1>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1.5 bg-linear-to-r from-violet-50 to-blue-50 border border-violet-200 rounded-full text-[10px] uppercase tracking-widest font-bold text-violet-700">Topic</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-full text-[10px] uppercase tracking-widest font-bold text-pink-700">
                <Sparkles className="h-3.5 w-3.5" /> Guided
              </span>
            </div>
          </div>
          <p className="text-slate-600 mt-2 text-base leading-relaxed">{currentTopic.description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-[12px] font-bold text-violet-700 shadow-sm">
              <BookOpenText className="h-4 w-4" /> 10 Quiz Questions
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-[12px] font-bold text-emerald-700 shadow-sm">
              <Code2 className="h-4 w-4" /> {topicTaskTotal} Coding Tasks
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-[12px] font-bold text-blue-700 shadow-sm">
              <Brain className="h-4 w-4" /> AI Checked
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation & Language Toggle */}
      <div className="relative z-10 w-full px-3 md:px-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200/60 inline-flex shadow-md">
          {([
            { id: "video", icon: PlayCircle },
            { id: "quiz", icon: Brain },
            { id: "tasks", icon: Code2 },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
                activeTab === tab.id ? "bg-linear-to-r from-violet-500 to-pink-500 text-white shadow-md" : "text-slate-500 hover:text-violet-600"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <tab.icon className="h-4 w-4" /> {tab.id}
              </span>
            </button>
          ))}
        </div>

        {/* --- Language Toggle Pill (Video Style) --- */}
        {activeTab === "video" && (
          <div className="flex bg-white/90 backdrop-blur-sm p-1 rounded-full border border-slate-200/60 shadow-md">
                <button 
                    onClick={() => setVideoLanguage("English")}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold transition-all ${videoLanguage === "English" ? "bg-linear-to-r from-violet-500 to-pink-500 text-white shadow-md" : "text-slate-500 hover:text-violet-600"}`}
                >
                    <Languages className="h-3.5 w-3.5" /> English
                </button>
                <button 
                    onClick={() => setVideoLanguage("Hindi")}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold transition-all ${videoLanguage === "Hindi" ? "bg-linear-to-r from-violet-500 to-pink-500 text-white shadow-md" : "text-slate-500 hover:text-violet-600"}`}
                >
                    <Languages className="h-3.5 w-3.5" /> Hindi
                </button>
            </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full px-3 md:px-4 pb-16">
        
        {/* --- VIDEO TAB --- */}
        {activeTab === "video" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative mx-auto w-full max-w-4xl aspect-video rounded-4xl overflow-hidden border border-slate-200 bg-white shadow-lg flex items-center justify-center">
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
          <div className="bg-white/95 backdrop-blur-sm rounded-4xl border border-slate-200/60 p-8 md:p-12 animate-in fade-in zoom-in-95 duration-500 shadow-lg">
            <div className="flex justify-between items-center mb-10 border-b border-slate-200/60 pb-6">
                <div>
                    <h2 className="text-3xl font-black bg-clip-text text-transparent bg-linear-to-r from-violet-600 to-pink-600 mb-1">AI Practice Quiz</h2>
                    <p className="text-sm text-slate-500">Test your knowledge with AI-generated questions</p>
                </div>
                <button 
                  onClick={generateQuiz}
                  disabled={loading}
                  className="px-6 py-3 bg-linear-to-r from-violet-500 to-pink-500 text-white rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-lg"
                >
                  {loading ? "AI is thinking..." : "✨ Generate 10 Questions"}
                </button>
            </div>

            {quiz.length > 0 ? (
                <div className="space-y-12">
                {showResults && (
                  <div className="rounded-3xl border border-blue-200 bg-linear-to-br from-blue-50 to-blue-100/50 p-8 animate-in zoom-in-95 shadow-md">
                      <p className="text-sm uppercase tracking-[0.2em] text-blue-600 font-black">Quiz Result</p>
                    <h3 className="mt-3 text-4xl font-black text-blue-700">{score} / {quiz.length}</h3>
                    <p className="mt-2 text-sm text-blue-600 font-semibold">Score: {Math.round((score / quiz.length) * 100)}%</p>
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
                                        className={`p-5 rounded-2xl border text-left transition-all font-medium shadow-sm ${
                                            showResults
                                              ? opt === q.correctAnswer
                                                ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold"
                                                : selectedAnswers[qIdx] === opt
                                                  ? "bg-red-50 border-red-300 text-red-800 font-semibold"
                                                  : "bg-slate-50 border-slate-200 text-slate-400"
                                              : selectedAnswers[qIdx] === opt
                                                ? "bg-violet-100 border-violet-400 text-violet-700 font-semibold"
                                                : "bg-white border-slate-200 hover:border-violet-300 hover:bg-violet-50/50"
                                        }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                            {showResults && (
                              <div className={`rounded-2xl border p-6 animate-in slide-in-from-left-4 shadow-sm ${
                                selectedAnswers[qIdx] === q.correctAnswer 
                                  ? "border-emerald-200 bg-linear-to-r from-emerald-50 to-emerald-100/50" 
                                  : "border-red-200 bg-linear-to-r from-red-50 to-red-100/50"
                              }`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`w-2.5 h-2.5 rounded-full ${selectedAnswers[qIdx] === q.correctAnswer ? "bg-emerald-600" : "bg-red-600"}`}></div>
                                  <p className={`text-xs uppercase tracking-widest font-black ${selectedAnswers[qIdx] === q.correctAnswer ? "text-emerald-700" : "text-red-700"}`}>Explanation</p>
                                    </div>
                                <p className="text-sm leading-7 text-slate-800 font-medium">
                                      {q.explanation}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                    {!showResults && (
                          <button onClick={() => setShowResults(true)} className="w-full py-5 bg-linear-to-r from-violet-500 to-pink-500 text-white rounded-3xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg">Submit Answers</button>
                    )}
                </div>
            ) : (
                      <div className="text-center py-20 bg-linear-to-b from-violet-50 to-blue-50 rounded-4xl border border-dashed border-violet-200 shadow-sm">
                        <Brain className="h-12 w-12 mx-auto text-violet-400 mb-4 opacity-60" />
                        <p className="text-slate-600 mb-4 font-semibold">Ready to test your knowledge about {currentTopic.title}?</p>
                        <p className="text-sm text-slate-500">Generate AI-powered questions to practice this topic</p>
                </div>
            )}
        </div>
        )}

        {/* --- TASKS TAB --- */}
        {activeTab === "tasks" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="p-7 rounded-3xl border border-violet-200/60 bg-linear-to-br from-violet-50 to-blue-50/30 backdrop-blur-sm shadow-md">
              <p className="text-xs uppercase tracking-widest text-violet-700 font-black">Mini Tasks</p>
              <h3 className="text-3xl font-black mt-3 bg-clip-text text-transparent bg-linear-to-r from-violet-600 to-pink-600">{currentTopic.title} Coding Drills</h3>
              <p className="text-slate-600 mt-3 text-sm font-semibold">
                Completed <span className="text-violet-700 font-bold">{topicTaskDone}/{topicTaskTotal}</span>
              </p>
              <div className="mt-4 h-3 w-full rounded-full bg-white/70 border border-violet-200 overflow-hidden shadow-inner">
                <div className="h-full rounded-full bg-linear-to-r from-violet-500 via-pink-500 to-rose-500 transition-all duration-700 shadow-lg" style={{ width: `${topicTaskPercent}%` }} />
              </div>
              <p className="mt-3 text-sm font-bold text-violet-700">Topic progress: <span className="text-lg">{topicTaskPercent}%</span></p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currentTopic.miniTasks.map((task, index) => {
                const isDone = completedSet.has(index);
                const isLocked = index > unlockedIndex;

                return (
                  <div
                    key={task}
                    className={`p-8 border rounded-3xl relative overflow-hidden group h-full transition-all ${
                      isDone
                        ? "bg-linear-to-br from-emerald-50 to-emerald-100/30 border-emerald-200/60 shadow-[0_10px_28px_rgba(16,185,129,0.15)] hover:shadow-[0_16px_38px_rgba(16,185,129,0.2)]"
                        : isLocked
                          ? "bg-slate-50 border-slate-200 opacity-70"
                          : "bg-white/90 backdrop-blur-sm border-slate-200 hover:border-violet-300 hover:shadow-[0_16px_38px_rgba(124,58,237,0.12)] hover:scale-[1.02]"
                    }`}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <span className="text-7xl font-black italic">{String(index + 1).padStart(2, "0")}</span>
                    </div>

                    <span className={`text-xs font-black uppercase tracking-widest ${
                      isDone ? "text-emerald-600" : isLocked ? "text-slate-400" : "text-violet-600"
                    }`}>Challenge {index + 1}</span>
                    <h4 className="text-2xl font-bold mt-3 mb-2">Task {index + 1}</h4>
                    <p className="text-slate-700 text-sm mb-6 leading-relaxed">{task}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                        isDone ? "bg-emerald-100 text-emerald-700" : isLocked ? "bg-slate-100 text-slate-400" : "bg-violet-100 text-violet-700"
                      }`}>
                        {isDone ? "✓ Completed" : isLocked ? "🔒 Locked" : "→ Ready"}
                      </div>
                      {isDone && (
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100/50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Done
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => openTaskWorkspace(index)}
                      disabled={isLocked}
                      className={`mt-4 w-full py-3 border-2 rounded-2xl font-bold transition-all ${
                        isDone
                          ? "bg-emerald-100 border-emerald-400 text-emerald-700 hover:bg-emerald-200"
                          : isLocked
                            ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                            : "bg-linear-to-r from-violet-100 to-pink-100 border-violet-300 text-violet-700 hover:from-violet-200 hover:to-pink-200"
                      }`}
                    >
                      {isLocked ? "Complete Previous" : activeTaskIndex === index ? "✓ Workspace Open" : "→ Open Workspace"}
                    </button>
                  </div>
                );
              })}
            </div>

            {activeTaskIndex !== null && (
              <div ref={workspaceRef} className="rounded-4xl border border-slate-200/60 bg-white/95 backdrop-blur-sm p-6 md:p-8 space-y-5 shadow-lg">
                <div className="border-b border-slate-200 pb-6">
                  <p className="text-xs uppercase tracking-widest text-violet-700 font-black">✎ Task Workspace</p>
                  <h4 className="text-3xl font-black mt-3 bg-clip-text text-transparent bg-linear-to-r from-violet-600 to-pink-600">Task {activeTaskIndex + 1}</h4>
                  <p className="text-slate-700 mt-3 text-base leading-relaxed font-medium">{currentTopic.miniTasks[activeTaskIndex]}</p>
                </div>

                <textarea
                  value={taskDrafts[activeTaskIndex] ?? ""}
                  onChange={(e) => updateTaskDraft(activeTaskIndex, e.target.value)}
                  className="w-full min-h-65 rounded-2xl bg-slate-50 border border-slate-200/80 p-5 text-sm font-mono outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all"
                  spellCheck={false}
                />

                <div className="flex items-center gap-3 bg-violet-50 p-4 rounded-2xl border border-violet-200">
                  <button
                    type="button"
                    onClick={evaluateActiveTask}
                    disabled={taskCheckLoading}
                    className="px-6 py-2.5 rounded-xl bg-linear-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white font-bold disabled:opacity-50 shadow-md transition-all"
                  >
                    {taskCheckLoading ? "Checking..." : "✨ Check with AI"}
                  </button>
                  <p className="text-xs text-slate-600 font-semibold">Pass this task to unlock the next one.</p>
                </div>

                {taskFeedback[activeTaskIndex] && (
                  <div className={`rounded-3xl border p-6 shadow-md animate-in zoom-in-95 ${
                    taskFeedback[activeTaskIndex].passed 
                      ? "border-emerald-300 bg-linear-to-r from-emerald-50 to-emerald-100/50" 
                      : "border-red-300 bg-linear-to-r from-red-50 to-red-100/50"
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-bold text-lg">
                        {taskFeedback[activeTaskIndex].passed ? "✓ Passed!" : "⚠ Needs Improvement"}
                      </p>
                      <span className={`text-2xl font-black px-4 py-2 rounded-xl ${
                        taskFeedback[activeTaskIndex].passed 
                          ? "bg-emerald-200 text-emerald-800" 
                          : "bg-red-200 text-red-800"
                      }`}>
                        {taskFeedback[activeTaskIndex].score}/100
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed font-medium">{taskFeedback[activeTaskIndex].feedback}</p>
                    {taskFeedback[activeTaskIndex].missing.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-600 mb-2">Missing Points:</p>
                        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                          {taskFeedback[activeTaskIndex].missing.map((item) => (
                            <li key={item} className="font-medium">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {WEB_PREVIEW_TOPICS.has(currentTopic.id) ? (
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-widest text-violet-700 font-black">👀 Live Preview</p>
                    <iframe
                      title="task-preview"
                      className="w-full h-80 rounded-2xl border border-slate-200/80 bg-white shadow-md"
                      srcDoc={buildPreviewDoc(currentTopic.id, taskDrafts[activeTaskIndex] ?? "")}
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200/80 bg-linear-to-r from-slate-50 to-blue-50/30 p-5 text-sm text-slate-700 shadow-sm">
                    <p className="font-semibold mb-2">💡 Preview Not Available</p>
                    <p>Live UI preview is available for HTML, CSS, and JavaScript tasks. For this topic, write code here and run/test it in your local IDE.</p>
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