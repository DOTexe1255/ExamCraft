import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { requestJson } from "../../global/api";

const formatDuration = (value) => {
    const total = Number(value);
    if (!Number.isFinite(total) || total <= 0) return "—";
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    return [hours ? `${hours} hr${hours === 1 ? "" : "s"}` : null, minutes ? `${minutes} min` : null].filter(Boolean).join(" ");
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

        }

        catch (err) {

            setError(err.message || "Unable to load exam instructions.");

        }

        finally {

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

        }

        catch (err) {

            setError(err.message || "Unable to start exam.");

        }

        finally {

            setStarting(false);

        }

    };

    if (loading) {

        return <h2>Loading...</h2>;

    }

    if (!exam) {
        return (
            <div className="max-w-5xl mx-auto p-10">
                <p className="text-red-600">{error || "Exam instructions are unavailable."}</p>
                <button onClick={() => navigate('/student-dashboard')} className="mt-4 rounded bg-slate-700 px-4 py-2 text-white">
                    Back to dashboard
                </button>
            </div>
        );
    }

    return (

        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-8 sm:px-6 lg:py-12">
          <main className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-student-700 to-indigo-700 px-6 py-8 text-white sm:px-10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">Exam instructions</p>
              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">

                {exam.title}

              </h1>
              <p className="mt-3 max-w-2xl text-blue-100">Read the instructions carefully before entering the exam. Your timer begins after you continue.</p>
            </div>

            <div className="p-6 sm:p-10">
            <div className="grid gap-4 sm:grid-cols-3">

                <div className="rounded-2xl bg-blue-50 p-4 text-blue-950"><p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Duration</p><p className="mt-1 text-lg font-bold">{formatDuration(exam.duration_minutes)}</p></div>

                <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-950"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Total marks</p><p className="mt-1 text-lg font-bold">{exam.total_marks}</p></div>

                <div className="rounded-2xl bg-violet-50 p-4 text-violet-950"><p className="text-xs font-semibold uppercase tracking-wide text-violet-600">Exam window</p><p className="mt-1 text-sm font-bold">Ends: {formatDateTime(exam.end_datetime)}</p></div>

            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">

                <h2 className="text-xl font-semibold">

                    Instructions

                </h2>

                <ul className="mt-4 space-y-3 text-slate-700">

                    <li>Read every question carefully before answering.</li>

                    <li>Do not refresh browser.</li>

                    <li>Do not switch tabs.</li>

                    <li>Exam will auto submit.</li>

                    <li>Internet connection is required.</li>

                    <li>Use Save & Next after every answer.</li>

                </ul>

            </div>

            <div className="mt-8 border-t border-slate-200 pt-6">

                {error && (
                    <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700" role="alert">
                        {error}
                    </div>
                )}

                <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-slate-700">

                    <input

                        type="checkbox"

                        checked={accepted}

                        onChange={(e) => setAccepted(e.target.checked)}

                    />

                    I have read all instructions.

                </label>

            </div>

            <button

                disabled={!accepted || starting || exam.is_submitted}

                onClick={startExam}

                className="mt-6 w-full rounded-xl bg-student-600 px-6 py-4 font-semibold text-white shadow-lg transition hover:bg-student-700 disabled:cursor-not-allowed disabled:bg-slate-400"

            >

                {exam.is_submitted ? "Exam Submitted" : starting ? "Starting..." : "Agree & Continue"}

            </button>

            </div>
          </main>
        </div>

    );

};

export default ExamInstructions;
