import React from 'react';
const stats = [
  { key: 'student_count', label: 'Total students', tone: 'text-indigo-600 bg-indigo-50', icon: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2m3-10a4 4 0 100-8 4 4 0 000 8z' },
  { key: 'department_count', label: 'Departments', tone: 'text-sky-600 bg-sky-50', icon: 'M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M15 9h.01M9 13h.01M15 13h.01' },
  { key: 'active_exam_count', label: 'Active examinations', tone: 'text-emerald-600 bg-emerald-50', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.59a1 1 0 01.7.29l5.42 5.42a1 1 0 01.29.7V19a2 2 0 01-2 2z' },
  { key: 'faculty_count', label: 'Faculty members', tone: 'text-violet-600 bg-violet-50', icon: 'M17 20h5v-2a3 3 0 00-5.36-1.86M17 20H7m10 0v-2c0-.66-.13-1.28-.36-1.86M7 20v-2c0-.66.13-1.28.36-1.86a5 5 0 019.28 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
];
const InstituteStatesCards = ({ summary, loading }) => <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">{stats.map((stat) => <article key={stat.key} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{stat.label}</p><p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{loading ? '—' : Number(summary?.[stat.key] || 0).toLocaleString()}</p></div><div className={`grid h-11 w-11 place-items-center rounded-xl ${stat.tone}`}><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d={stat.icon} /></svg></div></div><p className="mt-4 text-xs font-medium text-slate-500">Live data from your institute</p></article>)}</div>;
export default InstituteStatesCards;
