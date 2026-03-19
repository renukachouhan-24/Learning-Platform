"use client";
import { coursesData } from "@/lib/coursesData";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image"; 
import { BookOpenText, Brain, Code2, Rocket, Sparkles, type LucideIcon } from "lucide-react";

const paths = [
  {
    id: "full-stack",
    title: "Full Stack Developer",
    description: "Master web development from HTML to databases. Build complete web applications from scratch.",
    icon: Rocket,
    topics: "7 topics",
    color: "from-orange-500 to-red-600",
  },
  {
    id: "ai-dev",
    title: "AI Developer",
    description: "Dive into artificial intelligence and machine learning. Build intelligent systems from scratch.",
    icon: Brain,
    topics: "6 topics",
    color: "from-pink-500 to-purple-600",
  },
] as const satisfies Array<{
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  topics: string;
  color: string;
}>;

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [completedTaskCounts, setCompletedTaskCounts] = useState<Record<string, number>>({});
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const allTopics = useMemo(() => Object.values(coursesData).flatMap((course) => course.topics), []);
  const totalTopics = allTopics.length;
  const totalQuizQuestions = totalTopics * 10;
  const totalTasks = allTopics.reduce((sum, topic) => sum + topic.miniTasks.length, 0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/");
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadProgress = async () => {
      const topicProgressMap = new Map<string, Set<number>>();

      for (const topic of allTopics) {
        const saved = window.localStorage.getItem(`mini-tasks:${topic.id}`);
        const parsed: unknown = saved ? JSON.parse(saved) : [];
        const localCompleted = Array.isArray(parsed)
          ? parsed.filter((item): item is number => typeof item === "number")
          : [];
        topicProgressMap.set(topic.id, new Set(localCompleted));
      }

      // Show local progress immediately for fast UI.
      const localCounts: Record<string, number> = {};
      for (const topic of allTopics) {
        localCounts[topic.id] = topicProgressMap.get(topic.id)?.size ?? 0;
      }
      setCompletedTaskCounts(localCounts);

      // Then enhance with cloud data (if logged in).
      if (!user) return;

      try {
        const snapshot = await getDocs(collection(db, "users", user.uid, "progress"));
        snapshot.forEach((docSnap) => {
          const topicId = docSnap.id;
          const firestoreData = docSnap.data();
          const firestoreCompleted = Array.isArray(firestoreData.completedTasks)
            ? firestoreData.completedTasks.filter((item: unknown): item is number => typeof item === "number")
            : [];

          const existing = topicProgressMap.get(topicId) ?? new Set<number>();
          firestoreCompleted.forEach((idx) => existing.add(idx));
          topicProgressMap.set(topicId, existing);
        });
      } catch {
        // Firestore offline/temporary errors ke case me local progress already loaded hai.
      }

      const nextCounts: Record<string, number> = {};
      for (const topic of allTopics) {
        nextCounts[topic.id] = topicProgressMap.get(topic.id)?.size ?? 0;
      }
      setCompletedTaskCounts(nextCounts);
    };

    loadProgress();
    window.addEventListener("focus", loadProgress);
    return () => window.removeEventListener("focus", loadProgress);
  }, [allTopics, user]);

  const totalCompletedTasks = allTopics.reduce((sum, topic) => sum + (completedTaskCounts[topic.id] ?? 0), 0);
  const journeyPercent = totalTasks > 0 ? Math.round((totalCompletedTasks / totalTasks) * 100) : 0;
  const learnerLevel =
    journeyPercent >= 85 ? "Advanced" : journeyPercent >= 55 ? "Intermediate" : journeyPercent >= 25 ? "Beginner+" : "Starter";

  const pathProgressById = Object.entries(coursesData).reduce<Record<string, { percent: number; completed: number; total: number; topics: number }>>(
    (acc, [pathId, course]) => {
      const pathTotalTasks = course.topics.reduce((sum, topic) => sum + topic.miniTasks.length, 0);
      const pathCompletedTasks = course.topics.reduce((sum, topic) => sum + (completedTaskCounts[topic.id] ?? 0), 0);
      const pathPercent = pathTotalTasks > 0 ? Math.round((pathCompletedTasks / pathTotalTasks) * 100) : 0;

      acc[pathId] = {
        percent: pathPercent,
        completed: pathCompletedTasks,
        total: pathTotalTasks,
        topics: course.topics.length,
      };
      return acc;
    },
    {}
  );

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await signOut(auth);
      router.replace("/");
    } finally {
      setLoggingOut(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#f4f3f9] text-slate-600 font-sans">
        Loading...
      </div>
    );
  }

  return (
    <div className="app-surface min-h-screen bg-[#f4f3f9] text-slate-900 selection:bg-purple-100 font-sans relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-violet-200/50 blur-3xl" />
      <div className="pointer-events-none absolute top-20 -right-20 w-96 h-96 rounded-full bg-pink-200/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 w-md h-112 rounded-full bg-cyan-100/50 blur-3xl" />

      <nav className="sticky top-0 z-40 border-b border-purple-100/70 bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 font-extrabold text-violet-500 text-xl">
            <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center text-sm text-white">✦</div>
            DevLearn AI
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-700">Hi, {user.displayName?.split(" ")[0] ?? "Learner"}</p>
              <p className="text-xs text-slate-500">Ready to continue?</p>
            </div>

            <div className="relative w-10 h-10 bg-violet-100 rounded-full border border-violet-200 overflow-hidden">
              {user.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt="profile"
                  fill
                  className="object-cover"
                />
              ) : "👤"}
            </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="px-4 py-2 text-sm rounded-xl border border-violet-200 bg-white text-violet-600 hover:bg-violet-50 transition disabled:opacity-60 disabled:cursor-not-allowed font-semibold"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-14 pb-20 space-y-10">
        <div className="rounded-4xl border border-violet-100 bg-white/80 backdrop-blur p-8 md:p-12 shadow-[0_25px_80px_rgba(124,58,237,0.12)]">
          <div className="text-center">

            <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">
              Welcome back,
              <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-500 to-pink-400"> {user.displayName?.split(" ")[0] ?? "Developer"}</span>
            </h1>

            <p className="mt-5 text-lg text-slate-500 max-w-2xl mx-auto">
              Pick your learning track, continue your progress, and unlock skills with videos, quizzes, and mini coding tasks.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => router.push("/path/full-stack")}
                className="px-5 py-2.5 rounded-xl bg-linear-to-r from-violet-500 to-pink-400 text-white font-semibold shadow hover:opacity-95 transition"
              >
                Continue Learning
              </button>
              <button
                onClick={() => router.push("/path/ai-dev")}
                className="px-5 py-2.5 rounded-xl border border-violet-200 bg-white text-violet-600 font-semibold hover:bg-violet-50 transition"
              >
                Explore AI Path
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
            {[
              { value: `${totalTopics}`, label: "Topics", icon: BookOpenText },
              { value: `${totalQuizQuestions}`, label: "Quiz Questions", icon: Brain },
              { value: `${totalCompletedTasks}/${totalTasks}`, label: "Coding Tasks", icon: Code2 },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
              <div
                key={item.label}
                className={`rounded-2xl border border-violet-100 bg-white p-5 text-center shadow-[0_8px_28px_rgba(124,58,237,0.10)] hover:shadow-[0_16px_40px_rgba(124,58,237,0.16)] hover:-translate-y-0.5 transition-all duration-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${80 + index * 70}ms` }}
              >
                <div className="mb-2 inline-flex rounded-xl bg-violet-50 p-2 text-violet-500">
                  <Icon className="h-5 w-5" strokeWidth={2.3} />
                </div>
                <p className="text-3xl font-black text-slate-900">{item.value}</p>
                <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">{item.label}</p>
              </div>
            )})}
          </div>

          <div className="mt-6 rounded-3xl border border-violet-100 bg-linear-to-r from-violet-50 to-pink-50 p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-violet-500 font-bold">Your Momentum</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1 inline-flex items-center gap-2">
                You are on the right track <Sparkles className="h-5 w-5 text-violet-500" />
              </h3>
              <p className="text-sm text-slate-500 mt-1">Complete one quiz + one task daily for fastest growth.</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-white border border-violet-100 px-4 py-3">
                <p className="text-xl font-black text-slate-900">{totalCompletedTasks}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Completed</p>
              </div>
              <div className="rounded-2xl bg-white border border-violet-100 px-4 py-3">
                <p className="text-xl font-black text-slate-900">{learnerLevel}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Level</p>
              </div>
              <div className="rounded-2xl bg-white border border-violet-100 px-4 py-3">
                <p className="text-xl font-black text-slate-900">{journeyPercent}%</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Journey</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">Choose Your Learning Path</h2>
          <span className="text-sm text-slate-500 hidden sm:block">Start from where you feel strongest</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {paths.map((path, index) => {
            const PathIcon = path.icon;
            return (
            <div
              key={path.id}
              onClick={() => router.push(`/path/${path.id}`)}
              className={`group cursor-pointer relative bg-white p-8 rounded-4xl border border-slate-200 hover:border-violet-300 transition-all duration-300 hover:shadow-[0_24px_60px_rgba(124,58,237,0.18)] overflow-hidden hover:-translate-y-1 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: `${140 + index * 80}ms` }}
            >
              <div className={`h-1 w-full rounded-full bg-linear-to-r ${path.color} mb-6`} />

              <div className={`w-14 h-14 bg-linear-to-br ${path.color} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-105 transition-transform duration-300 shadow-md`}>
                <PathIcon className="h-7 w-7 text-white" strokeWidth={2.3} />
              </div>

              <h3 className="text-3xl font-black text-slate-900 mb-3">{path.title}</h3>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                {path.description}
              </p>

              <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                <span>{pathProgressById[path.id]?.topics ?? 0} topics</span>
                <span className="font-semibold text-slate-700">{pathProgressById[path.id]?.completed ?? 0}/{pathProgressById[path.id]?.total ?? 0} tasks</span>
              </div>

              <div className="mb-5 h-2 w-full rounded-full bg-violet-100 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-linear-to-r ${path.color}`}
                  style={{ width: `${pathProgressById[path.id]?.percent ?? 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs text-slate-500 font-medium bg-violet-50 px-3 py-1 rounded-full border border-violet-100">
                  {pathProgressById[path.id]?.percent ?? 0}% complete
                </span>
                <span className="flex items-center gap-2 text-sm font-bold text-violet-500 group-hover:gap-3 transition-all">
                    Start Learning <span>→</span>
                </span>
              </div>

              <div className="absolute -top-14 -right-14 w-40 h-40 rounded-full bg-linear-to-br from-violet-100 to-pink-100 opacity-0 group-hover:opacity-70 blur-2xl transition-opacity" />
              <div className="absolute inset-0 bg-linear-to-br from-violet-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-4xl pointer-events-none" />
            </div>
          )})}
        </div>
      </main>

    </div>
  );
}