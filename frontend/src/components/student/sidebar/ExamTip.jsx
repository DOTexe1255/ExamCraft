import React from 'react';

const ExamTip = () => {
  return (
    <>
      {/* Exam Tips Content */}
      <div className="space-y-4 p-1">
        {/* Tip 1 */}
        <div className="flex items-start gap-3 p-4 bg-student-50/50 border border-student-100 
                        rounded-xl hover:bg-student-50 hover:border-student-200 
                        transition-all duration-200 group hover:shadow-sm">
          <div className="w-2.5 h-2.5 bg-student-500 rounded-full mt-1.5 flex-shrink-0 
                          group-hover:bg-student-600 animate-pulse"></div>
          <p className="text-sm text-gray-700 leading-relaxed group-hover:text-student-800">
            Read all questions carefully before starting
          </p>
        </div>

        {/* Tip 2 */}
        <div className="flex items-start gap-3 p-4 bg-student-50/30 border border-student-100 
                        rounded-xl hover:bg-student-50 hover:border-student-200 
                        transition-all duration-200 group hover:shadow-sm">
          <div className="w-2.5 h-2.5 bg-status-active rounded-full mt-1.5 flex-shrink-0 
                          group-hover:scale-110 transition-transform duration-200"></div>
          <p className="text-sm text-gray-700 leading-relaxed group-hover:text-student-800">
            Manage your time wisely across all questions
          </p>
        </div>

        {/* Tip 3 */}
        <div className="flex items-start gap-3 p-4 bg-student-50/50 border border-student-100 
                        rounded-xl hover:bg-student-50 hover:border-student-200 
                        transition-all duration-200 group hover:shadow-sm">
          <div className="w-2.5 h-2.5 bg-status-scheduled rounded-full mt-1.5 flex-shrink-0 
                          group-hover:bg-status-scheduled/80 transition-all duration-200"></div>
          <p className="text-sm text-gray-700 leading-relaxed group-hover:text-student-800">
            For coding questions, test your solutions thoroughly
          </p>
        </div>

        {/* Tip 4 */}
        <div className="flex items-start gap-3 p-4 bg-student-50/30 border border-student-100 
                        rounded-xl hover:bg-student-50 hover:border-student-200 
                        transition-all duration-200 group hover:shadow-sm">
          <div className="w-2.5 h-2.5 bg-status-completed rounded-full mt-1.5 flex-shrink-0 
                          group-hover:rotate-12 transition-all duration-300"></div>
          <p className="text-sm text-gray-700 leading-relaxed group-hover:text-student-800">
            Review your answers before final submission
          </p>
        </div>

        {/* Tip 5 */}
        <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-student-50/70 to-student-100/50 
                        border-2 border-student-200 rounded-xl hover:shadow-dashboard 
                        transition-all duration-300 group hover:from-student-50 hover:to-student-100">
          <div className="w-2.5 h-2.5 bg-white border-2 border-student-500 rounded-full mt-1.5 
                          flex-shrink-0 shadow-sm group-hover:scale-125 transition-all duration-300"></div>
          <p className="text-sm font-semibold text-gray-800 leading-relaxed group-hover:text-student-700">
            Stay calm and focused throughout the exam
          </p>
        </div>
      </div>
    </>
  );
};

export default ExamTip;
