import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const getStoredAttempts = () => {
  if (typeof window === 'undefined') return {};

  try {
    return JSON.parse(window.localStorage.getItem('examcraft_student_attempts') || '{}');
  } catch {
    return {};
  }
};

const statusTone = {
  active: 'bg-emerald-50 text-emerald-700',
  scheduled: 'bg-sky-50 text-sky-700',
  draft: 'bg-amber-50 text-amber-700',
};

const getExamType = (exam) => {
  const instructions = typeof exam.instructions === 'string' ? exam.instructions.split('\n').filter(Boolean) : [];
  const match = instructions.find((line) => line.toLowerCase().startsWith('exam type:'));
  if (match) return match.replace(/^exam type:\s*/i, '');
  return 'General assessment';
};

const formatDate = (value) => {
  if (!value) return 'TBA';

  const text = String(value).trim();
  const matched = text.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);

  if (matched) {
    const [, year, month, day, hours, minutes, seconds = '00'] = matched;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes), Number(seconds));

    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(parsed);
  }

  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(text));
  } catch {
    return text;
  }
};

const canStartExam = (exam) => {
  if (!exam?.start_datetime) return false;

  try {
    const raw = String(exam.start_datetime).trim();
    const normalized = raw.includes('T') ? raw.replace(' ', 'T') : raw.replace(' ', 'T');
    const parsed = new Date(normalized);
    const startTime = Number.isNaN(parsed.getTime()) ? new Date(raw.replace(/(\d{4})-(\d{2})-(\d{2})\s(\d{2}):(\d{2})/, '$1-$2-$3T$4:$5')).getTime() : parsed.getTime();
    return Date.now() >= startTime;
  } catch {
    return false;
  }
};

const AvailableExams = ({ exams, loading }) => {
  const [filter, setFilter] = useState('all');
  const [selectedExamId, setSelectedExamId] = useState(null);
  const navigate = useNavigate();

  const visible = useMemo(
    () => (filter === 'all' ? exams : exams.filter((exam) => exam.status === filter)),
    [exams, filter]
  );

  const selectedExam = useMemo(
    () => exams.find((exam) => Number(exam.exam_id) === Number(selectedExamId)) || null,
    [exams, selectedExamId]
  );

  const savedAttempts = useMemo(() => getStoredAttempts(), [exams]);

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Join an exam</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                {exams.length} available
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Browse all live institute exams, review the details, and enter the exam when it is ready.
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto">
          {['all', 'active', 'scheduled', 'draft'].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${
                filter === item ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {loading ? (
          <p className="px-6 py-14 text-center text-sm text-slate-500">Loading your assessments…</p>
        ) : visible.length ? (
          visible.map((exam) => {
            const isSelected = Number(selectedExamId) === Number(exam.exam_id);
            const isExamOpen = canStartExam(exam);
            const savedAttempt = savedAttempts[String(exam.exam_id)];
            const canResume = Boolean(savedAttempt && !savedAttempt.isSubmitted && Number(savedAttempt.timeLeft || 0) > 0);
            return (
              <article key={exam.exam_id} className="px-5 py-5 transition hover:bg-slate-50/80 sm:px-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.59a1 1 0 01.7.29l5.42 5.42a1 1 0 01.29.7V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-semibold text-slate-800">{exam.title}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusTone[exam.status] || statusTone.scheduled}`}>
                          {exam.status || 'scheduled'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{exam.description || 'No description available.'}</p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span>Type: {getExamType(exam)}</span>
                        <span>Duration: {exam.duration_minutes || '—'} min</span>
                        <span>Marks: {exam.total_marks || '—'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setSelectedExamId(isSelected ? null : exam.exam_id)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700"
                    >
                      {isSelected ? 'Hide details' : 'Enroll now'}
                    </button>
                    <button
                      onClick={() => {
                        if (isExamOpen || canResume) navigate(`/exam/${exam.exam_id}`);
                      }}
                      disabled={!(isExamOpen || canResume)}
                      className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {canResume ? 'Resume exam' : isExamOpen ? 'Start exam' : 'Upcoming'}
                    </button>
                  </div>
                </div>

                {isSelected && selectedExam && (
                  <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 text-sm text-slate-700">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="font-semibold text-slate-900">Exam details</p>
                        <p className="mt-1">{selectedExam.description || 'No description available.'}</p>
                      </div>
                      <div className="space-y-1">
                        <p><span className="font-semibold">Starts:</span> {formatDate(selectedExam.start_datetime)}</p>
                        <p><span className="font-semibold">Duration:</span> {selectedExam.duration_minutes || '—'} mins</p>
                        <p><span className="font-semibold">Total marks:</span> {selectedExam.total_marks || '—'}</p>
                        <p><span className="font-semibold">Type:</span> {getExamType(selectedExam)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <div className="px-6 py-14 text-center">
            <p className="font-medium text-slate-700">No {filter === 'all' ? '' : filter} exams</p>
            <p className="mt-1 text-sm text-slate-500">Live or scheduled assessments will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default AvailableExams;
