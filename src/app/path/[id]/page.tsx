// "use client";
// import { useParams, useRouter } from "next/navigation";
// import { coursesData, Topic } from "@/lib/coursesData"; // Topic को भी इम्पोर्ट करें

// export default function PathPage() {
//   const { id } = useParams();
//   const router = useRouter();
  
//   const course = coursesData[id as string];

//   if (!course) return <div className="p-10 text-center text-2xl font-bold">Course Not Found!</div>;

//   return (
//     <div className="min-h-screen bg-white p-6 md:p-12">
//       <button 
//         onClick={() => router.push("/dashboard")}
//         className="text-blue-600 mb-8 flex items-center gap-2 font-medium hover:underline"
//       >
//         ← Back to Dashboard
//       </button>

//       <div className="max-w-4xl mx-auto">
//         <h1 className="text-5xl font-black text-gray-900 mb-4">{course.title}</h1>
//         <p className="text-gray-500 text-xl mb-12">Click on a topic to start learning.</p>

//         <div className="space-y-4">
//           {course.topics.map((topic: Topic, index: number) => ( // यहाँ Topic टाइप यूज़ करें
//             <div 
//               key={topic.id}
//               onClick={() => router.push(`/topic/${topic.id}`)}
//               className="flex items-center p-6 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all group"
//             >
//               <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center font-bold text-blue-600 mr-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
//                 {index + 1}
//               </div>
//               <div className="flex-1">
//                 <h3 className="text-xl font-bold text-gray-800">{topic.title}</h3>
//                 <p className="text-gray-500">{topic.description}</p>
//               </div>
//               <div className="text-2xl text-gray-300 group-hover:text-blue-500 transition-colors">
//                 ➔
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";
import { useParams, useRouter } from "next/navigation";
import { coursesData, Topic } from "@/lib/coursesData";

export default function PathPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const course = coursesData[id as string];
  const isFullStack = id === "full-stack";
  const accent = isFullStack ? "from-violet-500 to-fuchsia-500" : "from-pink-500 to-rose-500";

  if (!course) return (
    <div className="min-h-screen bg-[#f4f3f9] flex items-center justify-center text-slate-700">
      Course Not Found!
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f3f9] text-slate-900 font-sans selection:bg-purple-100 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-16 -left-20 w-80 h-80 rounded-full bg-violet-200/50 blur-3xl" />
      <div className="pointer-events-none absolute top-28 -right-20 w-96 h-96 rounded-full bg-pink-200/45 blur-3xl" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-20">
        <button 
          onClick={() => router.push("/dashboard")}
          className="text-slate-500 hover:text-violet-500 mb-8 flex items-center gap-2 font-medium transition-colors"
        >
          ← Back to Paths
        </button>

        <div className="rounded-4xl border border-violet-100 bg-white/85 backdrop-blur p-7 md:p-9 shadow-[0_24px_70px_rgba(124,58,237,0.15)] mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className={`w-20 h-20 bg-linear-to-br ${accent} rounded-3xl flex items-center justify-center text-4xl shadow-lg`}>
                {isFullStack ? "🚀" : "🧠"}
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-100 text-[10px] uppercase tracking-widest font-black text-violet-500 mb-3">
                  Learning Track
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 text-slate-900">{course.title}</h1>
                <p className="text-slate-500">0/{course.topics.length} completed</p>
              </div>
            </div>

            <div className="md:text-right">
              <p className="text-sm text-slate-500 mb-2">Progress</p>
              <div className="w-56 h-3 rounded-full bg-violet-100 overflow-hidden ml-auto">
                <div className={`h-full w-1/12 bg-linear-to-r ${accent}`} />
              </div>
              <p className="text-xs text-slate-500 mt-2">Start first topic to unlock momentum ✨</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-7">
            {[
              { label: "Topics", value: String(course.topics.length) },
              { label: "Quizzes", value: `${course.topics.length * 10}+` },
              { label: "Tasks", value: `${course.topics.length * 3}+` },
              { label: "Level", value: "Beginner" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-violet-100 bg-white px-4 py-3 text-center">
                <p className="text-xl font-black text-slate-900">{item.value}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 pb-20">
          {course.topics.map((topic: Topic, index: number) => {
            return (
              <div 
                key={topic.id}
                onClick={() => router.push(`/topic/${topic.id}`)}
                className="group relative flex items-center p-6 rounded-4xl border transition-all duration-300 bg-white border-slate-200 hover:border-violet-300 cursor-pointer hover:shadow-[0_18px_40px_rgba(124,58,237,0.12)] hover:-translate-y-0.5 overflow-hidden"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mr-6 transition-colors bg-violet-50 text-violet-600 group-hover:bg-violet-500 group-hover:text-white font-black">
                  {index + 1}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-slate-900">{topic.title}</h3>
                    <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-violet-50 text-violet-500 border border-violet-100 font-bold">Topic</span>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">{topic.description}</p>
                  
                  <div className="flex gap-4 mt-3">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">10 Quiz Questions</span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">3 Coding Tasks</span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">~45 Min</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm font-bold text-violet-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                    Start <span className="text-xl">→</span>
                </div>

                <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full bg-linear-to-br ${accent} opacity-0 group-hover:opacity-15 blur-2xl transition-opacity`} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}