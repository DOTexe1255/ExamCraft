import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ExamInstructions = () => {

    const { examId } = useParams();

    const navigate = useNavigate();

    const [exam, setExam] = useState(null);

    const [loading, setLoading] = useState(true);

    const [accepted, setAccepted] = useState(false);

    const [starting, setStarting] = useState(false);

    useEffect(() => {

        loadInstructions();

    }, []);

    const loadInstructions = async () => {

        try {

            const response = await fetch(

                `http://localhost:5000/api/exams/${examId}/instructions`,

                {
                    credentials: "include"
                }

            );

            const data = await response.json();

            setExam(data.exam);

        }

        catch (err) {

            console.error(err);

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

                alert("Please allow Fullscreen Mode to start the exam.");

                return;

            }

        }
        try {

            setStarting(true);

            const response = await fetch(
                `http://localhost:5000/api/exams/${examId}/start`,
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to start exam");
            }

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

            console.error(err);

            alert(
                err.message || "Unable to start exam."
            );

        }

        finally {

            setStarting(false);

        }

    };

    if (loading) {

        return <h2>Loading...</h2>;

    }

    return (

        <div className="max-w-5xl mx-auto p-10">

            <h1 className="text-3xl font-bold">

                {exam.title}

            </h1>

            <div className="mt-6 space-y-2">

                <p>Duration : {exam.duration_minutes} Minutes</p>

                <p>Total Marks : {exam.total_marks}</p>

                <p>

                    Start :

                    {exam.start_datetime}

                </p>

                <p>

                    End :

                    {exam.end_datetime}

                </p>

            </div>

            <div className="mt-10">

                <h2 className="text-xl font-semibold">

                    Instructions

                </h2>

                <ul className="list-disc ml-6 mt-4 space-y-2">

                    <li>Read every question carefully.</li>

                    <li>Do not refresh browser.</li>

                    <li>Do not switch tabs.</li>

                    <li>Exam will auto submit.</li>

                    <li>Internet connection is required.</li>

                    <li>Use Save & Next after every answer.</li>

                </ul>

            </div>

            <div className="mt-8">

                <label className="flex gap-3">

                    <input

                        type="checkbox"

                        checked={accepted}

                        onChange={(e) => setAccepted(e.target.checked)}

                    />

                    I have read all instructions.

                </label>

            </div>

            <button

                disabled={!accepted || starting}

                onClick={startExam}

                className="mt-8 px-6 py-3 rounded bg-blue-600 text-white disabled:bg-gray-400"

            >

                Agree & Continue

            </button>

        </div>

    );

};

export default ExamInstructions;