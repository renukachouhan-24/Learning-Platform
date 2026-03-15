"use client";
import { auth, db } from "@/lib/firebase"; // db को भी इम्पोर्ट करें
import { GoogleAuthProvider, signInWithPopup, signOut, User } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"; 
import { useState } from "react";
import Image from "next/image";

export default function Login() {
  const [user, setUser] = useState<User | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const handleLogin = async () => {
    if (signingIn) return;
    setSigningIn(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;
      
      setUser(loggedInUser);
      
      // Firestore में यूजर डेटा सेव करने का लॉजिक
      const userRef = doc(db, "users", loggedInUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // अगर यूजर पहली बार आया है, तो नई एंट्री बनाओ
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
        console.log("New user saved to Firestore!");
      } else {
        // Update last login time for existing users
        await setDoc(userRef, {
          lastLoginAt: serverTimestamp()
        }, { merge: true });
        console.log("Welcome back, existing user!");
      }

    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      if (code !== "auth/cancelled-popup-request" && code !== "auth/popup-closed-by-user") {
        console.error("Login Error:", error);
      }
    } finally {
      setSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white shadow-2xl rounded-3xl border border-gray-100 transition-all hover:shadow-blue-100">
        {user ? (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
               {/* यूजर की फोटो दिखाने के लिए */}
               {user.photoURL && (
                 <Image
                   src={user.photoURL}
                   alt="profile"
                   width={80}
                   height={80}
                   className="rounded-full border-4 border-blue-500"
                 />
               )}
            </div>
            <h1 className="text-2xl font-extrabold text-gray-800">Hi, {user.displayName}!</h1>
            <p className="mb-6 text-gray-500 font-medium">{user.email}</p>
            
            <div className="flex flex-col gap-3">
               <button 
                 onClick={() => window.location.href = '/dashboard'} // डैशबोर्ड पर जाने के लिए
                 className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
               >
                 Go to Dashboard
               </button>
               <button 
                 onClick={handleLogout}
                 className="text-sm text-red-500 hover:underline transition-all"
               >
                 Logout
               </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Welcome</h2>
            <p className="text-gray-400 mb-8">Start your AI learning journey today.</p>
            <button 
              onClick={handleLogin}
              disabled={signingIn}
              className="flex items-center gap-3 px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-2xl shadow-sm hover:border-blue-500 hover:text-blue-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Image
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="google"
                width={24}
                height={24}
              />
              Sign in with Google
            </button>
          </div>
        )}
      </div>
    </div>
  );
}