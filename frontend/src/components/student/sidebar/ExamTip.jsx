import React from 'react'

const ExamTip = () => {
  return (
    <>
         {/* Exam Tips */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Exam Tips</h3>
                <p className="text-sm text-gray-600">Best practices for success</p>
              </div>
              <div className="p-6 space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Read all questions carefully before starting</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Manage your time wisely across all questions</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>For coding questions, test your solutions</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Review your answers before submitting</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Stay calm and focused throughout the exam</p>
                </div>
              </div>
            </div>
    </>
  )
}

export default ExamTip