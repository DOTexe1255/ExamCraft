import React from 'react';
import { useNavigate } from 'react-router-dom';
import { clearStoredAuth } from '../../global/authStorage';
import { useMyContext } from '../../global/AuthContext';

const InstituteHeader = () => {
  const navigate = useNavigate();
  const authContext = useMyContext();
  const auth = authContext?.auth || null;
  const displayName = [auth?.firstName || auth?.user?.first_name, auth?.lastName || auth?.user?.last_name].filter(Boolean).join(' ') || 'Institute Admin';
  const instituteLabel = auth?.instituteId || auth?.user?.institute_id ? `Institute ID · ${auth.instituteId || auth?.user?.institute_id}` : 'Administration portal';
  const today = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date());

  const handleLogout = () => {
    authContext?.clearAuth?.();
    clearStoredAuth();
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('instituteId');
    navigate('/login', { replace: true });
  };

  return (
    <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 shadow-[0_22px_55px_-24px_rgba(49,46,129,0.75)]">
      <div className="relative px-5 py-6 sm:px-8 sm:py-8">
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 h-32 w-32 rounded-full bg-sky-400/10 blur-2xl" />
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/12 ring-1 ring-white/20">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M15 9h.01M9 13h.01M15 13h.01M10 21v-4h4v4" /></svg>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-indigo-200"><span className="h-2 w-2 rounded-full bg-emerald-400" /> {instituteLabel}</div>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Good morning, {displayName}</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100/80">Here&apos;s a real-time view of your institute&apos;s academic activity and operations.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-indigo-100 sm:block"><span className="font-semibold text-white">{today}</span><span className="mx-2 text-indigo-300">•</span>Academic session</div>
            <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/20">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 16l4-4m0 0-4-4m4 4H9m4 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" /></svg>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default InstituteHeader;
