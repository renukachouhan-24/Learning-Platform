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

  if (!user) return <div className="flex justify-center items-center h-screen bg-[#0a0a0c] text-white font-sans">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white selection:bg-blue-500/30 font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm">✨</div>
            DevLearn AI
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="px-4 py-2 text-sm rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
          <div className="relative w-10 h-10 bg-gray-800 rounded-full border border-gray-700 overflow-hidden">
              {user.photoURL ? (
                <Image 
                  src={user.photoURL} 
                  alt="profile" 
                  fill 
                  className="object-cover"
                />
              ) : "👤"}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="text-center py-12 px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-xs font-medium tracking-wider text-emerald-400 uppercase bg-emerald-400/10 rounded-full border border-emerald-400/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          AI-Powered Learning
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
          Learn to <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-cyan-400 to-blue-500">Build the Future</span>
        </h1>
        
        <p className="text-gray-400 text-lg mb-12 leading-relaxed">
          Structured learning paths with video tutorials, AI-generated quizzes, and hands-on coding challenges. Master development, your way.
        </p>
        
        {/* Stats Row */}
        <div className="flex justify-center gap-8 md:gap-16 mb-20 border-t border-white/5 pt-10">
          <div>
            <p className="text-3xl font-bold">13+</p>
            <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">Topics</p>
          </div>
          <div>
            <p className="text-3xl font-bold">195+</p>
            <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">Quiz Questions</p>
          </div>
          <div>
            <p className="text-3xl font-bold">20+</p>
            <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">Coding Tasks</p>
          </div>
        </div>

        {/* Path Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {paths.map((path) => (
            <div 
              key={path.id}
              onClick={() => router.push(`/path/${path.id}`)}
              className="group cursor-pointer relative bg-[#121214] p-8 rounded-4xl border border-white/5 hover:border-white/10 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              <div className={`w-14 h-14 bg-linear-to-br ${path.color} rounded-2xl flex items-center justify-center text-2xl mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                {path.icon}
              </div>
              
              <h3 className="text-2xl font-bold mb-3">{path.title}</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                {path.description}
              </p>
              
              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs text-gray-600 font-medium bg-white/5 px-3 py-1 rounded-full">{path.topics}</span>
                <span className="flex items-center gap-2 text-sm font-bold text-blue-500 group-hover:gap-4 transition-all">
                    Start Learning <span>→</span>
                </span>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-4xl"></div>
            </div>
          ))}
        </div>
      </div>

      <footer className="py-20 text-center text-gray-600 text-xs tracking-widest uppercase">
        © 2026 AI Developer Learning Platform
      </footer>
    </div>
  );
}