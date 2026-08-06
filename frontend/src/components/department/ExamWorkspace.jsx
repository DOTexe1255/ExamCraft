import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestJson } from '../../global/api';
import { getStoredAuth } from '../../global/authStorage';

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
];

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createSection = (title = 'Section 1', section_type = 'custom') => ({
  id: createId(),
  title,
  section_type,
});

const createTestCase = () => ({ input: '', expected: '' });

const createQuestion = (type = 'mcq') => ({
  id: createId(),
  type,
  title: '',
  description: '',
  question_text: '',
  marks: 1,
  section_id: '',
  options: ['', '', '', ''],
  correct_option: 0,
  short_answer: '',
  language: 'any',
  function_name: '',
  constraints: '',
  test_cases: [createTestCase()],
});

const toLocalDatetimeValue = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const normalizeTestCases = (value) => {
  if (!Array.isArray(value) || value.length === 0) {
    return [createTestCase()];
  }

  return value.map((item) => ({
    input: String(item?.input ?? ''),
    expected: String(item?.expected ?? ''),
  }));
};

const normalizeQuestion = (question) => {
  const type = question?.type === 'short_answer' ? 'descriptive' : (question?.type || 'mcq');
  const normalized = {
    id: question?.id || createId(),
    type,
    title: question?.title || question?.question_title || '',
    description: question?.description || '',
    question_text: question?.question_text || question?.description || question?.title || '',
    marks: Number(question?.marks ?? question?.max_marks ?? 1),
    section_id: question?.section_id || '',
    options: Array.isArray(question?.options) ? [...question.options, '', '', ''].slice(0, 4) : ['', '', '', ''],
    correct_option: Number.isInteger(question?.correct_option) ? question.correct_option : 0,
    short_answer: question?.short_answer || question?.correct_answer || '',
    language: question?.language || question?.language_type || 'any',
    function_name: question?.function_name || question?.functionName || '',
    constraints: question?.constraints || '',
    test_cases: normalizeTestCases(question?.test_cases || question?.testCases || question?.visible_test_cases),
  };

  if (type !== 'code') {
    normalized.test_cases = [createTestCase()];
  }

  return normalized;
};

const normalizeSection = (section, index) => ({
  id: section?.id || createId(),
  title: section?.title || `Section ${index + 1}`,
  section_type: section?.section_type || 'custom',
});

const getDurationMinutes = (startValue, endValue) => {
  const start = new Date(startValue);
  const end = new Date(endValue);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
};

const buildInitialForm = () => ({
  title: '',
  description: '',
  exam_mode: 'online',
  subject_label: '',
  domain_label: '',
  start_date: '',
  end_date: '',
  total_marks: 100,
  passing_marks: 40,
  is_active: true,
  security_settings: { block_copy_paste: true, block_cut: true, block_right_click: true, block_devtools: true, block_print: true, block_text_selection: true, allow_paste_in_coding: false, auto_submit_on_violation: true },
});

const buildPayloadQuestions = (questions, sections) => {
  const findSectionTitle = (sectionId) => sections.find((section) => section.id === sectionId)?.title || '';

  return questions.map((question) => {
    const sectionTitle = findSectionTitle(question.section_id);
    const marks = Number(question.marks) || 1;

    if (question.type === 'descriptive') {
      return {
        type: 'descriptive',
        title: question.title.trim(),
        description: question.description.trim(),
        question_text: question.question_text.trim() || question.description.trim() || question.title.trim(),
        marks,
        section_id: question.section_id || '',
        section_title: sectionTitle,
        correct_answer: question.short_answer.trim(),
      };
    }

    if (question.type === 'code') {
      return {
        type: 'code',
        title: question.title.trim(),
        description: question.description.trim(),
        question_text: question.description.trim() || question.title.trim(),
        functionName: question.function_name.trim(),
        constraints: question.constraints.trim(),
        marks,
        section_id: question.section_id || '',
        section_title: sectionTitle,
        language: question.language,
        testCases: normalizeTestCases(question.test_cases).map((item) => ({
          input: String(item.input || ''),
          expected: String(item.expected || ''),
        })),
      };
    }

    return {
      type: 'mcq',
      title: question.title.trim(),
      description: question.description.trim(),
      question_text: question.question_text.trim() || question.description.trim() || question.title.trim(),
      marks,
      section_id: question.section_id || '',
      section_title: sectionTitle,
      options: question.options.map((option) => option.trim()).filter(Boolean),
      correct_answer: question.options[question.correct_option]?.trim() || '',
    };
  });
};

const ExamWorkspace = ({ mode, examId }) => {
  const navigate = useNavigate();
  const auth = getStoredAuth();
  const instituteId = auth?.instituteId ?? auth?.user?.institute_id;
  const departmentId = auth?.departmentId ?? auth?.user?.department_id;
  const [formData, setFormData] = useState(buildInitialForm);
  const [sections, setSections] = useState([createSection()]);
  const [questions, setQuestions] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = mode === 'edit';
  const pageTitle = isEditMode ? 'Exam settings' : 'Create exam';
  const pageDescription = isEditMode
    ? 'Update schedule, enrolled students, sections, and question paper in one place.'
    : 'Create a new exam with sections, enrollment, and question-bank details.';

  const totalQuestions = questions.length;

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const requests = [requestJson('/api/department/dashboard/students')];

        if (isEditMode) {
          requests.unshift(requestJson(`/api/exams/${examId}`));
        }

        const results = await Promise.all(requests);
        const studentsResponse = isEditMode ? results[1] : results[0];
        const examResponse = isEditMode ? results[0] : null;

        if (!active) {
          return;
        }

        setStudents(studentsResponse.students || []);

        if (examResponse?.exam) {
          const exam = examResponse.exam;
          const startDate = toLocalDatetimeValue(exam.start_datetime);
          const durationMinutes = Number(exam.duration_minutes || 60);
          const endDate = startDate
            ? new Date(new Date(startDate).getTime() + durationMinutes * 60000).toISOString().slice(0, 16)
            : '';

          setFormData({
            title: exam.title || '',
            description: exam.description || '',
            exam_mode: exam.exam_mode || 'online',
            subject_label: exam.subject_label || '',
            domain_label: exam.domain_label || '',
            start_date: startDate,
            end_date: endDate,
            total_marks: Number(exam.total_marks || 100),
            passing_marks: Number(exam.passing_marks || 40),
            is_active: exam.status !== 'draft',
            security_settings: { ...buildInitialForm().security_settings, ...(exam.security_settings || {}) },
          });

          setSections(Array.isArray(exam.sections) && exam.sections.length > 0 ? exam.sections.map(normalizeSection) : [createSection()]);
          setQuestions(Array.isArray(exam.question_bank) && exam.question_bank.length > 0 ? exam.question_bank.map(normalizeQuestion) : []);
          setSelectedStudentIds(Array.isArray(exam.assigned_student_ids) ? exam.assigned_student_ids.map(Number) : []);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || 'Unable to load exam data.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [examId, isEditMode]);

  const updateFormField = (name, value) => {
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const updateSection = (sectionId, field, value) => {
    setSections((current) => current.map((section) => (section.id === sectionId ? { ...section, [field]: value } : section)));
  };

  const updateQuestion = (questionId, field, value) => {
    setQuestions((current) => current.map((question) => (question.id === questionId ? { ...question, [field]: value } : question)));
  };

  const updateQuestionOption = (questionId, optionIndex, value) => {
    setQuestions((current) => current.map((question) => {
      if (question.id !== questionId) {
        return question;
      }

      const nextOptions = [...question.options];
      nextOptions[optionIndex] = value;
      return { ...question, options: nextOptions };
    }));
  };

  const updateTestCase = (questionId, caseIndex, field, value) => {
    setQuestions((current) => current.map((question) => {
      if (question.id !== questionId) {
        return question;
      }

      const nextCases = [...normalizeTestCases(question.test_cases)];
      nextCases[caseIndex] = { ...nextCases[caseIndex], [field]: value };
      return { ...question, test_cases: nextCases };
    }));
  };

  const addQuestion = (type) => {
    setQuestions((current) => [...current, createQuestion(type)]);
  };

  const removeQuestion = (questionId) => {
    setQuestions((current) => current.filter((question) => question.id !== questionId));
  };

  const addSection = () => {
    setSections((current) => [...current, createSection(`Section ${current.length + 1}`)]);
  };

  const removeSection = (sectionId) => {
    setSections((current) => (current.length > 1 ? current.filter((section) => section.id !== sectionId) : current));
    setQuestions((current) => current.map((question) => (question.section_id === sectionId ? { ...question, section_id: '' } : question)));
  };

  const toggleStudent = (studentId) => {
    setSelectedStudentIds((current) => (
      current.includes(studentId)
        ? current.filter((item) => item !== studentId)
        : [...current, studentId]
    ));
  };

  const selectAllStudents = () => {
    setSelectedStudentIds(students.map((student) => Number(student.user_id)));
  };

  const clearStudents = () => {
    setSelectedStudentIds([]);
  };

  const validate = () => {
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      return 'Exam title is required.';
    }

    if (!formData.description.trim()) {
      return 'Description is required.';
    }

    if (!formData.start_date || !formData.end_date) {
      return 'Start and end date are required.';
    }

    const durationMinutes = getDurationMinutes(formData.start_date, formData.end_date);
    if (!durationMinutes || durationMinutes < 1) {
      return 'End time must be after start time.';
    }

    if (Number(formData.total_marks) <= 0) {
      return 'Total marks must be greater than zero.';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validate();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    const durationMinutes = getDurationMinutes(formData.start_date, formData.end_date);
    if (!durationMinutes) {
      setError('Unable to calculate exam duration.');
      return;
    }

    const normalizedQuestions = buildPayloadQuestions(questions, sections);
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      duration: durationMinutes,
      total_marks: Number(formData.total_marks),
      passing_marks: Number(formData.passing_marks),
      start_date: formData.start_date,
      end_date: formData.end_date,
      question_count: normalizedQuestions.length,
      exam_mode: formData.exam_mode,
      subject_label: formData.subject_label.trim(),
      domain_label: formData.domain_label.trim(),
      sections,
      is_active: formData.is_active,
      timezone_offset_minutes: new Date().getTimezoneOffset(),
      question_bank: normalizedQuestions,
      institute_id: Number(instituteId),
      department_id: Number(departmentId),
      student_ids: selectedStudentIds,
      security_settings: formData.security_settings,
    };

    setSaving(true);
    setError('');

    try {
      if (isEditMode) {
        await requestJson(`/api/exams/${examId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        navigate('/department-dashboard');
      } else {
        await requestJson('/api/exams', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        navigate('/department-dashboard');
      }
    } catch (submitError) {
      setError(submitError.message || 'Could not save exam.');
    } finally {
      setSaving(false);
    }
  };

  const summaryCards = useMemo(() => ([
    { label: 'Sections', value: sections.length },
    { label: 'Questions', value: totalQuestions },
    { label: 'Students selected', value: selectedStudentIds.length },
  ]), [sections.length, totalQuestions, selectedStudentIds.length]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold">Loading exam workspace…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#e0f2fe,_#f8fafc_55%,_#e2e8f0_100%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <button onClick={() => navigate('/department-dashboard')} className="text-sm font-semibold text-cyan-700 hover:text-cyan-900">
                ← Back to dashboard
              </button>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{pageTitle}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{pageDescription}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-3 text-center sm:min-w-[360px]">
              {summaryCards.map((card) => (
                <div key={card.label} className="rounded-xl bg-white px-3 py-3 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{card.label}</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">{card.value}</p>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <section className="grid gap-4 rounded-3xl border border-slate-100 bg-slate-50/70 p-5 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">Exam Title</label>
                <input
                  value={formData.title}
                  onChange={(event) => updateFormField('title', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                  placeholder="Midterm Exam - Data Structures"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(event) => updateFormField('description', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                  placeholder="Describe what this exam evaluates and any special instructions."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Exam Mode</label>
                <select
                  value={formData.exam_mode}
                  onChange={(event) => updateFormField('exam_mode', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Subject</label>
                <input
                  value={formData.subject_label}
                  onChange={(event) => updateFormField('subject_label', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                  placeholder="Data Structures"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Domain</label>
                <input
                  value={formData.domain_label}
                  onChange={(event) => updateFormField('domain_label', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                  placeholder="Unit 2 / Programming"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Passing Marks</label>
                <input
                  type="number"
                  value={formData.passing_marks}
                  onChange={(event) => updateFormField('passing_marks', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Total Marks</label>
                <input
                  type="number"
                  value={formData.total_marks}
                  onChange={(event) => updateFormField('total_marks', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(event) => updateFormField('start_date', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(event) => updateFormField('end_date', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                />
              </div>

              <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm lg:col-span-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(event) => updateFormField('is_active', event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                Activate exam immediately
              </label>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="border-b border-slate-100 pb-4"><h2 className="text-lg font-semibold text-slate-900">Security & shortcuts</h2><p className="mt-1 text-sm text-slate-500">Enable or disable browser shortcuts and exam security controls.</p></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ['block_copy_paste', 'Disable copy & paste'], ['block_cut', 'Disable cut'], ['block_right_click', 'Disable right click'], ['block_devtools', 'Disable DevTools shortcuts'], ['block_print', 'Disable print shortcut'], ['block_text_selection', 'Disable text selection'], ['allow_paste_in_coding', 'Allow paste in coding'], ['auto_submit_on_violation', 'Auto-submit after warnings'],
                ].map(([key, label]) => <label key={key} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"><input type="checkbox" checked={Boolean(formData.security_settings?.[key])} onChange={(event) => updateFormField('security_settings', { ...formData.security_settings, [key]: event.target.checked })} className="h-4 w-4" />{label}</label>)}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Sections</h2>
                  <p className="mt-1 text-sm text-slate-500">Group the paper by unit, topic, or difficulty.</p>
                </div>
                <button type="button" onClick={addSection} className="rounded-xl border border-cyan-200 px-4 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-50">
                  + Add section
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {sections.map((section) => (
                  <div key={section.id} className="grid gap-4 rounded-2xl bg-slate-50 p-4 lg:grid-cols-[minmax(0,1fr)_180px_110px]">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Section title</label>
                      <input
                        value={section.title}
                        onChange={(event) => updateSection(section.id, 'title', event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                        placeholder="Section 1"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Section type</label>
                      <select
                        value={section.section_type}
                        onChange={(event) => updateSection(section.id, 'section_type', event.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
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
                        disabled={sections.length === 1}
                        className="w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-slate-50/70 p-5 shadow-sm">
              <div className="flex flex-col gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Question Paper</h2>
                  <p className="mt-1 text-sm text-slate-500">Create MCQ, descriptive, and coding questions. Coding questions follow the structured format you shared.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => addQuestion('mcq')} className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100">
                    + MCQ
                  </button>
                  <button type="button" onClick={() => addQuestion('descriptive')} className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100">
                    + Descriptive
                  </button>
                  <button type="button" onClick={() => addQuestion('code')} className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700">
                    + Coding question
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {questions.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500">
                    No questions added yet.
                  </div>
                ) : (
                  questions.map((question, index) => (
                    <article key={question.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Question {index + 1}</p>
                          <p className="text-xs text-slate-500">Build the paper entry here.</p>
                        </div>
                        <button type="button" onClick={() => removeQuestion(question.id)} className="text-sm font-semibold text-red-600 hover:text-red-700">
                          Remove
                        </button>
                      </div>

                      <div className="mt-4 grid gap-4">
                        <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)_120px]">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Question type</label>
                            <select
                              value={question.type}
                              onChange={(event) => updateQuestion(question.id, 'type', event.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none"
                            >
                              {QUESTION_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Title / Prompt</label>
                            <textarea
                              rows={3}
                              value={question.question_text}
                              onChange={(event) => updateQuestion(question.id, 'question_text', event.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                              placeholder="Enter the question prompt"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Marks</label>
                            <input
                              type="number"
                              min={1}
                              value={question.marks}
                              onChange={(event) => updateQuestion(question.id, 'marks', event.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Section</label>
                          <select
                            value={question.section_id}
                            onChange={(event) => updateQuestion(question.id, 'section_id', event.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none"
                          >
                            <option value="">Choose a section</option>
                            {sections.map((section) => (
                              <option key={section.id} value={section.id}>{section.title}</option>
                            ))}
                          </select>
                        </div>

                        {question.type === 'mcq' && (
                          <div className="space-y-4 rounded-2xl bg-slate-50 p-4">
                            <div className="grid gap-3 lg:grid-cols-2">
                              {question.options.map((option, optionIndex) => (
                                <div key={`${question.id}-option-${optionIndex}`}>
                                  <label className="mb-2 block text-sm font-medium text-slate-700">Option {optionIndex + 1}</label>
                                  <input
                                    value={option}
                                    onChange={(event) => updateQuestionOption(question.id, optionIndex, event.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                    placeholder={`Option ${optionIndex + 1}`}
                                  />
                                </div>
                              ))}
                            </div>
                            <div>
                              <label className="mb-2 block text-sm font-medium text-slate-700">Correct option</label>
                              <select
                                value={question.correct_option}
                                onChange={(event) => updateQuestion(question.id, 'correct_option', Number(event.target.value))}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none"
                              >
                                {question.options.map((option, optionIndex) => (
                                  <option key={`${question.id}-correct-${optionIndex}`} value={optionIndex}>
                                    {option.trim() || `Option ${optionIndex + 1}`}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}

                        {question.type === 'descriptive' && (
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Descriptive answer</label>
                            <textarea
                              rows={3}
                              value={question.short_answer}
                              onChange={(event) => updateQuestion(question.id, 'short_answer', event.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                              placeholder="Expected answer for this question"
                            />
                          </div>
                        )}

                        {question.type === 'code' && (
                          <div className="space-y-5 rounded-2xl bg-slate-50 p-4">
                            <div className="grid gap-4 lg:grid-cols-2">
                              <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Problem Title</label>
                                <input
                                  value={question.title}
                                  onChange={(event) => updateQuestion(question.id, 'title', event.target.value)}
                                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                  placeholder="Square of a Number"
                                />
                              </div>
                              <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700">Function Name</label>
                                <input
                                  value={question.function_name}
                                  onChange={(event) => updateQuestion(question.id, 'function_name', event.target.value)}
                                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                  placeholder="square"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-medium text-slate-700">Problem Description</label>
                              <textarea
                                rows={4}
                                value={question.description}
                                onChange={(event) => updateQuestion(question.id, 'description', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                placeholder="Given T test cases..."
                              />
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-medium text-slate-700">Constraints</label>
                              <textarea
                                rows={3}
                                value={question.constraints}
                                onChange={(event) => updateQuestion(question.id, 'constraints', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                                placeholder="1 ≤ T ≤ 100\n0 ≤ N ≤ 1000"
                              />
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-medium text-slate-700">Language</label>
                              <select
                                value={question.language}
                                onChange={(event) => updateQuestion(question.id, 'language', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none"
                              >
                                {CODE_LANGUAGES.map((language) => (
                                  <option key={language.value} value={language.value}>{language.label}</option>
                                ))}
                              </select>
                              <p className="mt-1 text-xs text-slate-500">Any means the student may choose any language at attempt time.</p>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-slate-700">Test Cases</label>
                                <button
                                  type="button"
                                  onClick={() => updateQuestion(question.id, 'test_cases', [...normalizeTestCases(question.test_cases), createTestCase()])}
                                  className="rounded-lg border border-cyan-200 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-50"
                                >
                                  + Add test case
                                </button>
                              </div>

                              <div className="space-y-3">
                                {normalizeTestCases(question.test_cases).map((testCase, caseIndex) => (
                                  <div key={`${question.id}-test-${caseIndex}`} className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm lg:grid-cols-[1fr_1fr_100px]">
                                    <div>
                                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Input</label>
                                      <textarea
                                        rows={3}
                                        value={testCase.input}
                                        onChange={(event) => updateTestCase(question.id, caseIndex, 'input', event.target.value)}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                                        placeholder="1 4"
                                      />
                                    </div>
                                    <div>
                                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Expected output</label>
                                      <textarea
                                        rows={3}
                                        value={testCase.expected}
                                        onChange={(event) => updateTestCase(question.id, caseIndex, 'expected', event.target.value)}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                                        placeholder="16"
                                      />
                                    </div>
                                    <div className="flex items-end">
                                      <button
                                        type="button"
                                        onClick={() => updateQuestion(question.id, 'test_cases', normalizeTestCases(question.test_cases).filter((_, index) => index !== caseIndex).length ? normalizeTestCases(question.test_cases).filter((_, index) => index !== caseIndex) : [createTestCase()])}
                                        className="w-full rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Enrolled Students</h2>
                  <p className="mt-1 text-sm text-slate-500">Choose which students should be assigned to this exam.</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={selectAllStudents} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Select all
                  </button>
                  <button type="button" onClick={clearStudents} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Clear
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {students.length ? students.map((student) => {
                  const studentId = Number(student.user_id);
                  const checked = selectedStudentIds.includes(studentId);

                  return (
                    <label key={student.user_id} className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${checked ? 'border-cyan-300 bg-cyan-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleStudent(studentId)}
                        className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">{student.first_name} {student.last_name}</p>
                        <p className="truncate text-xs text-slate-500">{student.email}</p>
                      </div>
                    </label>
                  );
                }) : (
                  <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    No students are available in this department.
                  </p>
                )}
              </div>
            </section>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate('/department-dashboard')}
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-700 disabled:cursor-wait disabled:opacity-60"
              >
                {saving ? 'Saving…' : isEditMode ? 'Save changes' : 'Create exam'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default ExamWorkspace;
