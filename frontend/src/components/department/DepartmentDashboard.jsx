import React, { useCallback, useEffect, useState } from 'react';
import Header from './Header';
import StatesCards from './StatesCards';
import ExamList from './ExamList';
import QuickActions from './QuickActions';
import QuestionBankModal from './QuestionBankModal';
import { requestJson } from '../../global/api';
import { getStoredAuth } from '../../global/authStorage';

const DepartmentDashboard = () => {
  const auth = getStoredAuth();
  const instituteId = auth?.instituteId ?? auth?.user?.institute_id;
  const departmentId = auth?.departmentId ?? auth?.user?.department_id;
  const [data, setData] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [questionBankOpen, setQuestionBankOpen] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [dashboard, examResponse] = await Promise.all([
        requestJson('/api/department/dashboard'),
        requestJson('/api/exams'),
      ]);

      setData(dashboard);
      setExams(examResponse.exams || []);
    } catch (err) {
      setError(err.message || 'Unable to load department data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <Header />

        {error && (
          <div className="mt-6 flex justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button onClick={loadDashboard} className="font-semibold underline">
              Try again
            </button>
          </div>
        )}

        <section className="mt-6">
          <StatesCards summary={data?.summary} loading={loading} />
        </section>

        <section className="mt-6">
          <div className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-white to-cyan-50/60 p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Question bank</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Save groups of reusable questions and import them into exams later.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuestionBankOpen(true)}
                className="rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
              >
                + Add question bank
              </button>
            </div>
          </div>
        </section>

        <section className="mt-7 grid grid-cols-1 gap-7 xl:grid-cols-[minmax(0,1fr)_360px]">
          <ExamList
            exams={exams}
            loading={loading}
            instituteId={instituteId}
            departmentId={departmentId}
            onChange={loadDashboard}
          />
          <aside>
            <QuickActions
              students={data?.students || []}
              instituteId={instituteId}
              departmentId={departmentId}
              onChange={loadDashboard}
            />
          </aside>
        </section>
      </div>

      <QuestionBankModal
        isOpen={questionBankOpen}
        onClose={() => setQuestionBankOpen(false)}
        instituteId={instituteId}
        departmentId={departmentId}
        onSaved={loadDashboard}
      />
    </main>
  );
};

export default DepartmentDashboard;