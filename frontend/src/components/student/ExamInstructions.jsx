import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { requestJson } from "../../global/api";

const formatDuration = (value) => {
  const total = Number(value);
  if (!Number.isFinite(total) || total <= 0) return "—";
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return [
    hours ? `${hours} hr${hours === 1 ? "" : "s"}` : null, 
    minutes ? `${minutes} min` : null
  ].filter(Boolean).join(" ");
};

const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const ExamInstructions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInstructions();
  }, []);

  const loadInstructions = async () => {
    try {
      const data = await requestJson(`/api/exams/${examId}/instructions`);
      setExam(data.exam);
      if (data.exam?.is_submitted) {
        setError("This exam has already been submitted.");
      }
    } catch (err) {
      setError(err.message || "Unable to load exam instructions.");
    } finally {
      setLoading(false);
    }
  };

  const startExam = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        setError("Please allow Fullscreen Mode to start the exam.");
        return;
      }
    }
    try {
      setStarting(true);
      setError("");

      const data = await requestJson(`/api/exams/${examId}/start`, {
        method: "POST",
      });

      // Store attempt information
      sessionStorage.setItem(
        "examAttempt",
        JSON.stringify({
          attemptId: data.attemptId,
          remainingSeconds: data.remainingSeconds,
          startedAt: data.startedAt,
          resumed: data.resumed,
        })
      );

      navigate(`/exam/${examId}`);
    } catch (err) {
      setError(err.message || "Unable to start exam.");
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <h2 className="text-lg font-semibold text-slate-700">Loading instructions...</h2>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-lg border border-slate-200">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
             <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
          </div>
          <p className="mb-6 font-medium text-slate-800">{error || "Exam instructions are unavailable."}</p>
          <button onClick={() => navigate('/student-dashboard')} className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 w-full">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center select-none font-sans">
      <main className="w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        
        {/* Header Section */}
        <div className="bg-slate-900 px-8 py-10 text-white sm:px-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
             <svg width="300" height="300" viewBox="0 0 24 24" fill="currentColor">
               <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
             </svg>
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-400">Exam Instructions</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              {exam.title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-300">
              Please read all guidelines carefully. The timer will begin immediately after you agree and continue.
            </p>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          
          {/* Exam Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-3 mb-10">
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 text-blue-900">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Duration
              </p>
              <p className="text-xl font-bold">{formatDuration(exam.duration_minutes)}</p>
            </div>
            
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5 text-emerald-900">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Total Marks
              </p>
              <p className="text-xl font-bold">{exam.total_marks}</p>
            </div>

            <div className="rounded-xl border border-purple-100 bg-purple-50 p-5 text-purple-900">
              <p className="text-xs font-bold uppercase tracking-wider text-purple-600 mb-1 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Exam Window
              </p>
              <p className="text-sm font-bold mt-1.5">Ends: {formatDateTime(exam.end_datetime)}</p>
            </div>
          </div>

          {/* Instructions List */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">
                General Guidelines
              </h2>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Read every question carefully before answering.
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Use the <strong>Save & Next</strong> button to ensure your answer is recorded before moving to the next question.
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  A stable internet connection is required to sync your progress.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-red-600 border-b border-red-100 pb-2 mb-4">
                Strict Rules & Warnings
              </h2>
              <ul className="space-y-3 text-slate-700 bg-red-50 p-5 rounded-xl border border-red-100">
                <li className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  <span>Do <strong>NOT</strong> switch tabs, open new windows, or minimize the browser during the exam.</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  <span>Do <strong>NOT</strong> exit Fullscreen mode. Exiting fullscreen will trigger a security warning.</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  <span>Do <strong>NOT</strong> refresh the page. Repeated violations will result in automatic submission.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-200">
            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
                <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Declaration Checkbox */}
            <label className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-5 transition-all ${
                accepted ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
              }`}>
              <div className="flex h-6 items-center">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                />
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${accepted ? 'text-blue-900' : 'text-slate-900'}`}>Declaration</p>
                <p className={`text-sm mt-1 ${accepted ? 'text-blue-700' : 'text-slate-600'}`}>
                  I have read and understood all the instructions. I confirm that I will not use any unfair means during the examination.
                </p>
              </div>
            </label>

            {/* Action Button */}
            <button
              disabled={!accepted || starting || exam.is_submitted}
              onClick={startExam}
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-8 py-4 text-lg font-bold text-white shadow-lg transition-all duration-200 
                ${
                  !accepted || exam.is_submitted
                    ? 'cursor-not-allowed bg-slate-300 shadow-none'
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30'
                }
              `}
            >
              {exam.is_submitted ? (
                "Exam Already Submitted"
              ) : starting ? (
                <>
                   <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   Starting Exam...
                </>
              ) : (
                <>
                  Agree & Start Exam
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
                </>
              )}
            </button>
            {!exam.is_submitted && (
              <p className="mt-3 text-center text-xs text-slate-500">
                Clicking this button will switch your browser to <strong>Fullscreen Mode</strong>.
              </p>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default ExamInstructions;