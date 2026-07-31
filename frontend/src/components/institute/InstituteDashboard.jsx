import React, { useCallback, useEffect, useState } from 'react';
import Header from './InstituteHeader';
import StatsCards from './InstituteStatesCards';
import DepartmentList from './DepartmentList';
import QuickActions from './InstituteQuickActions';
import { requestJson } from '../../global/api';
import { getStoredAuth } from '../../global/authStorage';

const InstituteDashboard = () => {
  const auth = getStoredAuth();
  const instituteId = auth?.instituteId ?? auth?.user?.institute_id;
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const loadDashboard = useCallback(async () => {
    setLoading(true); setError('');
    try { setDashboard(await requestJson('/api/institute/dashboard')); }
    catch (err) { setError(err.message || 'Unable to load your institute dashboard.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadDashboard(); }, [loadDashboard]);
  return <main className="min-h-screen bg-slate-50 text-slate-900"><div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7"><Header />
    {error && <div className="mt-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button onClick={loadDashboard} className="font-semibold underline">Try again</button></div>}
    <section aria-label="Institute performance overview" className="mt-6"><StatsCards summary={dashboard?.summary} loading={loading} /></section>
    <section className="mt-7 grid grid-cols-1 gap-7 xl:grid-cols-[minmax(0,1fr)_360px]"><DepartmentList instituteId={instituteId} departments={dashboard?.departments || []} loading={loading} onChange={loadDashboard} /><aside className="space-y-7"><QuickActions activity={dashboard?.activity || []} settings={dashboard?.settings || {}} loading={loading} /></aside></section>
  </div></main>;
};
export default InstituteDashboard;
