"use client";
import { auth, db } from "@/lib/firebase";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"; 
import { useEffect, useState } from "react";
import Image from "next/image";
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

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center">
        <div className="text-sm tracking-wide text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.15),transparent_30%),radial-gradient(circle_at_50%_90%,rgba(16,185,129,0.10),transparent_30%)]" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-4xl border border-white/10 bg-white/3 backdrop-blur-xl p-8 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 h-14 w-14 rounded-2xl bg-linear-to-br from-blue-500 to-cyan-500 grid place-items-center text-xl font-bold shadow-lg">
              ✨
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Welcome to DevLearn AI</h1>
            <p className="mt-2 text-sm text-gray-400">Login karein aur direct dashboard se learning continue karein.</p>
          </div>

          <button
            onClick={handleLogin}
            disabled={signingIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white text-gray-900 font-semibold hover:bg-gray-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Image
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="google"
              width={22}
              height={22}
            />
            {signingIn ? "Signing in..." : "Continue with Google"}
          </button>

          <p className="mt-4 text-center text-xs text-gray-500">
            Secure sign-in powered by Firebase Authentication
          </p>
        </div>
      </div>
    </div>
  );
}