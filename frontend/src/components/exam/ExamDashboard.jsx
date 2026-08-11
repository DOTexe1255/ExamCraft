import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { requestJson } from '../../global/api';
import { getStoredAuth } from '../../global/authStorage';

const getStorageKey = () => {
  const auth = getStoredAuth();
  const userId = auth?.userId ?? auth?.user?.id ?? auth?.user?.user_id ?? 'anonymous';
  return `examcraft_student_attempts_${userId}`;
};

const CODE_LANGUAGE_OPTIONS = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
];

const getStoredAttempts = () => {
  if (typeof window === 'undefined') return {};

  try {
    return JSON.parse(window.localStorage.getItem(getStorageKey()) || '{}');
  } catch {
    return {};
  }
};

const normalizeQuestionType = (type) => (type === 'short_answer' ? 'descriptive' : (type || 'mcq'));

const normalizeQuestion = (question, index) => {
  const type = normalizeQuestionType(question?.type);
  const options = Array.isArray(question?.options)
    ? question.options
      .map((option, optionIndex) => (typeof option === 'object' && option !== null
        ? {
          id: option.id || String(optionIndex),
          text: String(option.text ?? option.label ?? option.value ?? ''),
        }
        : {
          id: String(optionIndex),
          text: String(option ?? ''),
        }))
      .filter((option) => option.text.trim())
    : [];

  const testCases = Array.isArray(question?.testCases || question?.test_cases)
    ? (question?.testCases || question?.test_cases).map((item) => ({
      input: String(item?.input ?? ''),
      expected: String(item?.expected ?? ''),
    }))
    : [];

  return {
    id: question?.id || `q${index + 1}`,
    type,
    title: question?.title || '',
    text: question?.question_text || question?.description || question?.title || '',
    description: question?.description || '',
    marks: Number(question?.marks || 1),
    sectionTitle: question?.section_title || '',
    options,
    correctAnswer: question?.correct_answer || '',
    language: question?.language || 'any',
    functionName: question?.functionName || question?.function_name || '',
    constraints: question?.constraints || '',
    sampleInput: question?.sample_input || '',
    sampleOutput: question?.sample_output || '',
    testCases,
  };
};

const buildQuestions = (exam) => (Array.isArray(exam?.question_bank) ? exam.question_bank : []).map(normalizeQuestion);

const ExamDashboard = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [examData, setExamData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [autoSaving, setAutoSaving] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);
  const [markedQuestions, setMarkedQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(3600);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [fullscreenWarning, setFullscreenWarning] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const idleTimerRef = useRef(null);
const [idleWarningCount, setIdleWarningCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [attemptCount, setAttemptCount] = useState(1);
  const [savedQuestions, setSavedQuestions] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [runResults, setRunResults] = useState({});
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [securitySettings, setSecuritySettings] = useState(null);
  const [violationCount, setViolationCount] = useState(0);

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
    window.localStorage.setItem(getStorageKey(), JSON.stringify(storedAttempts));
  }, [answers, attemptCount, currentQuestion, examData?.id, examData?.title, isSubmitted, savedQuestions, timeLeft]);

  const sendHeartbeat = useCallback(async (extra = {}) => {
    if (!examData || isSubmitted) return;

    try {
      const response = await requestJson(`/api/exams/${examId}/heartbeat`, {
        method: "POST",
        body: JSON.stringify({
          remainingSeconds: timeLeft,
          currentQuestion,
          tabSwitch: false,
          fullscreenExit: false,
          idleWarning: false,
          ...extra,
        }),
      });
      if (response?.submitted) {
        sessionStorage.removeItem('examAttempt');
        navigate('/student-dashboard', { replace: true });
      }
    } catch (error) {
      setStatusMessage("Connection issue detected. Your answers remain saved on this device.");
    }
  }, [
    examData,
    examId,
    timeLeft,
    currentQuestion,
    isSubmitted,
    navigate,
  ]);

  const recordViolation = useCallback((type, message, extra = {}) => {
    if (isSubmitted) return;

    setViolationCount((count) => {
      const next = count + 1;
      const limit = 3;
      setStatusMessage(`${message} Warning ${next} / ${limit}.`);
      sendHeartbeat({ violationType: type, violationCount: next, ...extra });

      if (securitySettings?.auto_submit_on_violation && next >= limit) {
        setStatusMessage("Maximum security warnings reached. Submitting your exam.");
        handleSubmit();
      }
      return next;
    });
  }, [isSubmitted, securitySettings?.auto_submit_on_violation, sendHeartbeat, handleSubmit]);

  const fetchExamData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await requestJson(`/api/exams/${examId}`);
      const exam = response?.exam;

      if (!exam) {
        setExamData(null);
        return;
      }

      const questions = buildQuestions(exam);
      const preparedExam = {
        id: exam.exam_id,
        title: exam.title,
        description: exam.description,
        duration: Number(exam.duration_minutes || 60),
        total_marks: exam.total_marks || 100,
        passing_marks: exam.passing_marks || 40,
        instructions: exam.instructions,
        questions,
        security_settings: exam.security_settings || null,
      };

      const storedAttempts = getStoredAttempts();
      const existingAttempt = storedAttempts[String(exam.exam_id)];

      setExamData(preparedExam);
      setSecuritySettings(preparedExam.security_settings);
      const sessionAttempt = JSON.parse(sessionStorage.getItem('examAttempt') || '{}');
      const sessionTimeLeft = Number(sessionAttempt?.remainingSeconds);
      const savedTimeLeft = Number(existingAttempt?.timeLeft);
      setTimeLeft(
        Number.isFinite(sessionTimeLeft) && sessionTimeLeft >= 0
          ? sessionTimeLeft
          : Number.isFinite(savedTimeLeft) && savedTimeLeft >= 0
            ? savedTimeLeft
            : preparedExam.duration * 60
      );
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

    const attempt = JSON.parse(
      sessionStorage.getItem("examAttempt") || "{}"
    );

    if (attempt.remainingSeconds) {

      setTimeLeft(attempt.remainingSeconds);

    }

  }, []);
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

    const handleBeforeUnload = (event) => {

      if (isSubmitted) return;

      event.preventDefault();

      event.returnValue = "";

    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {

      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );

    };

  }, [isSubmitted]);

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
          setStatusMessage('Time is up. Submitting your exam.');
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [examData?.id, isSubmitted, handleSubmit]);

  useEffect(() => {
    if (!examData || isSubmitted) return;

    const interval = setInterval(() => {
      sendHeartbeat();
    }, 15000); // 15 seconds

    return () => clearInterval(interval);
  }, [examData, isSubmitted, sendHeartbeat]);

  useEffect(() => {

    return () => {

      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }

    };

  }, [autoSaveTimeout]);
  useEffect(() => {

    const handleFullscreen = () => {

      if (document.fullscreenElement) return;

      if (isSubmitted) return;

      setFullscreenWarning((count) => {

        const next = count + 1;

        recordViolation('fullscreen_exit', 'Fullscreen mode was exited.', { fullscreenExit: true });

        return next;

      });

    };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreen
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreen
      );
    };
  }, [handleSubmit, isSubmitted, recordViolation]);

  useEffect(() => {

  if (!securitySettings?.block_right_click) {
    return;
  }

  const handleContextMenu = (event) => {

    event.preventDefault();
    recordViolation('right_click', 'Right click is disabled during the exam.');

  };

  document.addEventListener("contextmenu", handleContextMenu);

  return () => {

    document.removeEventListener(
      "contextmenu",
      handleContextMenu
    );

  };

}, [securitySettings, recordViolation]);
useEffect(() => {

  if (!securitySettings) return;

  const handleKeyDown = (event) => {

    const key = event.key.toLowerCase();

    const modifier = event.ctrlKey || event.metaKey;

    const isCopy = modifier && key === "c";
    const isCut = modifier && key === "x";
    const isPaste = modifier && key === "v";
    const isF12 = event.key === "F12";

const isDevTools =
  modifier &&
  event.shiftKey &&
  (
    key === "i" ||
    key === "j" ||
    key === "c"
  );

const isViewSource =
  modifier &&
  key === "u";

const isPrint =
  modifier &&
  key === "p";
if (
  securitySettings.block_devtools &&
  (
    isF12 ||
    isDevTools ||
    isViewSource
  )
) {

  event.preventDefault();

  recordViolation('devtools', 'Developer tools are disabled during the exam.');

  return;

}

if (
  securitySettings.block_print &&
  isPrint
) {

  event.preventDefault();

  recordViolation('print', 'Printing is disabled during the exam.');

  return;

}
    const current = examData?.questions?.[currentQuestion];
    const codingQuestion = current?.type === "code";

    // Coding question me paste allow hai
    if (
      isPaste &&
      codingQuestion &&
      securitySettings.allow_paste_in_coding
    ) {
      return;
    }

    if (
      isCopy &&
      securitySettings.block_copy_paste
    ) {
      event.preventDefault();
      recordViolation('copy', 'Copy is disabled during the exam.');
      return;
    }

    if (
      isCut &&
      securitySettings.block_cut
    ) {
      event.preventDefault();
      recordViolation('cut', 'Cut is disabled during the exam.');
      return;
    }

    if (
      isPaste &&
      securitySettings.block_copy_paste
    ) {
      event.preventDefault();
      recordViolation('paste', 'Paste is disabled during the exam.');
    }

  };

  document.addEventListener("keydown", handleKeyDown);

  return () => {
    document.removeEventListener("keydown", handleKeyDown);
  };

}, [securitySettings, examData, currentQuestion, recordViolation]);

  useEffect(() => {
    if (!securitySettings?.block_text_selection) return undefined;

    const preventSelection = (event) => event.preventDefault();
    const preventDrag = (event) => {
      event.preventDefault();
      recordViolation('drag', 'Dragging content is disabled during the exam.');
    };

    document.addEventListener('selectstart', preventSelection);
    document.addEventListener('dragstart', preventDrag);
    return () => {
      document.removeEventListener('selectstart', preventSelection);
      document.removeEventListener('dragstart', preventDrag);
    };
  }, [securitySettings?.block_text_selection, recordViolation]);



  useEffect(() => {

    const handleVisibility = () => {

      if (document.visibilityState === "visible") return;

      if (isSubmitted) return;
      sendHeartbeat({
        tabSwitch: true,
      });
      setTabSwitchCount((count) => {

        const next = count + 1;

        recordViolation('tab_switch', 'You switched away from the exam tab.', { tabSwitch: true });

        return next;

      });

    };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

    };

  }, [handleSubmit, isSubmitted, recordViolation]);
  useEffect(() => {

    if (isSubmitted) return;

    const resetIdleTimer = () => {

        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
        }

        idleTimerRef.current = setTimeout(() => {

            setIdleWarningCount((count) => {

                const next = count + 1;

                recordViolation('idle', 'You have been inactive for 2 minutes.', { idleWarning: true });

                return next;

            });

        }, 120000); // 2 minutes

    };

    resetIdleTimer();

    window.addEventListener("mousemove", resetIdleTimer);
    window.addEventListener("keydown", resetIdleTimer);
    window.addEventListener("scroll", resetIdleTimer);
    window.addEventListener("click", resetIdleTimer);

    return () => {

        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
        }

        window.removeEventListener("mousemove", resetIdleTimer);
        window.removeEventListener("keydown", resetIdleTimer);
        window.removeEventListener("scroll", resetIdleTimer);
        window.removeEventListener("click", resetIdleTimer);

    };

}, [isSubmitted, handleSubmit, sendHeartbeat, recordViolation]);

  const question = examData?.questions?.[currentQuestion];
  const minutes = Math.floor(timeLeft / 60);
  const isWarningTime = timeLeft <= 300;
  const isCriticalTime = timeLeft <= 60;
  const seconds = timeLeft % 60;

  const getCodeAnswer = (currentQuestionData) => {
    const stored = answers[currentQuestionData.id];
    const fallbackLanguage = currentQuestionData.language === 'any' ? 'javascript' : currentQuestionData.language;

    if (stored && typeof stored === 'object') {
      return {
        language: stored.language || fallbackLanguage,
        source: stored.source || '',
      };
    }

    return {
      language: fallbackLanguage,
      source: '',
    };
  };

  const handleAnswerSelect = (questionId, answerId) => {

    setAnswers((current) => ({
      ...current,
      [questionId]: answerId,
    }));

    setAutoSaving(true);

    setStatusMessage("Option selected.");

    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeout = setTimeout(() => {

      handleSaveAnswer();

      setAutoSaving(false);

    }, 2000);

    setAutoSaveTimeout(timeout);

  };

  const updateDescriptiveAnswer = (questionId, value) => {

    setAnswers((current) => ({
      ...current,
      [questionId]: value
    }));

    setAutoSaving(true);

    if (autoSaveTimeout) {

      clearTimeout(autoSaveTimeout);

    }

    const timeout = setTimeout(() => {

      handleSaveAnswer();

      setAutoSaving(false);

    }, 2000);

    setAutoSaveTimeout(timeout);

  };

  const updateCodeAnswer = (questionId, field, value) => {

    setAnswers((current) => {

      const previous =
        current[questionId] &&
          typeof current[questionId] === "object"
          ? current[questionId]
          : {
            language: "javascript",
            source: "",
          };

      return {

        ...current,

        [questionId]: {

          ...previous,

          [field]: value,

        },

      };

    });

    setAutoSaving(true);

    if (autoSaveTimeout) {

      clearTimeout(autoSaveTimeout);

    }

    const timeout = setTimeout(() => {

      handleSaveAnswer();

      setAutoSaving(false);

    }, 2000);

    setAutoSaveTimeout(timeout);

  };

  const handleSaveAnswer = () => {
    if (!question) return;

    if (question.type === 'mcq' && !answers[question.id]) {
      setStatusMessage('Please select an option before saving.');
      return;
    }

    if (question.type === 'descriptive' && !String(answers[question.id] || '').trim()) {
      setStatusMessage('Please write an answer before saving.');
      return;
    }

    if (question.type === 'code') {
      const codeAnswer = getCodeAnswer(question);
      if (!codeAnswer.source.trim()) {
        setStatusMessage('Write your code before saving.');
        return;
      }
    }

    setSavedQuestions((current) => ({ ...current, [question.id]: true }));
    setStatusMessage('Answer saved. You can resume later from the dashboard.');
  };

  const handleRunCode = async () => {
    if (!question || question.type !== "code") return;

    const codeAnswer = getCodeAnswer(question);

    let source = codeAnswer.source;

    // Agar C++ hai to wrapper add karo
    if (codeAnswer.language === "cpp") {
      source = `
#include <bits/stdc++.h>
using namespace std;

${codeAnswer.source}

int main() {
    int t;
    cin >> t;

    while (t--) {
        long long n;
        cin >> n;
        ${question.functionName}(n);
    }

    return 0;
}
`;
    }

    try {
      setIsRunningCode(true);
      const results = [];

      for (let i = 0; i < question.testCases.length; i++) {
        const tc = question.testCases[i];

        const start = performance.now();

        const response = await requestJson("/api/run", {
          method: "POST",
          body: JSON.stringify({
            language: codeAnswer.language,
            source: source,
            input: tc.input,
          }),
        });

        const end = performance.now();

        const got = (response.stdout || "").trim();
        const expected = (tc.expected || "").trim();

        results.push({
          id: i + 1,
          input: tc.input,
          expected,
          got,
          stderr: response.stderr || "",
          exitCode: response.exitCode || 0,
          passed:
            response.exitCode === 0 &&
            got === expected,
          time: ((end - start) / 1000).toFixed(2) + "s",
        });

        // Compile error aaye to wahi stop
        if (response.stderr || response.exitCode !== 0) {
          break;
        }
      }

      setRunResults({
        ...runResults,
        [question.id]: results,
      });

      setStatusMessage("Code executed successfully.");
    } catch (error) {
      setRunResults({
        ...runResults,
        [question.id]: [
          {
            id: "ERROR",
            input: "",
            expected: "",
            got: "",
            stderr: error.message,
            exitCode: 1,
            passed: false,
            time: "0s",
          },
        ],
      });

      setStatusMessage("Execution failed.");
    } finally {
      setIsRunningCode(false);
    }
  };
  const handleNext = () => {

    if (!examData) return;

    if (currentQuestion === examData.questions.length - 1) {

      setCurrentQuestion(0);

    }

    else {

      setCurrentQuestion(currentQuestion + 1);

    }

  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((current) => current - 1);
    }
  };
  const handleSaveAndNext = () => {

    handleSaveAnswer();

    handleNext();

  };
  const handleMarkForReview = () => {

    if (!markedQuestions.includes(currentQuestion)) {

      setMarkedQuestions((prev) => [

        ...prev,

        currentQuestion

      ]);

    }

    handleSaveAnswer();

    handleNext();

  };
  const getQuestionStatus = (index) => {

    const answered =
      answers[index] !== undefined &&
      answers[index] !== null &&
      answers[index] !== "";

    const marked = markedQuestions.includes(index);

    if (currentQuestion === index) {
      return "CURRENT";
    }

    if (answered && marked) {
      return "ANSWERED_REVIEW";
    }

    if (answered) {
      return "ANSWERED";
    }

    if (marked) {
      return "REVIEW";
    }

    return "NOT_ANSWERED";

  };
  async function handleSubmit() {

  if (submitting) return;

  setSubmitting(true);

  try {

    const response = await requestJson(
      `/api/exams/${examData.id}/submit`,
      {
        method: "POST",
        body: JSON.stringify({
          answers,
        }),
      }
    );

    setIsSubmitted(true);

    setAttemptCount((current) => current + 1);

    setStatusMessage(
      response.message || "Exam submitted successfully."
    );

    // Remove local saved progress

    const storedAttempts = getStoredAttempts();

    delete storedAttempts[String(examData.id)];

    window.localStorage.setItem(
      getStorageKey(),
      JSON.stringify(storedAttempts)
    );

    sessionStorage.removeItem("examAttempt");

  }

  catch (error) {

    setStatusMessage(error.message || "Failed to submit exam.");

  }

  finally {

    setSubmitting(false);

  }

  }

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
          <div className="flex justify-center">
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

  const currentCodeAnswer = question.type === 'code' ? getCodeAnswer(question) : null;


  return (
    <div className="min-h-screen select-none bg-gradient-to-br from-student-50 to-student-100">
      <div className="sticky top-0 z-50 border-b border-student-200 bg-white/80 backdrop-blur-md">
        <div className="w-full px-4 py-4 sm:px-6 xl:px-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{examData.title}</h1>
              <p className="text-gray-600">{examData.description}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-sm text-gray-500">Time Remaining</div>
                <div
                  className={`text-2xl font-mono font-bold transition-all duration-300

  ${isCriticalTime
                      ? "text-red-600 animate-pulse"

                      : isWarningTime
                        ? "text-orange-500"

                        : "text-student-600"
                    }`}
                >
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  {isCriticalTime && (
                    <p className="mt-1 text-xs font-semibold text-red-600 animate-pulse">
                      ⚠ Less than 1 minute remaining
                    </p>
                  )}

                  {!isCriticalTime && isWarningTime && (
                    <p className="mt-1 text-xs font-semibold text-orange-500">
                      ⏰ Less than 5 minutes remaining
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-1 text-right">
                {autoSaving ? (
                  <span className="text-yellow-500 text-xs font-medium">
                    Saving...
                  </span>
                ) : (
                  <span className="text-green-600 text-xs font-medium">
                    ✓ Saved
                  </span>
                )}
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

      <div className="w-full px-4 py-6 sm:px-6 xl:px-10 xl:py-8">
        {statusMessage && (
          <div className="mb-6 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
            {statusMessage}
          </div>
        )}

        {violationCount > 0 && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span className="font-semibold">Security warning</span>
            <span>Warning {violationCount} / 3</span>
          </div>
        )}

        <div className="mb-8 grid gap-6 2xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-3xl border border-student-100/50 bg-white/70 p-8 shadow-2xl backdrop-blur-sm">
            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">Q{currentQuestion + 1}. {question.title || question.text}</h2>
              {question.type === 'mcq' && <p className="text-sm text-gray-600">Choose the best option, then save it to keep your progress.</p>}
              {question.type === 'descriptive' && <p className="text-sm text-gray-600">Write a clear descriptive answer, then save it to keep your progress.</p>}
              {question.type === 'code' && <p className="text-sm text-gray-600">Write your solution, run it if needed, then save it to keep your progress.</p>}
            </div>

            {question.type === 'mcq' && (
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <button
                    key={option.id}
                    onClick={() => handleAnswerSelect(question.id, option.id)}
                    className={`group flex w-full items-start gap-4 rounded-2xl border-2 p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${answers[question.id] === option.id
                      ? 'border-student-500 bg-gradient-to-r from-student-50 to-student-100 shadow-student-lg ring-4 ring-student-200/50'
                      : 'border-gray-200 hover:border-student-300 hover:bg-gray-50'
                      }`}
                  >
                    <span className="w-12 flex-shrink-0 text-xl font-bold text-student-500 transition-colors group-hover:text-student-600">{String.fromCharCode(65 + index)}.</span>
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
            )}

            {question.type === 'descriptive' && (
              <div className="space-y-4">
                <textarea
                  rows={10}
                  value={answers[question.id] || ''}
                  onChange={(event) => updateDescriptiveAnswer(question.id, event.target.value)}
                  className="w-full rounded-2xl border-2 border-gray-200 bg-white px-5 py-4 text-base leading-7 text-gray-800 outline-none transition focus:border-student-400 focus:ring-4 focus:ring-student-100"
                  placeholder="Write your descriptive answer here..."
                />
              </div>
            )}

            {question.type === 'code' && (
              <div className="space-y-5">
                <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="rounded-2xl border border-gray-200 bg-slate-50 p-4">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">Language</label>
                    <select
                      value={currentCodeAnswer.language}
                      onChange={(event) => {
                        if (question.language !== 'any') return;
                        updateCodeAnswer(question.id, 'language', event.target.value);
                      }}
                      disabled={question.language !== 'any'}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
                    >
                      {(question.language === 'any' ? CODE_LANGUAGE_OPTIONS : CODE_LANGUAGE_OPTIONS.filter((item) => item.value === question.language)).map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                      ))}
                    </select>
                    {question.language !== 'any' ? (
                      <p className="mt-2 text-xs text-slate-500">This question is locked to {CODE_LANGUAGE_OPTIONS.find((item) => item.value === question.language)?.label || question.language}.</p>
                    ) : (
                      <p className="mt-2 text-xs text-slate-500">Students may choose any language for this question.</p>
                    )}
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-3">
                    <Editor
                      height="320px"
                      language={currentCodeAnswer.language}
                      theme="vs-light"
                      value={currentCodeAnswer.source}
                      onChange={(value) => updateCodeAnswer(question.id, 'source', value || '')}
                      options={{ minimap: { enabled: false }, fontSize: 14, scrollBeyondLastLine: false, wordWrap: 'on' }}
                    />
                  </div>
                </div>

                {(question.constraints || question.sampleInput || question.sampleOutput || question.testCases.length > 0) && (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {question.constraints && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-900">Constraints</p>
                        <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{question.constraints}</pre>
                      </div>
                    )}
                    {(question.testCases[0]?.input || question.testCases[0]?.expected || question.sampleInput || question.sampleOutput) && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-900">Sample Case</p>
                        <div className="mt-2 grid gap-3 text-sm text-slate-700">
                          <div>
                            <p className="font-semibold text-slate-600">Input</p>
                            <pre className="mt-1 whitespace-pre-wrap rounded-xl bg-white p-3">{question.testCases[0]?.input || question.sampleInput || ''}</pre>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-600">Expected Output</p>
                            <pre className="mt-1 whitespace-pre-wrap rounded-xl bg-white p-3">{question.testCases[0]?.expected || question.sampleOutput || ''}</pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleRunCode}
                    disabled={isRunningCode}
                    className="rounded-2xl border border-cyan-200 bg-cyan-50 px-5 py-3 text-sm font-semibold text-cyan-700 hover:bg-cyan-100"
                  >
                    {isRunningCode ? 'Running code...' : 'Run code'}
                  </button>
                  <button
                    onClick={() => setAnswers((current) => ({
                      ...current,
                      [question.id]: {
                        ...(typeof current[question.id] === 'object' ? current[question.id] : { language: currentCodeAnswer.language, source: '' }),
                        source: '',
                      },
                    }))}
                    className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Clear code
                  </button>
                </div>

                {Array.isArray(runResults[question.id]) && (
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-slate-900 p-4 text-white">
                      <h3 className="text-lg font-bold">
                        Passed {runResults[question.id].filter(r => r.passed).length} / {runResults[question.id].length}
                      </h3>
                    </div>

                    {runResults[question.id].map((result) => (
                      <div
                        key={result.id}
                        className={`rounded-2xl border p-4 ${result.passed
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                          }`}
                      >
                        <div className="flex justify-between">
                          <h4 className="font-semibold">Test Case #{result.id}</h4>
                          <span className={result.passed ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                            {result.passed ? 'PASS' : 'FAIL'}
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-4">
                          <div>
                            <p className="font-semibold">Input</p>
                            <pre>{result.input}</pre>
                          </div>
                          <div>
                            <p className="font-semibold">Expected</p>
                            <pre>{result.expected}</pre>
                          </div>
                          <div>
                            <p className="font-semibold">Your Output</p>
                            <pre>{result.got}</pre>
                          </div>
                        </div>

                        {result.stderr && (
                          <div className="mt-3 rounded bg-red-100 p-3 text-red-700">
                            <pre>{result.stderr}</pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
                    className={`
                      w-10
                      h-10
                      rounded-lg
                      font-semibold
                      transition-all
                      duration-200

                      ${getQuestionStatus(index) === "CURRENT"
                        ? "bg-blue-600 text-white"

                        : getQuestionStatus(index) === "ANSWERED_REVIEW"
                          ? "bg-purple-600 text-white"

                          : getQuestionStatus(index) === "ANSWERED"
                            ? "bg-green-600 text-white"

                            : getQuestionStatus(index) === "REVIEW"
                              ? "bg-orange-500 text-white"

                              : "bg-gray-200 text-gray-700"
                      }
                      `}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 border-t border-slate-700 pt-4">

              <h3 className="text-sm font-semibold text-slate-300 mb-3">
                Question Status
              </h3>

              <div className="space-y-2 text-xs">

                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-600"></div>
                  <span>Current Question</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-600"></div>
                  <span>Answered</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-orange-500"></div>
                  <span>Marked For Review</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-purple-600"></div>
                  <span>Answered & Review</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-300 border border-gray-500"></div>
                  <span>Not Answered</span>
                </div>

              </div>

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
                onClick={handleSaveAndNext}
                disabled={question.type === 'mcq' ? !answers[question.id] : question.type === 'descriptive' ? !String(answers[question.id] || '').trim() : !getCodeAnswer(question).source.trim()}
                className="flex items-center justify-center gap-3 rounded-2xl border border-student-300 bg-white px-6 py-4 text-lg font-semibold text-student-700 shadow-sm transition-all duration-300 hover:bg-student-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save & Next
              </button>
              <button

                onClick={handleMarkForReview}

                className="rounded-lg bg-orange-500 hover:bg-orange-600 px-5 py-2 font-medium text-white"

              >

                Mark for Review & Next

              </button>
              <button
                onClick={handleConfirmSubmit}
                disabled={Object.keys(answers).length === 0 || submitting}
                className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-student-600 to-student-700 px-10 py-4 text-lg font-bold text-white shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:from-student-700 hover:to-student-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {submitting ? "Submitting..." : "Submit Exam"}
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
