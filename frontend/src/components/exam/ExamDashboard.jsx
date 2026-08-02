import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { requestJson } from '../../global/api';

const STORAGE_KEY = 'examcraft_student_attempts';

const getStoredAttempts = () => {
  if (typeof window === 'undefined') return {};

  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

const buildQuestions = (exam) => {
  const title = exam?.title || 'Exam';
  const description = exam?.description || 'Practice assessment';

  return [
    {
      id: 'q1',
      text: `${title}: Which option best describes the purpose of this assessment?`,
      options: [
        { id: 'a', text: 'To evaluate knowledge on the given topic' },
        { id: 'b', text: 'To create a timetable' },
        { id: 'c', text: 'To manage student records' },
        { id: 'd', text: 'To send notifications' },
      ],
    },
    {
      id: 'q2',
      text: `${description} Which action is most appropriate while attempting this exam?`,
      options: [
        { id: 'a', text: 'Read each question carefully before answering' },
        { id: 'b', text: 'Skip all questions' },
        { id: 'c', text: 'Submit immediately' },
        { id: 'd', text: 'Restart the browser' },
      ],
    },
    {
      id: 'q3',
      text: `This exam has a duration of ${exam?.duration_minutes || 60} minutes. What is the best strategy?`,
      options: [
        { id: 'a', text: 'Manage time and move between questions using the navigation controls' },
        { id: 'b', text: 'Answer only the first question' },
        { id: 'c', text: 'Leave all questions blank' },
        { id: 'd', text: 'Close the tab after each answer' },
      ],
    },
  ];
};

const ExamDashboard = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [examData, setExamData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [attemptCount, setAttemptCount] = useState(1);
  const [savedQuestions, setSavedQuestions] = useState({});
  const [statusMessage, setStatusMessage] = useState('');

  const persistAttempt = useCallback((overrides = {}) => {
    if (!examData?.id || typeof window === 'undefined') return;

    const storedAttempts = getStoredAttempts();
    const nextState = {
      examId: String(examData.id),
      title: examData.title,
      answers: overrides.answers ?? answers,
      currentQuestion: overrides.currentQuestion ?? currentQuestion,
      timeLeft: overrides.timeLeft ?? timeLeft,
      savedQuestions: overrides.savedQuestions ?? savedQuestions,
      isSubmitted: overrides.isSubmitted ?? isSubmitted,
      attemptCount: overrides.attemptCount ?? attemptCount,
      updatedAt: Date.now(),
    };

    storedAttempts[String(examData.id)] = nextState;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storedAttempts));
  }, [answers, attemptCount, currentQuestion, examData?.id, examData?.title, isSubmitted, savedQuestions, timeLeft]);

  const fetchExamData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await requestJson('/api/exams');
      const exam = (response?.exams || []).find((item) => Number(item.exam_id) === Number(examId));

      if (!exam) {
        setExamData(null);
        return;
      }

      const preparedExam = {
        id: exam.exam_id,
        title: exam.title,
        description: exam.description,
        duration: Number(exam.duration_minutes || 60),
        total_marks: exam.total_marks || 100,
        passing_marks: 40,
        instructions: exam.instructions,
        questions: buildQuestions(exam),
      };

      const storedAttempts = getStoredAttempts();
      const existingAttempt = storedAttempts[String(exam.exam_id)];

      setExamData(preparedExam);
      setTimeLeft(Number(existingAttempt?.timeLeft ?? preparedExam.duration * 60));
      setAnswers(existingAttempt?.answers || {});
      setCurrentQuestion(Number(existingAttempt?.currentQuestion || 0));
      setSavedQuestions(existingAttempt?.savedQuestions || {});
      setIsSubmitted(Boolean(existingAttempt?.isSubmitted));
      setAttemptCount(Number(existingAttempt?.attemptCount || 1));

      if (existingAttempt) {
        setStatusMessage(existingAttempt.isSubmitted ? 'Your previous submission is restored.' : 'Your previous progress has been restored.');
      }
    } catch (error) {
      console.error('Failed to fetch exam:', error);
      setExamData(null);
    } finally {
      setIsLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    let active = true;

    const loadExam = async () => {
      if (!active) return;
      await fetchExamData();
    };

    loadExam();

    return () => {
      active = false;
    };
  }, [fetchExamData]);

  useEffect(() => {
    if (!examData) return;
    persistAttempt();
  }, [answers, currentQuestion, examData, isSubmitted, savedQuestions, timeLeft, attemptCount, persistAttempt]);

  useEffect(() => {
    if (!examData || isSubmitted) return;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [examData?.id, isSubmitted]);

  const handleAnswerSelect = (questionId, answerId) => {
    setAnswers((current) => ({ ...current, [questionId]: answerId }));
    setStatusMessage('Option selected. Tap “Save answer” to keep it.');
  };

  const handleSaveAnswer = () => {
    if (!question) return;

    if (!answers[question.id]) {
      setStatusMessage('Please select an option before saving.');
      return;
    }

    setSavedQuestions((current) => ({ ...current, [question.id]: true }));
    setStatusMessage('Answer saved. You can resume later from the dashboard.');
  };

  const handleNext = () => {
    if (examData && currentQuestion < examData.questions.length - 1) {
      setCurrentQuestion((current) => current + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((current) => current - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 800));
      setIsSubmitted(true);
      setAttemptCount((current) => current + 1);
      setStatusMessage('Exam submitted successfully.');
      persistAttempt({ isSubmitted: true, attemptCount: attemptCount + 1 });
    } catch (error) {
      console.error('Failed to submit exam:', error);
      alert('Failed to submit exam. Please try again.');
    }
  };

  const handleConfirmSubmit = () => {
    setShowConfirm(true);
  };

  const handleCancelSubmit = () => {
    setShowConfirm(false);
  };

  const handleConfirmSubmitNow = async () => {
    setShowConfirm(false);
    await handleSubmit();
  };

  const handleRetake = () => {
    setIsSubmitted(false);
    setAnswers({});
    setCurrentQuestion(0);
    setSavedQuestions({});
    setTimeLeft((examData?.duration || 60) * 60);
    setShowConfirm(false);
    setStatusMessage('New attempt started.');

    if (typeof window !== 'undefined' && examData?.id) {
      const storedAttempts = getStoredAttempts();
      delete storedAttempts[String(examData.id)];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storedAttempts));
    }
  };

  const handleSaveAndExit = () => {
    persistAttempt();
    setStatusMessage('Progress saved. You can resume from the dashboard.');
    navigate('/student-dashboard');
  };

  const question = examData?.questions?.[currentQuestion];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-student-50 to-student-100 p-6">
        <div className="text-center">
          <div className="mx-auto mb-6 h-32 w-32 animate-spin rounded-full border-b-2 border-student-600"></div>
          <p className="text-xl font-semibold text-gray-700">Loading Exam...</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-student-50 to-student-100 p-6">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-12 text-center shadow-2xl">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-student-100">
            <svg className="h-12 w-12 text-student-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Exam Submitted Successfully!</h1>
          <p className="mb-8 text-lg text-gray-600">Your answers have been recorded. Results will be available soon.</p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button
              onClick={handleRetake}
              className="rounded-2xl border border-student-300 px-8 py-3 text-lg font-semibold text-student-700 shadow-sm transition-all duration-300 hover:bg-student-50"
            >
              Re-attempt exam
            </button>
            <button
              onClick={() => navigate('/student-dashboard')}
              className="rounded-2xl bg-student-600 px-8 py-3 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:bg-student-700"
            >
              Back to dashboard
            </button>
          </div>
          <p className="mt-6 text-sm text-gray-500">Attempt recorded: {attemptCount}</p>
        </div>
      </div>
    );
  }

  if (!examData || !question) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-student-50 to-student-100 p-6">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Exam Not Found</h1>
          <p className="mb-6 text-gray-600">The exam you are trying to enter is unavailable right now.</p>
          <button
            onClick={() => navigate('/student-dashboard')}
            className="rounded-xl bg-student-600 px-6 py-2 font-semibold text-white transition-all duration-200 hover:bg-student-700"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  const minutesLabel = Math.floor(timeLeft / 60);
  const secondsLabel = timeLeft % 60;

  return (
    <div className="min-h-screen bg-gradient-to-br from-student-50 to-student-100">
      <div className="sticky top-0 z-50 border-b border-student-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{examData.title}</h1>
              <p className="text-gray-600">{examData.description}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-sm text-gray-500">Time Remaining</div>
                <div className={`text-2xl font-mono font-bold ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-student-600'}`}>
                  {minutesLabel.toString().padStart(2, '0')}:{secondsLabel.toString().padStart(2, '0')}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-500">
                  Question {currentQuestion + 1} of {examData.questions.length}
                </div>
                <div className="mt-1 h-2 w-16 rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-student-500 to-student-600 shadow-sm transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / examData.questions.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        {statusMessage && (
          <div className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
            {statusMessage}
          </div>
        )}
        <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="rounded-3xl border border-student-100/50 bg-white/70 p-8 shadow-2xl backdrop-blur-sm">
            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Q{currentQuestion + 1}. {question.text}
              </h2>
              <p className="text-sm text-gray-600">Choose the best option, then save it to keep your progress.</p>
            </div>

            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswerSelect(question.id, option.id)}
                  className={`group flex w-full items-start gap-4 rounded-2xl border-2 p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    answers[question.id] === option.id
                      ? 'border-student-500 bg-gradient-to-r from-student-50 to-student-100 shadow-student-lg ring-4 ring-student-200/50'
                      : 'border-gray-200 hover:border-student-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="w-12 flex-shrink-0 text-xl font-bold text-student-500 transition-colors group-hover:text-student-600">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className="flex-1 leading-relaxed">{option.text}</span>
                  {answers[question.id] === option.id && (
                    <div className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-student-500 shadow-lg">
                      <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-student-100/50 bg-white/70 p-6 shadow-2xl backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-gray-900">Question Navigator</h3>
            <p className="mt-1 text-sm text-gray-600">Track your progress like a real competitive exam.</p>
            <div className="mt-5 grid grid-cols-4 gap-2">
              {examData.questions.map((item, index) => {
                const answered = Boolean(answers[item.id]);
                const saved = Boolean(savedQuestions[item.id]);
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentQuestion(index)}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                      currentQuestion === index
                        ? 'border-student-500 bg-student-600 text-white'
                        : saved
                          ? 'border-indigo-400 bg-indigo-600 text-white'
                          : answered
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-student-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-900">Attempted:</span> {Object.keys(answers).length} / {examData.questions.length}</p>
              <p className="mt-1"><span className="font-semibold text-slate-900">Status:</span> {Object.keys(answers).length === examData.questions.length ? 'All questions attempted' : 'In progress'}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-student-100/50 bg-white/70 p-8 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center justify-center gap-3 rounded-2xl border-2 border-gray-200 px-8 py-4 text-lg font-semibold text-gray-700 shadow-md transition-all duration-300 hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleSaveAnswer}
                disabled={!answers[question.id]}
                className="flex items-center justify-center gap-3 rounded-2xl border border-student-300 bg-white px-6 py-4 text-lg font-semibold text-student-700 shadow-sm transition-all duration-300 hover:bg-student-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save answer
              </button>

              <button
                onClick={handleSaveAndExit}
                className="flex items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-slate-50 px-6 py-4 text-lg font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:bg-slate-100"
              >
                Save & exit
              </button>

              <button
                onClick={handleConfirmSubmit}
                disabled={Object.keys(answers).length === 0}
                className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-student-600 to-student-700 px-10 py-4 text-lg font-bold text-white shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:from-student-700 hover:to-student-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Submit Exam
              </button>

              <button
                onClick={handleNext}
                disabled={currentQuestion === examData.questions.length - 1}
                className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-student-500 to-student-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:-translate-y-1 hover:from-student-600 hover:to-student-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-6 border-t border-student-200 pt-6 text-center">
            <p className="text-sm text-gray-600">
              Answered: <span className="font-semibold text-student-600">{Object.keys(answers).length}</span> / {examData.questions.length} questions
            </p>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900">Submit your exam?</h3>
            <p className="mt-3 text-sm text-gray-600">Once you submit, you will not be able to change your answers. Are you sure you want to finish this exam?</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleCancelSubmit}
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmitNow}
                className="rounded-2xl bg-student-600 px-4 py-3 text-sm font-semibold text-white hover:bg-student-700"
              >
                Yes, submit exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamDashboard;
