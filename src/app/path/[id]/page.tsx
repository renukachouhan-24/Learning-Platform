"use client";
import { useParams, useRouter } from "next/navigation";
import { coursesData, Topic } from "@/lib/coursesData";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { BookOpenText, Brain, CheckCircle2, Flame, Lock, Rocket, Sparkles, Target } from "lucide-react";

export default function PathPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [completedTaskCounts, setCompletedTaskCounts] = useState<Record<string, number>>({});
  
  const course = coursesData[id as string];
  const isFullStack = id === "full-stack";
  const accent = isFullStack ? "from-violet-500 to-fuchsia-500" : "from-pink-500 to-rose-500";
  const getScopedTaskKey = (topicId: string, uid: string) => `mini-tasks:${uid}:${topicId}`;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!course || typeof window === "undefined" || !user) return;

    const loadPathProgress = async () => {
      const topicProgressMap = new Map<string, Set<number>>();

      for (const topic of course.topics) {
        const scopedKey = getScopedTaskKey(topic.id, user.uid);
        const scopedSaved = window.localStorage.getItem(scopedKey);
        const legacySaved = window.localStorage.getItem(`mini-tasks:${topic.id}`);
        const saved = scopedSaved ?? legacySaved;
        const parsed: unknown = saved ? JSON.parse(saved) : [];
        const localCompleted = Array.isArray(parsed)
          ? parsed.filter((item): item is number => typeof item === "number")
          : [];
        if (!scopedSaved && localCompleted.length > 0) {
          window.localStorage.setItem(scopedKey, JSON.stringify(localCompleted));
        }
        topicProgressMap.set(topic.id, new Set(localCompleted));
      }

      try {
        const snapshot = await getDocs(collection(db, "users", user.uid, "progress"));
        snapshot.forEach((docSnap) => {
          const topicId = docSnap.id;
          const data = docSnap.data();
          const firestoreCompleted = Array.isArray(data.completedTasks)
            ? data.completedTasks.filter((item: unknown): item is number => typeof item === "number")
            : [];

          const existing = topicProgressMap.get(topicId) ?? new Set<number>();
          firestoreCompleted.forEach((idx) => existing.add(idx));
          topicProgressMap.set(topicId, existing);
        });
      } catch {
        // Offline/error case: localStorage progress still works.
      }

      const nextCounts: Record<string, number> = {};
      for (const topic of course.topics) {
        nextCounts[topic.id] = topicProgressMap.get(topic.id)?.size ?? 0;
      }
      setCompletedTaskCounts(nextCounts);
    };

    loadPathProgress();
    window.addEventListener("focus", loadPathProgress);
    return () => window.removeEventListener("focus", loadPathProgress);
  }, [course, user]);

  if (!course) return (
    <div className="min-h-screen bg-[#f4f3f9] flex items-center justify-center text-slate-700">
      Course Not Found!
    </div>
  );

  const totalTasksInPath = course.topics.reduce((sum, topic) => sum + topic.miniTasks.length, 0);
  const completedTasksInPath = course.topics.reduce((sum, topic) => sum + (completedTaskCounts[topic.id] ?? 0), 0);
  const completedTopicsCount = course.topics.filter(
    (topic) => (completedTaskCounts[topic.id] ?? 0) >= topic.miniTasks.length
  ).length;
  const progressPercent = totalTasksInPath > 0 ? Math.round((completedTasksInPath / totalTasksInPath) * 100) : 0;
  const learnerLevel =
    progressPercent >= 85 ? "Advanced" : progressPercent >= 55 ? "Intermediate" : progressPercent >= 25 ? "Beginner+" : "Starter";
  const topicCompletionById = Object.fromEntries(
    course.topics.map((topic) => [topic.id, (completedTaskCounts[topic.id] ?? 0) >= topic.miniTasks.length])
  ) as Record<string, boolean>;

  let unlockedTopicIndex = 0;
  while (unlockedTopicIndex < course.topics.length && topicCompletionById[course.topics[unlockedTopicIndex].id]) {
    unlockedTopicIndex += 1;
  }

  const nextTopic = course.topics[unlockedTopicIndex];

  return (
    <div className="app-surface min-h-screen bg-[#f4f3f9] text-slate-900 font-sans selection:bg-purple-100 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-16 -left-20 w-80 h-80 rounded-full bg-violet-200/50 blur-3xl" />
      <div className="pointer-events-none absolute top-28 -right-20 w-96 h-96 rounded-full bg-pink-200/45 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-112 w-md rounded-full bg-cyan-100/55 blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-20">
        <button 
          onClick={() => router.push("/dashboard")}
          className="text-slate-500 hover:text-violet-500 mb-8 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-4 py-2 text-sm font-semibold shadow-sm transition-all hover:shadow"
        >
          ← Back to Paths
        </button>

        <div className="rounded-4xl border border-violet-100 bg-white/85 backdrop-blur p-7 md:p-9 shadow-[0_24px_70px_rgba(124,58,237,0.15)] mb-10 transition-all duration-700 opacity-100 translate-y-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className={`relative w-20 h-20 bg-linear-to-br ${accent} rounded-3xl flex items-center justify-center text-4xl shadow-lg`}>
                {isFullStack ? <Rocket className="h-9 w-9 text-white" strokeWidth={2.3} /> : <Brain className="h-9 w-9 text-white" strokeWidth={2.3} />}
                <div className="absolute -inset-1 rounded-[1.7rem] border border-white/40" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-[10px] uppercase tracking-widest font-black text-violet-500 mb-3">
                  <Sparkles className="h-3.5 w-3.5" /> Learning Track
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 text-slate-900">{course.title}</h1>
                <p className="text-slate-500">{completedTopicsCount}/{course.topics.length} topics completed</p>
              </div>
            </div>

            <div className="md:text-right">
              <p className="text-sm text-slate-500 mb-2">Progress</p>
              <div className="w-56 h-3 rounded-full bg-violet-100 overflow-hidden ml-auto">
                <div
                  className={`h-full bg-linear-to-r ${accent} transition-all duration-700`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {completedTasksInPath}/{totalTasksInPath} tasks done · {progressPercent}% complete
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-7">
            {[
              { label: "Topics", value: String(course.topics.length), icon: BookOpenText },
              { label: "Quizzes", value: `${course.topics.length * 10}+`, icon: Brain },
              { label: "Tasks", value: `${totalTasksInPath}`, icon: Target },
              { label: "Level", value: learnerLevel, icon: Flame },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
              <div
                key={item.label}
                className="rounded-2xl border border-violet-100 bg-white px-4 py-3 text-center shadow-sm hover:shadow-md transition-all duration-300 opacity-100 translate-y-0"
                style={{ transitionDelay: `${90 + index * 70}ms` }}
              >
                <div className="mx-auto mb-1 inline-flex rounded-lg bg-violet-50 p-1.5 text-violet-500">
                  <Icon className="h-3.5 w-3.5" strokeWidth={2.3} />
                </div>
                <p className="text-xl font-black text-slate-900">{item.value}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">{item.label}</p>
              </div>
            )})}
          </div>

          <div className="mt-5 rounded-2xl border border-violet-100 bg-linear-to-r from-violet-50/70 to-pink-50/70 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-slate-700">
              {nextTopic ? (
                <>
                  <span className="font-bold text-violet-600">Next unlock:</span> {nextTopic.title}
                </>
              ) : (
                <span className="font-bold text-emerald-600">Amazing! You completed the full path 🎉</span>
              )}
            </p>
            <span className="text-xs px-3 py-1 rounded-full bg-white border border-violet-100 text-slate-600 font-semibold">
              Sequential mode enabled
            </span>
          </div>
        </div>

        <div className="space-y-4 pb-20">
          {course.topics.map((topic: Topic, index: number) => {
            const isCompleted = topicCompletionById[topic.id];
            const isUnlocked = index <= unlockedTopicIndex;
            const isLocked = !isUnlocked;
            const topicTasksCompleted = completedTaskCounts[topic.id] ?? 0;
            const topicTaskTotal = topic.miniTasks.length;
            const topicPercent = topicTaskTotal > 0 ? Math.round((topicTasksCompleted / topicTaskTotal) * 100) : 0;

            return (
              <div 
                key={topic.id}
                onClick={() => {
                  if (isUnlocked) {
                    router.push(`/topic/${topic.id}`);
                  }
                }}
                className={`group relative flex items-center p-6 rounded-4xl border transition-all duration-300 bg-white overflow-hidden ${
                  isLocked
                    ? "border-slate-200/80 opacity-70 cursor-not-allowed"
                    : "border-slate-200 hover:border-violet-300 cursor-pointer hover:shadow-[0_18px_40px_rgba(124,58,237,0.12)] hover:-translate-y-0.5"
                } opacity-100 translate-y-0`}
                style={{ transitionDelay: `${150 + index * 70}ms` }}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-6 transition-colors font-black ${
                  isLocked
                    ? "bg-slate-100 text-slate-400"
                    : "bg-violet-50 text-violet-600 group-hover:bg-violet-500 group-hover:text-white"
                }`}>
                  {index + 1}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-slate-900">{topic.title}</h3>
                    <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-violet-50 text-violet-500 border border-violet-100 font-bold">Topic</span>
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full border font-bold ${
                      isCompleted
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                        : isLocked
                          ? "bg-slate-100 text-slate-500 border-slate-200"
                          : "bg-amber-50 text-amber-600 border-amber-200"
                    }`}>
                      {isCompleted ? "Completed" : isLocked ? "Locked" : "Unlocked"}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">{topic.description}</p>

                  {isLocked && (
                    <p className="mt-2 text-xs text-slate-500">Complete previous topic to unlock this one.</p>
                  )}

                  <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isCompleted ? "bg-linear-to-r from-emerald-400 to-emerald-500" : `bg-linear-to-r ${accent}`
                      }`}
                      style={{ width: `${topicPercent}%` }}
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mt-3">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">10 Quiz Questions</span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{topicTasksCompleted}/{topicTaskTotal} Coding Tasks</span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">~45 Min</span>
                  </div>
                </div>

                {isUnlocked ? (
                  <div className="flex items-center gap-2 text-sm font-bold text-violet-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                      Start <span className="text-xl">→</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                    <Lock className="h-4 w-4" /> Locked
                  </div>
                )}

                {isCompleted && (
                  <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Done
                  </div>
                )}

                {!isLocked && (
                  <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full bg-linear-to-br ${accent} opacity-0 group-hover:opacity-15 blur-2xl transition-opacity`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}