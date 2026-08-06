import React, { useCallback, useEffect, useState } from 'react';
import Header from './Header';
import StatesCards from './StatesCards';
import ExamList from './ExamList';
import QuickActions from './QuickActions';
import { requestJson } from '../../global/api';
import { getStoredAuth } from '../../global/authStorage';
import LiveMonitoring from './LiveMonitoring';

const DepartmentDashboard = () => {
  const auth = getStoredAuth();
  const instituteId = auth?.instituteId ?? auth?.user?.institute_id;
  const departmentId = auth?.departmentId ?? auth?.user?.department_id;
  const [data, setData] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        <LiveMonitoring />
      </div>
    </main>
  );
};

export default DepartmentDashboard;
