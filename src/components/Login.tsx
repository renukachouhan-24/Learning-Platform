"use client";
import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"; 
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, BarChart3, BookOpen, Brain, CheckCircle2, Code2, Flame, Rocket, Sparkles, Trophy, Zap, type LucideIcon } from "lucide-react";

function isIgnorableLoginError(error: unknown) {
  const code = (error as { code?: string })?.code ?? "";
  const message = (error as { message?: string })?.message?.toLowerCase() ?? "";

  const popupCancelled = code === "auth/cancelled-popup-request" || code === "auth/popup-closed-by-user";
  const offlineOrTransient =
    code === "auth/network-request-failed" ||
    code === "firestore/unavailable" ||
    message.includes("client is offline") ||
    message.includes("network") ||
    message.includes("unavailable");

  return popupCancelled || offlineOrTransient;
}

export default function Login() {
  const [signingIn, setSigningIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const heroTiles: { label: string; icon: LucideIcon }[] = [
    { label: "Full Stack", icon: Code2 },
    { label: "AI / ML", icon: Brain },
    { label: "Quizzes", icon: Zap },
    { label: "Progress", icon: Trophy },
  ];

  const howItWorks: { title: string; desc: string; icon: LucideIcon }[] = [
    { title: "Structured Learning Paths", desc: "Follow curated video tutorials in Hindi & English", icon: BookOpen },
    { title: "AI Generated Quizzes", desc: "Test your knowledge with AI-powered quiz questions", icon: Brain },
    { title: "Coding Practice Tasks", desc: "Hands-on coding challenges to build real skills", icon: Code2 },
    { title: "Progress Tracking", desc: "Track your learning journey and unlock new topics", icon: BarChart3 },
  ];

  const stats = [
    { value: "13+", label: "Topics", icon: BookOpen },
    { value: "130+", label: "Quiz Questions", icon: Brain },
    { value: "39", label: "Coding Tasks", icon: Code2 },
    { value: "2", label: "Learning Paths", icon: Flame },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        router.replace("/dashboard");
        return;
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async () => {
    if (signingIn) return;
    setSigningIn(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;

      const userRef = doc(db, "users", loggedInUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: loggedInUser.uid,
          name: loggedInUser.displayName,
          email: loggedInUser.email,
          photoURL: loggedInUser.photoURL,
          isNewUser: true,
          progress: {
            fullStack: [], 
            aiDev: []
          },
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        });
      } else {
        await setDoc(userRef, {
          isNewUser: false,
          lastLoginAt: serverTimestamp()
        }, { merge: true });
      }

      router.replace("/dashboard");

    } catch (error: unknown) {
      if (!isIgnorableLoginError(error)) {
        console.error("Login Error:", error);
      }
    } finally {
      setSigningIn(false);
    }
  };

  const scrollToSection = () => {
    if (typeof window === "undefined") return;
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#f4f3f9] text-slate-700 flex items-center justify-center">
        <div className="text-sm tracking-wide text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="app-surface min-h-screen bg-[#f4f3f9] text-slate-900 selection:bg-purple-100 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-violet-200/50 blur-3xl" />
      <div className="pointer-events-none absolute top-14 -right-24 w-96 h-96 rounded-full bg-pink-200/45 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-112 w-md rounded-full bg-cyan-100/50 blur-3xl" />

      <nav className="sticky top-0 z-50 border-b border-purple-100/60 bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-extrabold text-violet-500">
            <span className="h-8 w-8 rounded-xl bg-violet-500 text-white grid place-items-center">✦</span>
            <span>DevLearn AI</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-slate-500 font-medium">
            <button onClick={scrollToSection} className="hover:text-violet-500 transition">Features</button>
            <button onClick={scrollToSection} className="hover:text-violet-500 transition">How It Works</button>
          </div>

          <button
            onClick={handleLogin}
            disabled={signingIn}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-violet-500 to-pink-400 shadow-md hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <ArrowUpRight className="h-4 w-4" />
            {signingIn ? "Signing in..." : "Sign in with Google"}
          </button>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-14 pb-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/85 px-3 py-1.5 text-xs font-semibold text-violet-600 shadow-sm">
            <CheckCircle2 className="h-3.5 w-3.5" />
            AI guided learning with real progress tracking
          </div>

          <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight text-slate-900">
            AI Powered <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-500 to-pink-400">Developer</span>
            <br /> Learning Platform
          </h1>

          <p className="mt-6 text-lg text-slate-500 max-w-xl leading-relaxed">
            Learn Full Stack and AI with videos, quizzes, and coding tasks. Master development with structured paths and AI-generated challenges.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={handleLogin}
              disabled={signingIn}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-violet-500 to-pink-400 text-white font-semibold shadow-[0_12px_30px_rgba(139,92,246,0.35)] hover:opacity-95 active:scale-95 transition-all disabled:opacity-60"
            >
              <Rocket className="h-4 w-4" />
              {signingIn ? "Signing in..." : "Start Learning"}
            </button>
            <button
              onClick={scrollToSection}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-violet-200 text-violet-500 font-semibold hover:bg-violet-50 active:scale-95 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              Explore Features
            </button>
          </div>
        </div>

        <div className={`relative flex items-center justify-center h-125 transition-all duration-700 delay-150 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="absolute w-100 h-100 rounded-full bg-radial-[at_50%_50%] from-violet-200/70 to-transparent" />
          <div className="relative z-10 grid grid-cols-2 gap-4">
            {heroTiles.map((item, index) => {
              const Icon = item.icon;
              return (
              <div
                key={item.label}
                className="h-34 w-34 bg-white rounded-3xl border border-violet-100/80 shadow-[0_10px_30px_rgba(124,58,237,0.10)] hover:shadow-[0_18px_45px_rgba(124,58,237,0.16)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center gap-3 text-slate-600"
                style={{ transitionDelay: `${index * 60}ms` }}
              >
                <Icon className="h-6 w-6 text-violet-500" strokeWidth={2.2} />
                <span className="text-xs font-semibold">{item.label}</span>
              </div>
            )})}
          </div>
        </div>
      </main>

      <section className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
            <div
              key={stat.label}
              className={`rounded-2xl border border-violet-100 bg-white/80 px-4 py-5 shadow-sm hover:shadow-md transition-all duration-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: `${index * 60}ms` }}
            >
              <div className="mx-auto mb-2 inline-flex rounded-xl bg-violet-50 p-2 text-violet-500">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-4xl font-black text-slate-900">{stat.value}</p>
              <p className="text-xs tracking-wide text-slate-500 mt-1">{stat.label}</p>
            </div>
          )})}
        </div>
      </section>

      <section id="how-it-works" className="relative z-10 bg-[#eeedf5]/85 backdrop-blur py-20 mt-6 border-y border-violet-100/70">
        <div className="max-w-6xl mx-auto px-6">
          <div className={`text-center mb-12 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <h2 className="text-5xl font-black text-slate-900">How It Works</h2>
            <p className="mt-3 text-slate-500">Everything you need to become a developer, all in one place</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {howItWorks.map((item, index) => {
              const Icon = item.icon;
              return (
              <div
                key={item.title}
                className={`bg-white rounded-3xl border border-violet-100/80 p-7 text-center shadow-[0_10px_30px_rgba(124,58,237,0.10)] hover:shadow-[0_18px_45px_rgba(124,58,237,0.16)] hover:-translate-y-1 transition-all duration-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <div className="mx-auto mb-4 w-11 h-11 rounded-2xl bg-violet-50 text-violet-500 grid place-items-center">
                  <Icon className="h-5 w-5" strokeWidth={2.3} />
                </div>
                <h3 className="font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{item.desc}</p>
              </div>
            )})}
          </div>
        </div>
      </section>
    </div>
  );
}