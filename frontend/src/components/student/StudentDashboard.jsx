import React, { useCallback, useEffect, useState } from 'react';
import Header from './Header';
import StatsCards from './StatsCards';
import AvailableExams from './AvailableExams';
import Sidebar from './sidebar/Sidebar';
import { requestJson } from '../../global/api';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [dashboard, examResponse] = await Promise.all([
        requestJson('/api/student/dashboard'),
        requestJson('/api/exams'),
      ]);

      setData(dashboard);
      setExams(examResponse?.exams || []);
    } catch (err) {
      setError(err.message || 'Unable to load your dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        
        {/* Header Section */}
        <Header />

        {/* Error State Banner */}
        {error && (
          <div className="mt-6 flex flex-col items-start gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-900">Failed to load data</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <button 
              onClick={loadDashboard} 
              className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-600/20 w-full justify-center sm:w-auto"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
          </div>
        )}

        {/* Dashboard Content */}
        <div className="mt-8 flex flex-col gap-8">
          
          {/* Top Row: Statistics */}
          <section aria-label="Dashboard Statistics">
            <StatsCards summary={data?.summary} loading={loading} />
          </section>

          {/* Bottom Row: Main Content & Sidebar Grid */}
          <section aria-label="Exams and Notifications" className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
            
            {/* Left Column: Exam List */}
            <div className="flex flex-col gap-8">
              <AvailableExams exams={exams} loading={loading} />
            </div>

            {/* Right Column: Sidebar */}
            <aside className="sticky top-8">
              <Sidebar exams={exams} loading={loading} />
            </aside>
            
          </section>
        </div>
      </div>
    </main>
  );
};

export default StudentDashboard;