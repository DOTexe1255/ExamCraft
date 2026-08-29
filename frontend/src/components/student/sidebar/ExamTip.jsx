import React from 'react';

const TIPS = [
  {
    id: 1,
    text: "Read all questions carefully before starting.",
    dotClass: "bg-blue-500 group-hover:scale-125",
    baseClass: "bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/70",
    textClass: "text-slate-700 group-hover:text-blue-900",
  },
  {
    id: 2,
    text: "Manage your time wisely across all sections.",
    dotClass: "bg-emerald-500 group-hover:scale-125",
    baseClass: "bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/70",
    textClass: "text-slate-700 group-hover:text-emerald-900",
  },
  {
    id: 3,
    text: "For coding questions, test your solutions thoroughly.",
    dotClass: "bg-purple-500 group-hover:scale-125",
    baseClass: "bg-white border-slate-200 hover:border-purple-300 hover:bg-purple-50/70",
    textClass: "text-slate-700 group-hover:text-purple-900",
  },
  {
    id: 4,
    text: "Review all your answers before final submission.",
    dotClass: "bg-amber-500 group-hover:scale-125",
    baseClass: "bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/70",
    textClass: "text-slate-700 group-hover:text-amber-900",
  },
  {
    id: 5,
    text: "Stay calm and focused throughout the exam. Good luck!",
    isHighlight: true,
  }
];

const ExamTip = () => {
  return (
    <div className="space-y-3 font-sans">
      {TIPS.map((tip) => {
        
        // Render the highlighted "Good luck" tip differently
        if (tip.isHighlight) {
          return (
            <div
              key={tip.id}
              className="group flex items-start gap-3 rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 transition-all duration-300 hover:shadow-sm"
            >
              <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm transition-transform duration-300 group-hover:scale-110">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-semibold leading-relaxed text-blue-900">
                {tip.text}
              </p>
            </div>
          );
        }

        // Render standard tips
        return (
          <div
            key={tip.id}
            className={`group flex items-start gap-3 rounded-xl border p-3.5 transition-all duration-200 hover:shadow-sm ${tip.baseClass}`}
          >
            <div
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full transition-transform duration-300 ${tip.dotClass}`}
            />
            <p className={`text-sm leading-relaxed transition-colors duration-200 ${tip.textClass}`}>
              {tip.text}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default ExamTip;