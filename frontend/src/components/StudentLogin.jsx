import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { setStoredAuth } from '../global/authStorage';
import { requestJson } from '../global/api';
import { useMyContext } from '../global/AuthContext';

const StudentLogin = () => {
  const [form, setForm] = useState({ email: '', password: '' }); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const navigate = useNavigate(); const authContext = useMyContext();
  const update = (event) => { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); setError(''); };
  const handleSubmit = async (event) => { event.preventDefault(); if (!form.email || !form.password) return setError('Enter your email and password to continue.'); setLoading(true); try { const response = await requestJson('/api/auth/login', { method: 'POST', body: JSON.stringify({ ...form, role: 'student' }) }); const user = response.user || {}; const auth = { isAuthenticated: true, role: 'student', email: user.email || form.email, userId: user.id || null, firstName: user.first_name || '', lastName: user.last_name || '', instituteId: user.institute_id || null, departmentId: user.department_id || null, user }; authContext?.setAuth?.(auth); setStoredAuth(auth); navigate('/student-dashboard', { replace: true }); } catch { setError('We could not sign you in. Check your credentials and try again.'); } finally { setLoading(false); } };
  return <AuthLayout type="student" title="Student sign in" subtitle="Use your institute account to access available examinations."><form onSubmit={handleSubmit} className="mt-7 space-y-5">{error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}<Field label="Institute email" type="email" name="email" value={form.email} onChange={update} placeholder="student@institute.edu" autoComplete="email" /><Field label="Password" type="password" name="password" value={form.password} onChange={update} placeholder="Enter your password" autoComplete="current-password" /><div className="flex justify-end"><button type="button" onClick={() => setError('Please contact your institute administrator for password assistance.')} className="text-xs font-semibold text-emerald-600 hover:text-emerald-800">Need help signing in?</button></div><button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-wait disabled:opacity-60">{loading ? 'Signing in…' : 'Access student portal'} <span aria-hidden="true">→</span></button></form></AuthLayout>;
};
const Field = ({ label, ...props }) => <label className="block text-sm font-semibold text-slate-700">{label}<input {...props} required className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50" /></label>;
export default StudentLogin;
