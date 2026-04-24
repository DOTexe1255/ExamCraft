import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ExamDashboard = () => {
  const { examId } = useParams(); // Gets examId from #/exam/exam-1
  const navigate = useNavigate();
  const [examData, setExamData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes default
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchExamData();
  }, [examId]);

  useEffect(() => {
    if (!examData || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examData, isSubmitted]);

  const fetchExamData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/exams/${examId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to load exam');
      }

      const data = await response.json();
      const exam = data.exam;

      setExamData(exam);
      setTimeLeft((exam.duration_minutes || exam.duration || 60) * 60);
    } catch (error) {
      console.error('Failed to fetch exam:', error);
      setExamData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answerId) => {
    setAnswers({
      ...answers,
      [questionId]: answerId
    });
  };

  const handleNext = () => {
    if (currentQuestion < (examData?.questions.length - 1 || 0)) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/exams/${examId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ answers })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Submission failed');
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit exam:', error);
      alert('Failed to submit exam. Please try again.');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-student-50 to-student-100 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-student-600 mx-auto mb-6"></div>
          <p className="text-xl font-semibold text-gray-700">Loading Exam...</p>
        </div>
      </div>
    );
  }

  // Submitted state - BACK TO LOGIN
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-student-50 to-student-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-student-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-student-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Exam Submitted Successfully!</h1>
          <p className="text-lg text-gray-600 mb-8">Your answers have been recorded. Results will be available soon.</p>
          <button 
            onClick={() => navigate('/student-login')} // ✅ Goes to Student Login Page (#/login)
            className="px-8 py-3 bg-student-600 text-white rounded-2xl text-lg font-semibold hover:bg-student-700 shadow-xl transition-all duration-300"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Exam not found state - BACK TO LOGIN
  if (!examData && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-student-50 to-student-100 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Exam Not Found</h1>
          <p className="text-gray-600 mb-6">The exam you're looking for doesn't exist or is no longer available.</p>
          <button 
            onClick={() => navigate('/login')} // ✅ Goes to Student Login Page (#/login)
            className="px-6 py-2 bg-student-600 text-white rounded-xl font-semibold hover:bg-student-700 transition-all duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const question = examData.questions[currentQuestion];
  // Support both API field names (question_id/question_text) and legacy (id/text)
  const questionId = question.question_id || question.id;
  const questionText = question.question_text || question.text;
  const questionOptions = Array.isArray(question.options) ? question.options : [];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen bg-gradient-to-br from-student-50 to-student-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-student-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{examData.title}</h1>
              <p className="text-gray-600">{examData.description}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-sm text-gray-500">Time Remaining</div>
                <div className={`text-2xl font-mono font-bold ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-student-600'}`}>
                  {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">
                  Question {currentQuestion + 1} of {examData.questions.length}
                </div>
                <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                  <div 
                    className="h-2 bg-gradient-to-r from-student-500 to-student-600 rounded-full transition-all duration-300 shadow-sm" 
                    style={{ width: `${((currentQuestion + 1) / examData.questions.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Question */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border border-student-100/50">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Q{currentQuestion + 1}. {questionText}
            </h2>
          </div>

          {/* Multiple Choice Options */}
          <div className="space-y-3">
            {questionOptions.map((option, index) => {
              const optionId = option.option_id || option.id || index;
              const optionText = option.option_text || option.text || option;
              return (
              <button
                key={optionId}
                onClick={() => handleAnswerSelect(questionId, optionId)}
                className={`group w-full p-6 border-2 rounded-2xl flex items-start gap-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  answers[questionId] === optionId
                    ? 'border-student-500 bg-gradient-to-r from-student-50 to-student-100 shadow-student-lg ring-4 ring-student-200/50'
                    : 'border-gray-200 hover:border-student-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl font-bold w-12 flex-shrink-0 text-student-500 group-hover:text-student-600 transition-colors">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span className="text-left leading-relaxed flex-1">{optionText}</span>
                {answers[questionId] === optionId && (
                  <div className="ml-auto w-5 h-5 bg-student-500 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
              );
            })}
          </div>
        </div>

        {/* Navigation & Controls */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-student-100/50">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl font-semibold text-lg hover:bg-gray-50 hover:border-gray-400 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3 shadow-md"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length === 0}
                className="px-10 py-4 bg-gradient-to-r from-student-600 to-student-700 text-white rounded-2xl font-bold text-lg hover:from-student-700 hover:to-student-800 shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Submit Exam
              </button>
              
              <button
                onClick={handleNext}
                disabled={currentQuestion === examData.questions.length - 1}
                className="px-8 py-4 bg-gradient-to-r from-student-500 to-student-600 text-white rounded-2xl font-semibold text-lg hover:from-student-600 hover:to-student-700 shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3"
              >
                Next
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Answered count */}
          <div className="mt-6 pt-6 border-t border-student-200 text-center">
            <p className="text-sm text-gray-600">
              Answered: <span className="font-semibold text-student-600">{Object.keys(answers).length}</span> / {examData.questions.length} questions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamDashboard;
