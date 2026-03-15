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

  if (!course) return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-white">
      Course Not Found!
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-sans selection:bg-blue-500/30">
      {/* Header / Back Button */}
      <div className="max-w-5xl mx-auto px-6 pt-12">
        <button 
          onClick={() => router.push("/dashboard")}
          className="text-gray-500 hover:text-white mb-8 flex items-center gap-2 font-medium transition-colors"
        >
          ← Back to Paths
        </button>

        <div className="flex items-center gap-6 mb-12">
            <div className="w-20 h-20 bg-linear-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center text-4xl shadow-2xl shadow-blue-500/20">
                {id === "full-stack" ? "🚀" : "🧠"}
            </div>
            <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">{course.title}</h1>
                <p className="text-gray-500">0/7 completed</p>
            </div>
        </div>

        {/* Topics List */}
        <div className="space-y-4 pb-20">
          {course.topics.map((topic: Topic) => {
            return (
              <div 
                key={topic.id}
                onClick={() => router.push(`/topic/${topic.id}`)}
                className="group relative flex items-center p-6 rounded-4xl border transition-all duration-300 bg-[#121214] border-white/5 hover:border-blue-500/50 cursor-pointer hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mr-6 transition-colors bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white">
                  <div className="w-3 h-3 rounded-full border-2 border-current"></div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold">{topic.title}</h3>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">{topic.description}</p>
                  
                  {/* Meta Info */}
                  <div className="flex gap-4 mt-3">
                    <span className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">15 Quiz Questions</span>
                    <span className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">2 Coding Tasks</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                    Start <span className="text-xl">→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}