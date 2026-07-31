import React, { useState, useEffect } from 'react';

const AddDepartmentModal = ({ isOpen, onClose, onSubmit, instituteId }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    head_email: '',
    head_first_name: '',
    head_last_name: '',
    head_phone: '',
    head_password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        code: '',
        head_email: '',
        head_first_name: '',
        head_last_name: '',
        head_phone: '',
        head_password: ''
      });
      setErrors({});
      setSubmitError('');
      setShowPassword(false);
    }
  }, [isOpen]);

  // Validate all fields before submitting
  const validateForm = () => {
    const nextErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2 || formData.name.trim().length > 100) {
      nextErrors.name = 'Department name must be 2-100 characters';
    }

    if (!formData.code.trim() || !/^[a-zA-Z0-9]+$/.test(formData.code.trim()) || formData.code.trim().length > 20) {
      nextErrors.code = 'Code must be alphanumeric, 1-20 characters';
    }

    if (!formData.head_email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.head_email.trim())) {
      nextErrors.head_email = 'Please enter a valid head email address';
    }

    if (!formData.head_first_name.trim() || formData.head_first_name.trim().length < 2 || formData.head_first_name.trim().length > 50) {
      nextErrors.head_first_name = 'First name must be 2-50 characters';
    }

    if (!formData.head_last_name.trim() || formData.head_last_name.trim().length < 2 || formData.head_last_name.trim().length > 50) {
      nextErrors.head_last_name = 'Last name must be 2-50 characters';
    }

    if (!formData.head_password || formData.head_password.length < 6) {
      nextErrors.head_password = 'Password must be at least 6 characters';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));

    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: '' }));
    }
    if (submitError) setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const departmentData = {
        institute_id: instituteId,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        head_email: formData.head_email.trim()
      };

      const headDetailsProvided = formData.head_email && formData.head_first_name && formData.head_last_name;
      
      const departmentAdminData = headDetailsProvided ? {
        first_name: formData.head_first_name.trim(),
        last_name: formData.head_last_name.trim(),
        email: formData.head_email.trim(),
        password: formData.head_password, // Use custom password
        role: 'department',
        institute_id: instituteId,
        department_id: null, // Set after department creation
        phone: formData.head_phone.trim() || null
      } : null;

      await onSubmit({ departmentData, departmentAdminData });
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError(error.message || 'Unable to create the department. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Add New Department</h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close modal"
              disabled={isSubmitting}
            >
              <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-1">Department Details</h4>
              <p className="text-sm text-gray-500">Basic information about the department.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">
                Department Name *
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-institute-500 transition-all duration-200 text-sm ${
                  errors.name 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-200 focus:border-institute-500'
                }`}
                placeholder="e.g., Computer Science & Engineering"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="code">
                Department Code *
              </label>
              <input
                id="code"
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
                maxLength={20}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-institute-500 transition-all duration-200 text-sm uppercase ${
                  errors.code 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-200 focus:border-institute-500'
                }`}
                placeholder="e.g., CSE"
              />
              {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
            </div>
          </div>

          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-1">Head of Department</h4>
              <p className="text-sm text-gray-500">These details are required so a department admin account can be created automatically.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="head_first_name">
                  First Name *
                </label>
                <input
                  id="head_first_name"
                  type="text"
                  name="head_first_name"
                  value={formData.head_first_name}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-institute-500 transition-all duration-200 text-sm ${
                    errors.head_first_name
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-200 focus:border-institute-500'
                  }`}
                  placeholder="e.g., John"
                />
                {errors.head_first_name && <p className="mt-1 text-sm text-red-600">{errors.head_first_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="head_last_name">
                  Last Name *
                </label>
                <input
                  id="head_last_name"
                  type="text"
                  name="head_last_name"
                  value={formData.head_last_name}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-institute-500 transition-all duration-200 text-sm ${
                    errors.head_last_name
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-200 focus:border-institute-500'
                  }`}
                  placeholder="e.g., Doe"
                />
                {errors.head_last_name && <p className="mt-1 text-sm text-red-600">{errors.head_last_name}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="head_email">
                Email Address *
              </label>
              <input
                id="head_email"
                type="email"
                name="head_email"
                value={formData.head_email}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-institute-500 transition-all duration-200 text-sm ${
                  errors.head_email
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-200 focus:border-institute-500'
                }`}
                placeholder="hod@department.institute.edu"
              />
              {errors.head_email && <p className="mt-1 text-sm text-red-600">{errors.head_email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="head_phone">
                Phone (Optional)
              </label>
              <input
                id="head_phone"
                type="tel"
                name="head_phone"
                value={formData.head_phone}
                onChange={handleInputChange}
                maxLength={15}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-institute-500 focus:border-institute-500 transition-all duration-200 text-sm"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="head_password">
                Initial Password *
              </label>
              <div className="relative">
                <input
                  id="head_password"
                  type={showPassword ? 'text' : 'password'}
                  name="head_password"
                  value={formData.head_password}
                  onChange={handleInputChange}
                  required
                  className={`w-full pr-12 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-institute-500 transition-all duration-200 text-sm ${
                    errors.head_password
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-200 focus:border-institute-500'
                  }`}
                  placeholder="Enter secure password (min 6 chars)"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    )}
                  </svg>
                </button>
              </div>
              {errors.head_password && <p className="mt-1 text-sm text-red-600">{errors.head_password}</p>}
              <p className="mt-1 text-xs text-gray-500">
                User will use this password to login initially. They can change it later.
              </p>
            </div>
          </div>

          {submitError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>}
          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-institute-600 text-white text-sm font-semibold rounded-xl hover:bg-institute-700 shadow-dashboard hover:shadow-dashboard-hover transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Create Department
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDepartmentModal;
