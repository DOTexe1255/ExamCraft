import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const InstituteRegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    contact_email: "",
    phone: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [popup, setPopup] = useState({ open: false, type: "success", message: "" });
  const navigate = useNavigate?.() || (() => {});
  const popupTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (popupTimerRef.current) {
        clearTimeout(popupTimerRef.current);
      }
    };
  }, []);

  const showPopup = (type, message, onClose) => {
    if (popupTimerRef.current) {
      clearTimeout(popupTimerRef.current);
    }

    setPopup({ open: true, type, message });
    popupTimerRef.current = setTimeout(() => {
      setPopup({ open: false, type, message: "" });
      if (typeof onClose === "function") {
        onClose();
      }
    }, 1800);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
    setError("");
  };

  const validate = () => {
    if (!formData.name.trim()) return "Institute name is required";
    if (formData.name.trim().length < 2) return "Institute name must be at least 2 characters";
    if (!formData.code.trim()) return "Institute code is required";
    if (formData.code.trim().length < 2) return "Institute code must be at least 2 characters";
    if (formData.contact_email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.contact_email)) return "Enter a valid contact email";
    if (formData.phone && formData.phone.trim().length > 15) return "Phone number must be 15 characters or fewer";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch('/api/institute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          code: formData.code.trim(),
          address: formData.address.trim() || null,
          contact_email: formData.contact_email.trim() || null,
          phone: formData.phone.trim() || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const details = Array.isArray(data?.details) ? data.details.join(', ') : '';
        throw new Error(data?.message || details || 'Institute registration failed');
      }

      console.log('Institute created successfully:', data);
      showPopup("success", "Institute created successfully", () => navigate("/login"));
    } catch (err) {
      console.error(err);
      const message = err?.message || "Registration failed. Try again.";
      setError(message);
      showPopup("error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {popup.open && (
        <div className="fixed top-6 right-6 z-50 max-w-sm">
          <div
            className={`flex items-start gap-3 rounded-2xl px-5 py-4 shadow-2xl border backdrop-blur-xl ${
              popup.type === "success"
                ? "bg-emerald-50/95 border-emerald-200 text-emerald-900"
                : "bg-red-50/95 border-red-200 text-red-900"
            }`}
          >
            <div
              className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${
                popup.type === "success" ? "bg-emerald-600" : "bg-red-600"
              }`}
            >
              {popup.type === "success" ? (
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 6a6 6 0 100 12 6 6 0 000-12z" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-bold">{popup.type === "success" ? "Success" : "Failed"}</p>
              <p className="text-sm opacity-90">{popup.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-sky-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="relative w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: Enhanced Hero */}
          <div className="hidden lg:flex flex-col items-start gap-8 p-12 rounded-3xl bg-white/80 backdrop-blur-xl shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-500">
            <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            
            <div>
              <h3 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-emerald-700 bg-clip-text text-transparent leading-tight">
                Register Your Institute
              </h3>
              <p className="text-xl text-gray-600 mt-4 leading-relaxed max-w-md">
                Launch secure CBT exams for your students in minutes
              </p>
            </div>

            {/* Enhanced Features List */}
            <div className="space-y-4 mt-8 flex-1">
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl border-l-4 border-emerald-500">
                <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">Lightning Setup</h4>
                  <p className="text-sm text-gray-600">Register in 30 seconds, start exams immediately</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-100 rounded-2xl border-l-4 border-indigo-500">
                <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">Bank-Grade Security</h4>
                  <p className="text-sm text-gray-600">Enterprise security for exam integrity</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-sky-50 to-cyan-100 rounded-2xl border-l-4 border-sky-500">
                <div className="w-8 h-8 bg-sky-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-lg">24/7 Support</h4>
                  <p className="text-sm text-gray-600">Dedicated team ready to help you</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Enhanced Form */}
          <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-3xl rounded-4xl p-10 lg:p-12 max-w-md w-full mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-emerald-700 to-indigo-700 bg-clip-text text-transparent mb-3">
                Get Started
              </h2>
              <p className="text-xl text-gray-600 font-medium">Enter institute details and send them to the backend</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="text-sm text-red-600 bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-2xl border border-red-200 flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {error}
                </div>
              )}

              {/* Institute Name */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Institute Name *</label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Tech Institute Pune"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/50 outline-none bg-white/50 backdrop-blur-sm text-lg placeholder-gray-500 transition-all duration-300 hover:border-emerald-300"
                  autoComplete="organization"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Institute Code *</label>
                <input
                  name="code"
                  type="text"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g., TI001"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/50 outline-none bg-white/50 backdrop-blur-sm text-lg placeholder-gray-500 transition-all duration-300 hover:border-emerald-300"
                  autoComplete="off"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Address</label>
                <input
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g., Pune, Maharashtra"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/50 outline-none bg-white/50 backdrop-blur-sm text-lg placeholder-gray-500 transition-all duration-300 hover:border-emerald-300"
                  autoComplete="street-address"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Contact Email</label>
                <input
                  name="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  placeholder="admin@yourinstitute.com"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/50 outline-none bg-white/50 backdrop-blur-sm text-lg placeholder-gray-500 transition-all duration-300 hover:border-emerald-300"
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Phone</label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/50 outline-none bg-white/50 backdrop-blur-sm text-lg placeholder-gray-500 transition-all duration-300 hover:border-emerald-300"
                  autoComplete="tel"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full inline-flex items-center justify-center gap-4 px-8 py-5 rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-black text-xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 overflow-hidden transform hover:scale-[1.02]"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                    </svg>
                    <span>Creating Institute...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span>Submit Institute Details</span>
                    <div className="absolute -right-4 group-hover:right-0 bg-white/30 w-20 h-20 rounded-full blur-xl -z-10 transition-all duration-500"></div>
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-8 pt-6 border-t border-gray-200 flex flex-col gap-2">
              <p className="text-sm text-gray-600">
                Already registered?{' '}
                <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors font-semibold">
                  Sign in here →
                </Link>
              </p>
              <Link 
                to="/" 
                className="text-sm text-gray-500 hover:text-gray-700 font-medium hover:underline transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default InstituteRegisterPage;
