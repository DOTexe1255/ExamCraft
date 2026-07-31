import React, { useCallback, useEffect, useState } from 'react';
import Header from './Header';
import StatsCards from './StatsCards';
import AvailableExams from './AvailableExams';
import Sidebar from './sidebar/Sidebar';
import { requestJson } from '../../global/api';

const StudentDashboard = () => {
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const loadDashboard = useCallback(async () => { setLoading(true); setError(''); try { setData(await requestJson('/api/student/dashboard')); } catch (err) { setError(err.message || 'Unable to load your dashboard.'); } finally { setLoading(false); } }, []);
  useEffect(() => { loadDashboard(); }, [loadDashboard]);
  return <main className="min-h-screen bg-slate-50"><div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7"><Header />{error && <div className="mt-6 flex justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button onClick={loadDashboard} className="font-semibold underline">Try again</button></div>}<section className="mt-6"><StatsCards summary={data?.summary} loading={loading} /></section><section className="mt-7 grid grid-cols-1 gap-7 xl:grid-cols-[minmax(0,1fr)_360px]"><AvailableExams exams={data?.exams || []} loading={loading} /><aside><Sidebar exams={data?.exams || []} loading={loading} /></aside></section></div></main>;
};
export default StudentDashboard;
