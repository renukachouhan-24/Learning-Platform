"use client";
import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"; 
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [signingIn, setSigningIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

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
          progress: {
            fullStack: [], // टॉपिक्स की खाली लिस्ट
            aiDev: []
          },
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        });
      } else {
        await setDoc(userRef, {
          lastLoginAt: serverTimestamp()
        }, { merge: true });
      }

      router.replace("/dashboard");

    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      if (code !== "auth/cancelled-popup-request" && code !== "auth/popup-closed-by-user") {
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
    <div className="min-h-screen bg-[#f4f3f9] text-slate-900 selection:bg-purple-100">
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
            <span>↗</span>
            {signingIn ? "Signing in..." : "Sign in with Google"}
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-14 pb-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>

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
              className="px-6 py-3 rounded-xl bg-linear-to-r from-violet-500 to-pink-400 text-white font-semibold shadow hover:opacity-95 disabled:opacity-60"
            >
              {signingIn ? "Signing in..." : "Start Learning"}
            </button>
            <button
              onClick={scrollToSection}
              className="px-6 py-3 rounded-xl border border-violet-200 text-violet-500 font-semibold hover:bg-violet-50"
            >
              Explore Features
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center h-125">
          <div className="absolute w-100 h-100 rounded-full bg-radial-[at_50%_50%] from-violet-200/70 to-transparent" />
          <div className="relative z-10 grid grid-cols-2 gap-4">
            {[
              { label: "Full Stack", icon: "</>" },
              { label: "AI / ML", icon: "🧠" },
              { label: "Quizzes", icon: "⚡" },
              { label: "Progress", icon: "🏆" },
            ].map((item) => (
              <div key={item.label} className="h-34 w-34 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 text-slate-600">
                <span className="text-2xl font-bold text-violet-400">{item.icon}</span>
                <span className="text-xs font-semibold">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <section className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "13+", label: "Topics" },
            { value: "130+", label: "Quiz Questions" },
            { value: "20+", label: "Coding Tasks" },
            { value: "2", label: "Learning Paths" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-4xl font-black text-slate-900">{stat.value}</p>
              <p className="text-xs tracking-wide text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-[#eeedf5] py-20 mt-6">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black text-slate-900">How It Works</h2>
            <p className="mt-3 text-slate-500">Everything you need to become a developer, all in one place</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { title: "Structured Learning Paths", desc: "Follow curated video tutorials in Hindi & English", icon: "📖" },
              { title: "AI Generated Quizzes", desc: "Test your knowledge with AI-powered quiz questions", icon: "🧠" },
              { title: "Coding Practice Tasks", desc: "Hands-on coding challenges to build real skills", icon: "<>" },
              { title: "Progress Tracking", desc: "Track your learning journey and unlock new topics", icon: "📊" },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-3xl border border-slate-100 p-7 text-center shadow-sm">
                <div className="mx-auto mb-4 w-11 h-11 rounded-2xl bg-violet-50 text-violet-400 grid place-items-center text-xl">{item.icon}</div>
                <h3 className="font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-10 text-center text-slate-500">
        <div className="font-extrabold text-violet-500">✦ DevLearn AI</div>
        <p className="text-sm mt-2">AI Powered Developer Learning Platform</p>
      </footer>
    </div>
  );
}