import React, { useState } from 'react';
import { buildApiUrl } from '../../global/api';

const formatAction = (action) => String(action || 'Activity').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const dateLabel = (value) => value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Just now';
const InstituteQuickActions = ({ activity, settings, loading }) => {
  const [downloading, setDownloading] = useState(false);
  const downloadReport = async () => {
    setDownloading(true);
    try { const response = await fetch(buildApiUrl('/api/institute/dashboard/report'), { credentials: 'include' }); if (!response.ok) throw new Error('Report could not be generated'); const url = URL.createObjectURL(await response.blob()); const link = document.createElement('a'); link.href = url; link.download = 'institute-report.csv'; link.click(); URL.revokeObjectURL(url); }
    catch (error) { alert(error.message || 'Could not download report'); }
    finally { setDownloading(false); }
  };
  const storageUsed = settings.storage_used || 'Not configured';
  return <><section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><h2 className="text-base font-semibold text-slate-900">Quick actions</h2><p className="mt-1 text-sm text-slate-500">Export current institute data.</p><div className="mt-5"><button onClick={downloadReport} disabled={downloading} className="flex w-full items-center gap-3 rounded-xl bg-indigo-600 px-4 py-3 text-left text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"><span className="grid h-7 w-7 place-items-center rounded-lg bg-white/15"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-8m0 8l-3-3m3 3l3-3M5 20h14" /></svg></span>{downloading ? 'Preparing report…' : 'Download institute report'}</button></div></section>
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-base font-semibold text-slate-900">Recent activity</h2><p className="mt-1 text-sm text-slate-500">Your institute audit trail.</p></div></div><div className="mt-5 space-y-5">{loading ? <p className="text-sm text-slate-500">Loading activity…</p> : activity.length ? activity.map((item) => <Activity key={item.log_id} title={formatAction(item.action)} detail={`${item.actor || 'System'} · ${dateLabel(item.created_at)}`} />) : <p className="text-sm leading-6 text-slate-500">No audit activity recorded yet. New administration actions will appear here.</p>}</div></section>
    <section className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5"><div className="flex items-start gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-600 text-white"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><div><p className="text-sm font-semibold text-indigo-950">Institute settings</p><p className="mt-1 text-xs leading-5 text-indigo-800">Maximum exam duration: {settings.max_exam_duration ? `${settings.max_exam_duration} minutes` : 'Not configured'}</p><p className="text-xs leading-5 text-indigo-800">Storage usage: {storageUsed}</p></div></div></section></>;
};
const Activity = ({ title, detail }) => <div className="flex gap-3"><span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-500 ring-4 ring-slate-50" /><div><p className="text-sm font-medium text-slate-700">{title}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div></div>;
export default InstituteQuickActions;
