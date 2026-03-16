"use client";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image"; // Image इम्पोर्ट किया

const paths = [
  {
    id: "full-stack",
    title: "Full Stack Developer",
    description: "Master web development from HTML to databases. Build complete web applications from scratch.",
    icon: "🚀",
    topics: "7 topics",
    color: "from-orange-500 to-red-600",
  },
  {
    id: "ai-dev",
    title: "AI Developer",
    description: "Dive into artificial intelligence and machine learning. Build intelligent systems from scratch.",
    icon: "🧠",
    topics: "6 topics",
    color: "from-pink-500 to-purple-600",
  },
];

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

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
    <div className="min-h-screen bg-[#f4f3f9] text-slate-900 selection:bg-purple-100 font-sans relative overflow-hidden">
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
              { value: "13+", label: "Topics", icon: "📚" },
              { value: "130+", label: "Quiz Questions", icon: "🧠" },
              { value: "20+", label: "Coding Tasks", icon: "💻" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-violet-100 bg-white p-5 text-center shadow-sm hover:shadow-md transition-all">
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="text-3xl font-black text-slate-900">{item.value}</p>
                <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">{item.label}</p>
              </div>
            ))}
          </div>

          {/* <div className="mt-6 rounded-3xl border border-violet-100 bg-linear-to-r from-violet-50 to-pink-50 p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-violet-500 font-bold">Your Momentum</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">You are on the right track 🚀</h3>
              <p className="text-sm text-slate-500 mt-1">Complete one quiz + one task daily for fastest growth.</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-white border border-violet-100 px-4 py-3">
                <p className="text-xl font-black text-slate-900">7</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Streak</p>
              </div>
              <div className="rounded-2xl bg-white border border-violet-100 px-4 py-3">
                <p className="text-xl font-black text-slate-900">B1</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Level</p>
              </div>
              <div className="rounded-2xl bg-white border border-violet-100 px-4 py-3">
                <p className="text-xl font-black text-slate-900">42%</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Journey</p>
              </div>
            </div>
          </div> */}
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">Choose Your Learning Path</h2>
          <span className="text-sm text-slate-500 hidden sm:block">Start from where you feel strongest</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {paths.map((path) => (
            <div
              key={path.id}
              onClick={() => router.push(`/path/${path.id}`)}
              className="group cursor-pointer relative bg-white p-8 rounded-4xl border border-slate-200 hover:border-violet-300 transition-all duration-300 hover:shadow-[0_24px_60px_rgba(124,58,237,0.18)] overflow-hidden hover:-translate-y-1"
            >
              <div className={`h-1 w-full rounded-full bg-linear-to-r ${path.color} mb-6`} />

              <div className={`w-14 h-14 bg-linear-to-br ${path.color} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-105 transition-transform duration-300 shadow-md`}>
                {path.icon}
              </div>

              <h3 className="text-3xl font-black text-slate-900 mb-3">{path.title}</h3>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                {path.description}
              </p>

              <div className="mb-5 h-2 w-full rounded-full bg-violet-100 overflow-hidden">
                <div className={`h-full rounded-full bg-linear-to-r ${path.color} ${path.id === "full-stack" ? "w-2/5" : "w-1/3"}`} />
              </div>

              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs text-slate-500 font-medium bg-violet-50 px-3 py-1 rounded-full border border-violet-100">{path.topics}</span>
                <span className="flex items-center gap-2 text-sm font-bold text-violet-500 group-hover:gap-3 transition-all">
                    Start Learning <span>→</span>
                </span>
              </div>

              <div className="absolute -top-14 -right-14 w-40 h-40 rounded-full bg-linear-to-br from-violet-100 to-pink-100 opacity-0 group-hover:opacity-70 blur-2xl transition-opacity" />
              <div className="absolute inset-0 bg-linear-to-br from-violet-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-4xl pointer-events-none" />
            </div>
          ))}
        </div>
      </main>

      {/* <footer className="py-10 text-center text-slate-500 border-t border-violet-100">
        <div className="font-extrabold text-violet-500">✦ DevLearn AI</div>
        <p className="text-sm mt-2">AI Powered Developer Learning Platform</p>
      </footer> */}
    </div>
  );
}