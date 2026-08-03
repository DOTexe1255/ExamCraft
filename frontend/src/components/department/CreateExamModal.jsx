import React, { useEffect, useState } from 'react';

const QUESTION_TYPES = [
  { value: 'mcq', label: 'MCQ' },
  { value: 'descriptive', label: 'Descriptive' },
  { value: 'code', label: 'Coding' },
];

const CODE_LANGUAGES = [
  { value: 'any', label: 'Any' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'Any', label: 'Any' },
];

const createQuestion = () => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  type: 'mcq',
  question_text: '',
  marks: 1,
  section_id: '',
  options: ['', '', '', ''],
  correct_option: 0,
  short_answer: '',
  language: 'any',
  sample_input: '',
  sample_output: '',
});

const createSection = (title = 'Section 1', section_type = 'custom') => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title,
  section_type,
});

const createQuestionErrorMap = () => ({
  questions: [],
});

const normalizeBankQuestion = (question) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  type: question.type || 'mcq',
  question_text: question.question_text || '',
  marks: question.marks || 1,
  section_id: question.section_id || '',
  options: Array.isArray(question.options) ? [...question.options, '', '', ''].slice(0, 4) : ['', '', '', ''],
  correct_option: Array.isArray(question.options)
    ? Math.max(
      0,
      question.options.findIndex((option) => String(option || '').trim() === String(question.correct_answer || '').trim())
    )
    : 0,
  short_answer: question.correct_answer || '',
  language: question.language || 'any',
  sample_input: question.sample_input || '',
  sample_output: question.sample_output || '',
});

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
    exam_mode: 'online',
    subject_label: '',
    domain_label: '',
    is_active: true,
  });
  const [questionBank, setQuestionBank] = useState([]);
  const [sections, setSections] = useState([createSection()]);
  const [errors, setErrors] = useState(createQuestionErrorMap());
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
        exam_mode: 'online',
        subject_label: '',
        domain_label: '',
        is_active: true,
      });
      setQuestionBank([]);
      setSections([createSection()]);
      setErrors(createQuestionErrorMap());
    }
  }, [isOpen]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((previous) => ({ ...previous, [name]: '' }));
    }
  };

  const updateQuestion = (questionId, field, value) => {
    setQuestionBank((previous) => previous.map((question) => (
      question.id === questionId ? { ...question, [field]: value } : question
    )));
  };

  const updateSection = (sectionId, field, value) => {
    setSections((previous) => previous.map((section) => (
      section.id === sectionId ? { ...section, [field]: value } : section
    )));
  };

  const addSection = () => {
    setSections((previous) => [...previous, createSection(`Section ${previous.length + 1}`)]);
  };

  const removeSection = (sectionId) => {
    setSections((previous) => previous.length > 1 ? previous.filter((section) => section.id !== sectionId) : previous);
    setQuestionBank((previous) => previous.map((question) => (
      question.section_id === sectionId ? { ...question, section_id: '' } : question
    )));
  };

  const updateQuestionOption = (questionId, optionIndex, value) => {
    setQuestionBank((previous) => previous.map((question) => {
      if (question.id !== questionId) {
        return question;
      }

      const nextOptions = [...question.options];
      nextOptions[optionIndex] = value;
      return { ...question, options: nextOptions };
    }));
  };

  const addQuestion = () => {
    const sectionId = sections[0]?.id || '';
    setQuestionBank((previous) => [...previous, { ...createQuestion(), section_id: sectionId }]);
  };

  const removeQuestion = (questionId) => {
    setQuestionBank((previous) => previous.filter((question) => question.id !== questionId));
    setErrors((previous) => ({
      ...previous,
      questions: [],
    }));
  };

  const validateQuestionBank = () => {
    const questionErrors = [];
    const normalizedQuestions = [];
    const findSectionTitle = (sectionId) => sections.find((section) => section.id === sectionId)?.title || '';

    for (let index = 0; index < questionBank.length; index += 1) {
      const question = questionBank[index];
      const currentErrors = {};
      const questionText = question.question_text.trim();

      if (!questionText) {
        currentErrors.question_text = 'Question text is required';
      }

      const questionType = question.type;

      if (questionType === 'mcq') {
        const options = question.options.map((option) => option.trim()).filter(Boolean);
        const correctAnswer = question.options[question.correct_option]?.trim() || '';

        if (options.length < 2) {
          currentErrors.options = 'MCQ questions need at least two options';
        }

        if (!correctAnswer) {
          currentErrors.correct_option = 'Choose a correct option';
        }

        normalizedQuestions.push({
          type: questionType,
          question_text: questionText,
          marks: Number(question.marks) || 1,
          section_id: question.section_id || '',
          section_title: findSectionTitle(question.section_id),
          options,
          correct_answer: correctAnswer,
        });
      } else if (questionType === 'descriptive') {
        const shortAnswer = question.short_answer.trim();

        if (!shortAnswer) {
          currentErrors.short_answer = 'Expected answer is required';
        }

        normalizedQuestions.push({
          type: 'descriptive',
          question_text: questionText,
          marks: Number(question.marks) || 1,
          section_id: question.section_id || '',
          section_title: findSectionTitle(question.section_id),
          correct_answer: shortAnswer,
        });
      } else if (questionType === 'code') {
        if (!question.language) {
          currentErrors.language = 'Select a coding language';
        }

        normalizedQuestions.push({
          type: questionType,
          question_text: questionText,
          marks: Number(question.marks) || 1,
          section_id: question.section_id || '',
          section_title: findSectionTitle(question.section_id),
          language: question.language,
          sample_input: question.sample_input.trim(),
          sample_output: question.sample_output.trim(),
        });
      }

      if (Object.keys(currentErrors).length > 0) {
        questionErrors[index] = currentErrors;
      }
    }

    if (questionErrors.length > 0) {
      setErrors((previous) => ({ ...previous, questions: questionErrors }));
      return null;
    }

    setErrors((previous) => ({ ...previous, questions: [] }));
    return normalizedQuestions;
  };

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

    setErrors((previous) => ({ ...previous, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const normalizedQuestionBank = validateQuestionBank();
    if (!validateForm() || normalizedQuestionBank === null) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (typeof onSubmit !== 'function') {
        throw new Error('No exam submit handler provided');
      }

      await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim(),
        duration: Number(formData.duration),
        total_marks: Number(formData.total_marks),
        passing_marks: Number(formData.passing_marks),
        start_date: formData.start_date,
        end_date: formData.end_date,
        question_count: Number(formData.question_count),
        exam_type: formData.exam_type,
        exam_mode: formData.exam_mode,
        subject_label: formData.subject_label.trim(),
        domain_label: formData.domain_label.trim(),
        sections,
        is_active: formData.is_active,
        timezone_offset_minutes: new Date().getTimezoneOffset(),
        question_bank: normalizedQuestionBank,
        institute_id: Number(instituteId),
        department_id: Number(departmentId),
      });

      onClose();
    } catch (error) {
      console.error('Submission error:', error);
      setErrors((previous) => ({
        ...previous,
        submit: error?.message || 'Failed to create exam',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="border-b border-gray-100 px-6 pb-4 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Create New Exam</h3>
            <button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-gray-100" disabled={isSubmitting}>
              <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 p-6">
          {errors.submit && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errors.submit}
            </div>
          )}

          <section className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h4 className="mb-1 text-lg font-semibold text-gray-900">Basic Information</h4>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="title">
                Exam Title *
              </label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className={`w-full rounded-xl border px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:ring-teacher-500 ${
                  errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-teacher-500'
                }`}
                placeholder="e.g., Midterm Exam - Data Structures"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="description">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                required
                className={`w-full resize-vertical rounded-xl border px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:ring-teacher-500 ${
                  errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-teacher-500'
                }`}
                placeholder="Brief description of exam content and instructions..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="exam_mode">
                  Exam Mode
                </label>
                <select
                  id="exam_mode"
                  name="exam_mode"
                  value={formData.exam_mode}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-teacher-500 focus:ring-2 focus:ring-teacher-500"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="subject_label">
                  Subject
                </label>
                <input
                  id="subject_label"
                  type="text"
                  name="subject_label"
                  value={formData.subject_label}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-teacher-500 focus:ring-2 focus:ring-teacher-500"
                  placeholder="e.g., Data Structures"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="domain_label">
                  Domain
                </label>
                <input
                  id="domain_label"
                  type="text"
                  name="domain_label"
                  value={formData.domain_label}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-teacher-500 focus:ring-2 focus:ring-teacher-500"
                  placeholder="e.g., Programming / Unit 2"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-1 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Sections</h4>
                <p className="mt-1 text-sm text-slate-600">Divide the exam by unit, question type, or any custom grouping.</p>
              </div>
              <button
                type="button"
                onClick={addSection}
                className="rounded-xl border border-cyan-200 px-4 py-2.5 text-sm font-semibold text-cyan-700 hover:bg-cyan-50"
              >
                + Add section
              </button>
            </div>

            <div className="space-y-4">
              {sections.map((section) => (
                <div key={section.id} className="grid gap-4 rounded-2xl bg-slate-50 p-4 md:grid-cols-[minmax(0,1fr)_180px_96px]">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Section Title</label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(event) => updateSection(section.id, 'title', event.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-teacher-500 focus:ring-2 focus:ring-teacher-500"
                      placeholder="e.g., Unit 1 / MCQ Block"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Section Type</label>
                    <select
                      value={section.section_type}
                      onChange={(event) => updateSection(section.id, 'section_type', event.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-teacher-500 focus:ring-2 focus:ring-teacher-500"
                    >
                      <option value="custom">Custom</option>
                      <option value="unit">Unit wise</option>
                      <option value="question_type">Question type wise</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeSection(section.id)}
                      className="w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                      disabled={sections.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6 rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
            <div className="flex flex-col gap-1 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Question Bank</h4>
                <p className="mt-1 text-sm text-slate-600">Add reusable questions here. They are stored with the exam and can be reused later.</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={addQuestion}
                className="inline-flex items-center justify-center rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700"
              >
                + Add question
              </button>
            </div>

            {questionBank.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500">
                No questions yet. Add MCQ, descriptive, or coding questions to build a reusable bank for this exam.
              </div>
            ) : (
              <div className="space-y-4">
                {questionBank.map((question, index) => {
                  const questionErrors = errors.questions?.[index] || {};

                  return (
                    <article key={question.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Question {index + 1}</p>
                          <p className="text-xs text-slate-500">Build a reusable question bank entry</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeQuestion(question.id)}
                          className="text-sm font-semibold text-red-600 transition hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mt-4 grid gap-4">
                        <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)_120px]">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Question Type</label>
                            <select
                              value={question.type}
                              onChange={(event) => updateQuestion(question.id, 'type', event.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm focus:border-teacher-500 focus:ring-2 focus:ring-teacher-500"
                            >
                              {QUESTION_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Question Text *</label>
                            <textarea
                              rows={3}
                              value={question.question_text}
                              onChange={(event) => updateQuestion(question.id, 'question_text', event.target.value)}
                              className={`w-full rounded-xl border px-4 py-3 text-sm focus:border-teacher-500 focus:ring-2 focus:ring-teacher-500 ${
                                questionErrors.question_text ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200'
                              }`}
                              placeholder="Write the question prompt here..."
                            />
                            {questionErrors.question_text && <p className="mt-1 text-sm text-red-600">{questionErrors.question_text}</p>}
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Marks</label>
                            <input
                              type="number"
                              min={1}
                              value={question.marks}
                              onChange={(event) => updateQuestion(question.id, 'marks', event.target.value)}
                              className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm focus:border-teacher-500 focus:ring-2 focus:ring-teacher-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">Section</label>
                          <select
                            value={question.section_id}
                            onChange={(event) => updateQuestion(question.id, 'section_id', event.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm focus:border-teacher-500 focus:ring-2 focus:ring-teacher-500"
                          >
                            <option value="">Choose a section</option>
                            {sections.map((section) => (
                              <option key={section.id} value={section.id}>
                                {section.title}
                              </option>
                            ))}
                          </select>
                        </div>

                        {question.type === 'mcq' && (
                          <div className="space-y-4 rounded-2xl bg-slate-50 p-4">
                            <div className="grid gap-3 md:grid-cols-2">
                              {question.options.map((option, optionIndex) => (
                                <div key={`${question.id}-option-${optionIndex}`}>
                                  <label className="mb-2 block text-sm font-medium text-gray-700">Option {optionIndex + 1}</label>
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(event) => updateQuestionOption(question.id, optionIndex, event.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-teacher-500 focus:ring-2 focus:ring-teacher-500"
                                    placeholder={`Option ${optionIndex + 1}`}
                                  />
                                </div>
                              ))}
                            </div>
                            <div>
                              <label className="mb-2 block text-sm font-medium text-gray-700">Correct Answer *</label>
                              <select
                                value={question.correct_option}
                                onChange={(event) => updateQuestion(question.id, 'correct_option', Number(event.target.value))}
                                className={`w-full rounded-xl border px-3 py-3 text-sm focus:border-teacher-500 focus:ring-2 focus:ring-teacher-500 ${
                                  questionErrors.correct_option ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200'
                                }`}
                              >
                                {question.options.map((option, optionIndex) => (
                                  <option key={`${question.id}-correct-${optionIndex}`} value={optionIndex}>
                                    {option.trim() || `Option ${optionIndex + 1}`}
                                  </option>
                                ))}
                              </select>
                              {questionErrors.options && <p className="mt-1 text-sm text-red-600">{questionErrors.options}</p>}
                              {questionErrors.correct_option && <p className="mt-1 text-sm text-red-600">{questionErrors.correct_option}</p>}
                            </div>
                          </div>
                        )}

                        {question.type === 'descriptive' && (
                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Descriptive Answer *</label>
                            <textarea
                              rows={3}
                              value={question.short_answer}
                              onChange={(event) => updateQuestion(question.id, 'short_answer', event.target.value)}
                              className={`w-full rounded-xl border px-4 py-3 text-sm focus:border-teacher-500 focus:ring-2 focus:ring-teacher-500 ${
                                questionErrors.short_answer ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200'
                              }`}
                              placeholder="Enter the expected short answer..."
                            />
                            {questionErrors.short_answer && <p className="mt-1 text-sm text-red-600">{questionErrors.short_answer}</p>}
                          </div>
                        )}

                        {question.type === 'code' && (
                          <div className="space-y-4 rounded-2xl bg-slate-50 p-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Coding Language *</label>
                                <select
                                  value={question.language}
                                  onChange={(event) => updateQuestion(question.id, 'language', event.target.value)}
                                  className={`w-full rounded-xl border px-3 py-3 text-sm focus:border-teacher-500 focus:ring-2 focus:ring-teacher-500 ${
                                    questionErrors.language ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200'
                                  }`}
                                >
                                  {CODE_LANGUAGES.map((language) => (
                                    <option key={language.value} value={language.value}>
                                      {language.label}
                                    </option>
                                  ))}
                                </select>
                                <p className="mt-1 text-xs text-slate-500">Any means the student may choose any language at attempt time.</p>
                                {questionErrors.language && <p className="mt-1 text-sm text-red-600">{questionErrors.language}</p>}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Sample Input</label>
                                <textarea
                                  rows={3}
                                  value={question.sample_input}
                                  onChange={(event) => updateQuestion(question.id, 'sample_input', event.target.value)}
                                  className="w-full rounded-xl border border-gray-200 px-4 py-3 font-mono text-sm focus:border-teacher-500 focus:ring-2 focus:ring-teacher-500"
                                  placeholder="Optional sample input..."
                                />
                              </div>
                              <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Sample Output</label>
                                <textarea
                                  rows={3}
                                  value={question.sample_output}
                                  onChange={(event) => updateQuestion(question.id, 'sample_output', event.target.value)}
                                  className="w-full rounded-xl border border-gray-200 px-4 py-3 font-mono text-sm focus:border-teacher-500 focus:ring-2 focus:ring-teacher-500"
                                  placeholder="Optional sample output..."
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="border-b border-gray-100 pb-2 text-lg font-semibold text-gray-900">Settings</h4>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="duration">
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
                  className={`w-full rounded-xl border px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:ring-teacher-500 ${
                    errors.duration ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-teacher-500'
                  }`}
                />
                {errors.duration && <p className="mt-1 text-sm text-red-600">{errors.duration}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="question_count">
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
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all duration-200 focus:border-teacher-500 focus:ring-2 focus:ring-teacher-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="border-b border-gray-100 pb-2 text-lg font-semibold text-gray-900">Scoring</h4>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="total_marks">
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
                  className={`w-full rounded-xl border px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:ring-teacher-500 ${
                    errors.total_marks ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-teacher-500'
                  }`}
                />
                {errors.total_marks && <p className="mt-1 text-sm text-red-600">{errors.total_marks}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="passing_marks">
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
                  className={`w-full rounded-xl border px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:ring-teacher-500 ${
                    errors.passing_marks ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-teacher-500'
                  }`}
                />
                {errors.passing_marks && <p className="mt-1 text-sm text-red-600">{errors.passing_marks}</p>}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h4 className="mb-1 text-lg font-semibold text-gray-900">Schedule & Status</h4>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="start_date">
                  Start Date & Time *
                </label>
                <input
                  id="start_date"
                  type="datetime-local"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className={`w-full rounded-xl border px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:ring-teacher-500 ${
                    errors.start_date ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-teacher-500'
                  }`}
                />
                {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="end_date">
                  End Date & Time *
                </label>
                <input
                  id="end_date"
                  type="datetime-local"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className={`w-full rounded-xl border px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:ring-teacher-500 ${
                    errors.end_date ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-teacher-500'
                  }`}
                />
                {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
              </div>
            </div>

            <label className="flex items-center text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={(event) => setFormData((previous) => ({ ...previous, is_active: event.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-teacher-600 focus:ring-teacher-500"
              />
              <span className="ml-2">Activate exam immediately</span>
            </label>
          </section>

          <div className="flex gap-3 border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-teacher-600 px-4 py-3 text-sm font-semibold text-white shadow-dashboard transition-all duration-300 hover:bg-teacher-700 hover:shadow-dashboard-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
