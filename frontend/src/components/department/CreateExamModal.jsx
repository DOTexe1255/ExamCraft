import React, { useState, useEffect } from 'react';

const CreateExamModal = ({ isOpen, onClose, onSubmit, instituteId, departmentId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    total_marks: 100,
    passing_marks: 40,
    start_date: '',
    end_date: '',
    question_count: 20,
    exam_type: 'mcq',
    is_active: true
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        duration: 60,
        total_marks: 100,
        passing_marks: 40,
        start_date: '',
        end_date: '',
        question_count: 20,
        exam_type: 'mcq',
        is_active: true
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim() || formData.title.length < 3 || formData.title.length > 100) {
      newErrors.title = 'Exam title must be 3-100 characters';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (formData.duration < 15 || formData.duration > 300) {
      newErrors.duration = 'Duration must be 15-300 minutes';
    }
    if (formData.total_marks < 10 || formData.total_marks > 1000) {
      newErrors.total_marks = 'Total marks must be 10-1000';
    }
    if (formData.passing_marks >= formData.total_marks) {
      newErrors.passing_marks = 'Passing marks must be less than total marks';
    }
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    if (!formData.end_date || new Date(formData.end_date) <= new Date(formData.start_date)) {
      newErrors.end_date = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name.includes('date') ? value : value
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate a successful submission
      alert('Exam created successfully!');
      onClose();
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Create New Exam</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" disabled={isSubmitting}>
              <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-1">Basic Information</h4>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="title">
                Exam Title *
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teacher-500 transition-all duration-200 text-sm ${
                  errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-teacher-500'
                }`}
                placeholder="e.g., Midterm Exam - Data Structures"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="description">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teacher-500 transition-all duration-200 text-sm resize-vertical ${
                  errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-teacher-500'
                }`}
                placeholder="Brief description of exam content and instructions..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>
          </div>

          {/* Exam Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Settings</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="duration">
                  Duration (minutes) *
                </label>
                <input
                  id="duration"
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min={15}
                  max={300}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teacher-500 transition-all duration-200 text-sm ${
                    errors.duration ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-teacher-500'
                  }`}
                />
                {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="question_count">
                  Number of Questions
                </label>
                <input
                  id="question_count"
                  type="number"
                  name="question_count"
                  value={formData.question_count}
                  onChange={handleInputChange}
                  min={1}
                  max={200}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teacher-500 focus:border-teacher-500 transition-all duration-200 text-sm"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Scoring</h4>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="total_marks">
                  Total Marks *
                </label>
                <input
                  id="total_marks"
                  type="number"
                  name="total_marks"
                  value={formData.total_marks}
                  onChange={handleInputChange}
                  min={10}
                  max={1000}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teacher-500 transition-all duration-200 text-sm ${
                    errors.total_marks ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-teacher-500'
                  }`}
                />
                {errors.total_marks && <p className="mt-1 text-sm text-red-600">{errors.total_marks}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="passing_marks">
                  Passing Marks *
                </label>
                <input
                  id="passing_marks"
                  type="number"
                  name="passing_marks"
                  value={formData.passing_marks}
                  onChange={handleInputChange}
                  min={0}
                  max={formData.total_marks - 1}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teacher-500 transition-all duration-200 text-sm ${
                    errors.passing_marks ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-teacher-500'
                  }`}
                />
                {errors.passing_marks && <p className="mt-1 text-sm text-red-600">{errors.passing_marks}</p>}
              </div>
            </div>
          </div>

          {/* Dates & Status */}
          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-1">Schedule & Status</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="start_date">
                  Start Date & Time *
                </label>
                <input
                  id="start_date"
                  type="datetime-local"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teacher-500 transition-all duration-200 text-sm ${
                    errors.start_date ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-teacher-500'
                  }`}
                />
                {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="end_date">
                  End Date & Time *
                </label>
                <input
                  id="end_date"
                  type="datetime-local"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teacher-500 transition-all duration-200 text-sm ${
                    errors.end_date ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-teacher-500'
                  }`}
                />
                {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="h-4 w-4 text-teacher-600 focus:ring-teacher-500 border-gray-300 rounded"
                />
                <span className="ml-2">Activate exam immediately</span>
              </label>
            </div>
          </div>

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
              className="flex-1 px-4 py-3 bg-teacher-600 text-white text-sm font-semibold rounded-xl hover:bg-teacher-700 shadow-dashboard hover:shadow-dashboard-hover transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  Create Exam
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExamModal;
