import { useCallback, useEffect, useState } from 'react';
import { requestJson } from '../../global/api';

const formatRemaining = (value) => {
  const seconds = Math.max(0, Number(value) || 0);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
};

const LiveMonitoring = () => {
  const [exams, setExams] = useState([]);
  const [examId, setExamId] = useState('');
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const liveExams = await requestJson('/api/department/dashboard/live-exams');
      setExams(liveExams || []);
      const selectedId = examId || liveExams?.[0]?.exam_id;
      if (!selectedId) return;
      setExamId(String(selectedId));
      const data = await requestJson(`/api/department/dashboard/exams/${selectedId}/live`);
      setStudents(data.students || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Unable to load live monitoring.');
    }
  }, [examId]);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 10000);
    return () => window.clearInterval(timer);
  }, [load]);

  const forceSubmit = async (student) => {
    if (!window.confirm(`Force submit ${student.full_name || student.email}'s exam?`)) return;
    try {
      await requestJson(`/api/department/dashboard/exams/${examId}/students/${student.user_id}/force-submit`, { method: 'POST' });
      load();
    } catch (err) {
      setError(err.message || 'Could not force-submit the exam.');
    }
  };

  return <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div><h2 className="text-lg font-semibold text-slate-900">Live exam monitoring</h2><p className="text-sm text-slate-500">Updates every 10 seconds.</p></div>
      <select value={examId} onChange={(event) => setExamId(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
        <option value="">Select an exam</option>{exams.map((exam) => <option key={exam.exam_id} value={exam.exam_id}>{exam.title}</option>)}
      </select>
    </div>
    {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    {examId && <div className="mt-5 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">Student</th><th className="px-3 py-2">Question</th><th className="px-3 py-2">Time</th><th className="px-3 py-2">Tab</th><th className="px-3 py-2">Fullscreen</th><th className="px-3 py-2">Copy</th><th className="px-3 py-2">DevTools</th><th className="px-3 py-2">Idle</th><th className="px-3 py-2">Status</th><th className="px-3 py-2"></th></tr></thead><tbody>{students.map((student) => <tr key={student.user_id} className="border-b border-slate-100"><td className="px-3 py-3"><p className="font-medium text-slate-900">{student.full_name || student.email}</p><p className="text-xs text-slate-500">{student.email}</p></td><td className="px-3 py-3">{Number(student.current_question || 0) + 1}</td><td className="px-3 py-3">{formatRemaining(student.remaining_seconds)}</td><td className="px-3 py-3">{student.tab_switch_count || 0}</td><td className="px-3 py-3">{student.fullscreen_exit_count || 0}</td><td className="px-3 py-3">{student.copy_attempt_count || 0}</td><td className="px-3 py-3">{student.devtools_attempt_count || 0}</td><td className="px-3 py-3">{student.idle_warning_count || 0}</td><td className="px-3 py-3">{student.assignment_status}</td><td className="px-3 py-3">{!student.is_submitted && <button onClick={() => forceSubmit(student)} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700">Force submit</button>}</td></tr>)}</tbody></table></div>}
  </section>;
};

export default LiveMonitoring;
