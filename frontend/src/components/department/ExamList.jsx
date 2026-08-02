import React, { useMemo, useState } from 'react';
import CreateExamModal from './CreateExamModal';
import AddStudentModal from './AddStudentModal';
import { buildApiUrl, requestJson } from '../../global/api';

const statusStyles = {
  active: 'bg-emerald-50 text-emerald-700',
  scheduled: 'bg-sky-50 text-sky-700',
  draft: 'bg-amber-50 text-amber-700',
  completed: 'bg-slate-100 text-slate-700',
  cancelled: 'bg-red-50 text-red-700',
};

const toLocalDatetimeValue = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const ExamList = ({ exams, loading, instituteId, departmentId, onChange }) => {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [studentOpen, setStudentOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const visible = useMemo(() => (filter === 'all' ? exams : exams.filter((exam) => exam.status === filter)), [exams, filter]);

  const createExam = async (payload) => {
    await requestJson('/api/exams', { method: 'POST', body: JSON.stringify(payload) });
    setCreateOpen(false);
    await onChange();
  };

  const addStudent = async (payload) => {
    await requestJson('/api/auth/student-register', { method: 'POST', body: JSON.stringify(payload) });
    setStudentOpen(false);
    await onChange();
  };

  const downloadExamReport = async (examId) => {
    setDownloadingId(examId);

    try {
      const response = await fetch(buildApiUrl(`/api/exams/${examId}/report`), { credentials: 'include' });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Could not create exam report');
      }

      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = `exam-${examId}-report.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(error.message || 'Could not download report');
    } finally {
      setDownloadingId(null);
    }
  };

  const rescheduleExam = async (exam) => {
    const nextValue = window.prompt('Enter the new schedule time (YYYY-MM-DDTHH:mm)', toLocalDatetimeValue(exam.start_datetime));

    if (!nextValue) {
      return;
    }

    await requestJson(`/api/exams/${exam.exam_id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        start_date: nextValue,
        timezone_offset_minutes: new Date().getTimezoneOffset(),
      }),
    });

    await onChange();
  };

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Examinations</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{exams.length} total</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">Create and monitor your department assessments.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={() => setStudentOpen(true)} className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Add student
            </button>
            <button onClick={() => setCreateOpen(true)} className="rounded-xl bg-cyan-600 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700">
              + Create exam
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {['all', 'active', 'scheduled', 'draft', 'completed'].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${filter === item ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {loading ? (
          <p className="px-6 py-14 text-center text-sm text-slate-500">Loading examinations…</p>
        ) : visible.length ? (
          visible.map((exam) => (
            <article key={exam.exam_id} className="flex flex-col gap-4 px-5 py-5 transition hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-50 text-cyan-600">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-base font-semibold text-slate-900">{exam.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${statusStyles[exam.status] || statusStyles.draft}`}>{exam.status}</span>
                    {exam.exam_mode && <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-xs font-semibold capitalize text-cyan-700">{exam.exam_mode}</span>}
                  </div>

                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{exam.description}</p>

                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>Starts: {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(exam.start_datetime))}</span>
                    <span>Duration: {exam.duration_minutes} min</span>
                    <span>Total marks: {exam.total_marks}</span>
                    {exam.subject_label && <span>Subject: {exam.subject_label}</span>}
                    {exam.domain_label && <span>Domain: {exam.domain_label}</span>}
                    {Array.isArray(exam.sections) && exam.sections.length > 0 && <span>Sections: {exam.sections.length}</span>}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:justify-end">
                <button onClick={() => setSelected(exam)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Details
                </button>
                <button onClick={() => rescheduleExam(exam)} className="rounded-xl border border-cyan-200 px-3 py-2 text-xs font-semibold text-cyan-700 hover:bg-cyan-50">
                  Reschedule
                </button>
                {exam.status === 'completed' && (
                  <button
                    onClick={() => downloadExamReport(exam.exam_id)}
                    disabled={downloadingId === exam.exam_id}
                    className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                  >
                    {downloadingId === exam.exam_id ? 'Downloading...' : 'Report'}
                  </button>
                )}
              </div>
            </article>
          ))
        ) : (
          <p className="px-6 py-14 text-center text-sm text-slate-500">No examinations found for the selected filter.</p>
        )}
      </div>

      {selected && <ExamDetails exam={selected} onClose={() => setSelected(null)} onReschedule={() => rescheduleExam(selected)} />}
      <CreateExamModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onSubmit={createExam} instituteId={instituteId} departmentId={departmentId} />
      <AddStudentModal isOpen={studentOpen} onClose={() => setStudentOpen(false)} onSubmit={addStudent} instituteId={instituteId} departmentId={departmentId} />
    </section>
  );
};

const ExamDetails = ({ exam, onClose, onReschedule }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={onClose}>
    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
      <div className="flex items-start justify-between">
        <div>
          <span className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${statusStyles[exam.status] || statusStyles.draft}`}>{exam.status}</span>
          <h3 className="mt-3 text-xl font-semibold text-slate-900">{exam.title}</h3>
        </div>
        <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">✕</button>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">{exam.description}</p>

      <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
        <Metric label="Starts" value={new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(exam.start_datetime))} />
        <Metric label="Duration" value={`${exam.duration_minutes} minutes`} />
        <Metric label="Total marks" value={exam.total_marks} />
        <Metric label="Mode" value={exam.exam_mode || 'online'} />
      </dl>

      <div className="mt-6 flex gap-3">
        <button onClick={onReschedule} className="flex-1 rounded-xl border border-cyan-200 py-2.5 text-sm font-semibold text-cyan-700 hover:bg-cyan-50">
          Reschedule
        </button>
        <button onClick={onClose} className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white">
          Close
        </button>
      </div>
    </div>
  </div>
);

const Metric = ({ label, value }) => (
  <div className="rounded-xl bg-slate-50 p-3">
    <dt className="text-xs text-slate-500">{label}</dt>
    <dd className="mt-1 font-semibold text-slate-800">{value}</dd>
  </div>
);

export default ExamList;