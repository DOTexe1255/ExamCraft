import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredAuth } from '../../global/authStorage';

const getStorageKey = () => {
  const auth = getStoredAuth();
  const userId = auth?.userId ?? auth?.user?.id ?? auth?.user?.user_id ?? 'anonymous';
  return `examcraft_student_attempts_${userId}`;
};

const getStoredAttempts = () => {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(getStorageKey()) || '{}');
  } catch {
    return {};
  }
};

const statusTone = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-slate-100 text-slate-700 border-slate-200',
};

const getExamType = (exam) => {
  const instructions = typeof exam.instructions === 'string' ? exam.instructions.split('\n').filter(Boolean) : [];
  const match = instructions.find((line) => line.toLowerCase().startsWith('exam type:'));
  if (match) return match.replace(/^exam type:\s*/i, '');
  return 'General assessment';
};

const formatDuration = (value) => {
  const total = Number(value);
  if (!Number.isFinite(total) || total <= 0) return '—';
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return [hours ? `${hours} hr${hours === 1 ? '' : 's'}` : null, minutes ? `${minutes} min` : null].filter(Boolean).join(' ');
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

const getExamEndTime = (exam) => {
  if (!exam?.start_datetime) return null;

  if (exam.end_datetime) {
    const configuredEnd = new Date(exam.end_datetime);
    if (!Number.isNaN(configuredEnd.getTime())) {
      return configuredEnd;
    }
  }

  const startTime = new Date(exam.start_datetime).getTime();
  const durationMinutes = Number(exam.duration_minutes || 0);

  if (Number.isNaN(startTime) || !Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return null;
  }

  return new Date(startTime + (durationMinutes * 60000));
};

const isCompletedExam = (exam, savedAttempt) => {
  const examWindowEnd = getExamEndTime(exam);
  const attemptStartedAt = savedAttempt?.startedAt || exam.started_at;
  const attemptEnd = attemptStartedAt
    ? new Date(new Date(attemptStartedAt).getTime() + (Number(exam.duration_minutes || 0) * 60000))
    : null;
  const submitted = Boolean(
    savedAttempt?.isSubmitted ||
    exam.is_submitted ||
    exam.submitted_at ||
    exam.auto_submitted ||
    exam.assignment_status === 'SUBMITTED' ||
    exam.assignment_status === 'AUTO_SUBMITTED' ||
    exam.status === 'completed'
  );

  return submitted
    || Boolean(attemptEnd && !Number.isNaN(attemptEnd.getTime()) && Date.now() > attemptEnd.getTime())
    || Boolean(!attemptStartedAt && examWindowEnd && Date.now() > examWindowEnd.getTime());
};

const AvailableExams = ({ exams, loading }) => {
  const [filter, setFilter] = useState('all');
  const [selectedExamId, setSelectedExamId] = useState(null);
  const navigate = useNavigate();

  const savedAttempts = useMemo(() => getStoredAttempts(), []);

  const visible = useMemo(() => {
    return exams.filter((exam) => {
      const savedAttempt = savedAttempts[String(exam.exam_id)];
      const completed = isCompletedExam(exam, savedAttempt);

      if (filter === 'completed') {
        return completed;
      }

      if (filter === 'all') {
        return !completed && ['active', 'scheduled'].includes(exam.status);
      }

      return exam.status === filter && !completed;
    });
  }, [exams, filter, savedAttempts]);

  const selectedExam = useMemo(
    () => exams.find((exam) => Number(exam.exam_id) === Number(selectedExamId)) || null,
    [exams, selectedExamId]
  );

  const canStartCheck = (exam) => {
    const now = new Date();
    const start = new Date(exam.start_datetime);
    const end = getExamEndTime(exam);

    if (
      exam.is_submitted ||
      exam.submitted_at ||
      exam.auto_submitted ||
      exam.assignment_status === 'SUBMITTED' ||
      exam.assignment_status === 'AUTO_SUBMITTED'
    ) {
      return false;
    }

    if (Number.isNaN(start.getTime()) || now < start) {
      return false;
    }

    if (end && now > end) {
      return false;
    }

    return true;
  };

  const filterOptions = ['all', 'active', 'scheduled', 'completed'];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden font-sans">
      {/* Header Area */}
      <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.59a1 1 0 01.7.29l5.42 5.42a1 1 0 01.29.7V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900">Join an Assessment</h2>
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {visible.length} available
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Browse live institute exams, review details, and enter when ready.
                </p>
              </div>
            </div>
          </div>
          
          {/* Segmented Control Filters */}
          <div className="mt-2 md:mt-0">
            <div className="inline-flex items-center rounded-lg bg-slate-100 p-1 shadow-inner">
              {filterOptions.map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`capitalize px-4 py-1.5 text-sm font-semibold rounded-md transition-all duration-200 ${
                    filter === item
                      ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* List Area */}
      <div className="divide-y divide-slate-100 bg-white">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
             <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 mb-4"></div>
             <p className="text-sm font-medium">Loading your assessments...</p>
          </div>
        ) : visible.length ? (
          visible.map((exam) => {
            const isSelected = Number(selectedExamId) === Number(exam.exam_id);
            const isExamOpen = canStartCheck(exam);
            const savedAttempt = savedAttempts[String(exam.exam_id)];
            const canResume = Boolean(savedAttempt && !savedAttempt.isSubmitted && Number(savedAttempt.timeLeft || 0) > 0);
            const completed = isCompletedExam(exam, savedAttempt);
            const examStatus = completed ? 'completed' : (exam.status || 'scheduled');
            const actionLabel = completed ? 'Completed' : (canResume ? 'Resume Exam' : 'Start Exam');

            return (
              <article key={exam.exam_id} className="group p-6 transition-colors hover:bg-slate-50">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  
                  {/* Left: Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="truncate text-lg font-bold text-slate-900">{exam.title}</h3>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${statusTone[examStatus] || statusTone.scheduled}`}>
                        {examStatus}
                        {examStatus === 'active' && <span className="ml-1.5 flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-600 line-clamp-2">{exam.description || 'No description available.'}</p>
                    
                    {/* Metadata Pills */}
                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1">
                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="font-medium">{formatDuration(exam.duration_minutes)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1">
                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="font-medium">{exam.total_marks || '—'} Marks</span>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1">
                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        <span className="font-medium">{getExamType(exam)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-row items-center gap-3 lg:flex-col lg:items-end lg:justify-start lg:w-48 shrink-0">
                    <button
                      onClick={() => setSelectedExamId(isSelected ? null : exam.exam_id)}
                      className="flex-1 lg:flex-none lg:w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:ring-2 focus:ring-blue-600/20"
                    >
                      {isSelected ? 'Hide Details' : 'View Details'}
                    </button>
                    
                    <button
                      disabled={!isExamOpen || completed}
                      onClick={() => navigate(`/exam/${exam.exam_id}/instructions`)}
                      className={`flex-1 lg:flex-none lg:w-full rounded-xl px-4 py-2.5 text-sm font-bold transition-all focus:ring-2 focus:ring-offset-1 
                        ${
                          isExamOpen && !completed
                            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm focus:ring-blue-600"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                        }
                      `}
                    >
                      {actionLabel}
                    </button>
                  </div>
                </div>

                {/* Expandable Details Section */}
                {isSelected && selectedExam && (
                  <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <div className="p-5 grid gap-6 md:grid-cols-2 text-sm text-slate-700">
                      <div>
                        <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-wide text-xs">About this Exam</h4>
                        <p className="leading-relaxed">{selectedExam.description || 'No description available for this assessment.'}</p>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-2 uppercase tracking-wide text-xs">Schedule & Format</h4>
                        <ul className="space-y-2">
                          <li className="flex justify-between border-b border-slate-200/60 pb-1">
                            <span className="font-medium text-slate-500">Starts</span> 
                            <span className="text-slate-900 font-semibold">{formatDate(selectedExam.start_datetime)}</span>
                          </li>
                          <li className="flex justify-between border-b border-slate-200/60 pb-1">
                            <span className="font-medium text-slate-500">Available Until</span> 
                            <span className="text-slate-900 font-semibold">{formatDate(selectedExam.end_datetime)}</span>
                          </li>
                          <li className="flex justify-between border-b border-slate-200/60 pb-1">
                            <span className="font-medium text-slate-500">Format</span> 
                            <span className="text-slate-900 font-semibold">{getExamType(selectedExam)}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4 text-slate-400">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-900">No {filter === 'all' ? '' : filter} exams found</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm">
              {filter === 'completed'
                ? "You haven't completed any exams yet. Completed and submitted assessments will appear here."
                : "There are currently no live or scheduled assessments assigned to you in this category."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default AvailableExams;