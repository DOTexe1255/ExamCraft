import React, { useEffect, useState } from 'react';
import { requestJson } from '../../global/api';

const QUESTION_TYPES = [
  { value: 'mcq', label: 'MCQ' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'code', label: 'Coding' },
];

const CODE_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
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
  language: 'javascript',
  starter_code: '',
  sample_input: '',
  sample_output: '',
});

const createSection = (title = 'Section 1', section_type = 'custom') => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title,
  section_type,
});

const normalizeQuestion = (question) => ({
  type: question.type,
  question_text: question.question_text.trim(),
  marks: Number(question.marks) || 1,
  section_id: question.section_id || '',
  options: question.type === 'mcq' ? question.options.map((option) => option.trim()).filter(Boolean) : undefined,
  correct_answer: question.type === 'mcq'
    ? (question.options[question.correct_option] || '').trim()
    : question.type === 'short_answer'
      ? question.short_answer.trim()
      : undefined,
  language: question.type === 'code' ? question.language : undefined,
  starter_code: question.type === 'code' ? question.starter_code.trim() : undefined,
  sample_input: question.type === 'code' ? question.sample_input.trim() : undefined,
  sample_output: question.type === 'code' ? question.sample_output.trim() : undefined,
});

const QuestionBankModal = ({ isOpen, onClose, instituteId, departmentId, onSaved }) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [subjectLabel, setSubjectLabel] = useState('');
  const [domainLabel, setDomainLabel] = useState('');
  const [questions, setQuestions] = useState([]);
  const [sections, setSections] = useState([createSection()]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setGroupName('');
    setDescription('');
    setSubjectLabel('');
    setDomainLabel('');
    setQuestions([createQuestion()]);
    setSections([createSection()]);
    setErrors({});
  }, [isOpen]);

  const updateQuestion = (questionId, field, value) => {
    setQuestions((previous) => previous.map((question) => (
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
    setQuestions((previous) => previous.map((question) => (
      question.section_id === sectionId ? { ...question, section_id: '' } : question
    )));
  };

  const updateQuestionOption = (questionId, optionIndex, value) => {
    setQuestions((previous) => previous.map((question) => {
      if (question.id !== questionId) {
        return question;
      }

      const nextOptions = [...question.options];
      nextOptions[optionIndex] = value;
      return { ...question, options: nextOptions };
    }));
  };

  const addQuestion = () => {
    const firstSectionId = sections[0]?.id || '';
    setQuestions((previous) => [...previous, { ...createQuestion(), section_id: firstSectionId }]);
  };

  const removeQuestion = (questionId) => {
    setQuestions((previous) => (previous.length > 1 ? previous.filter((question) => question.id !== questionId) : previous));
  };

  const validate = () => {
    const nextErrors = {};

    if (!groupName.trim()) {
      nextErrors.groupName = 'Question bank name is required';
    }

    const questionErrors = [];
    questions.forEach((question, index) => {
      const currentErrors = {};

      if (!question.question_text.trim()) {
        currentErrors.question_text = 'Question text is required';
      }

      if (question.type === 'mcq') {
        const options = question.options.map((option) => option.trim()).filter(Boolean);
        if (options.length < 2) {
          currentErrors.options = 'MCQ questions need at least two options';
        }
        if (!(question.options[question.correct_option] || '').trim()) {
          currentErrors.correct_option = 'Select the correct option';
        }
      }

      if (question.type === 'short_answer' && !question.short_answer.trim()) {
        currentErrors.short_answer = 'Expected answer is required';
      }

      if (question.type === 'code' && !question.language) {
        currentErrors.language = 'Coding language is required';
      }

      if (Object.keys(currentErrors).length > 0) {
        questionErrors[index] = currentErrors;
      }
    });

    if (questionErrors.length > 0) {
      nextErrors.questions = questionErrors;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await requestJson('/api/question-banks', {
        method: 'POST',
        body: JSON.stringify({
          group_name: groupName.trim(),
          description: description.trim(),
          subject_label: subjectLabel.trim(),
          domain_label: domainLabel.trim(),
          sections,
          questions: questions.map(normalizeQuestion),
          institute_id: Number(instituteId),
          department_id: Number(departmentId),
        }),
      });

      if (typeof onSaved === 'function') {
        await onSaved();
      }

      onClose();
    } catch (error) {
      setErrors((previous) => ({
        ...previous,
        submit: error.message || 'Failed to save question bank',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Add Question Bank</h3>
              <p className="mt-1 text-sm text-slate-500">Create a saved group of reusable questions for exams.</p>
            </div>
            <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">✕</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {errors.submit && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{errors.submit}</div>}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Question Bank Name *</label>
              <input
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
                className={`w-full rounded-xl border px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500 ${errors.groupName ? 'border-red-300' : 'border-slate-200'}`}
                placeholder="e.g. Data Structures MCQ Set"
              />
              {errors.groupName && <p className="mt-1 text-sm text-red-600">{errors.groupName}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
                placeholder="Optional notes for this bank"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Subject</label>
              <input
                value={subjectLabel}
                onChange={(event) => setSubjectLabel(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g. Data Structures"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Domain</label>
              <input
                value={domainLabel}
                onChange={(event) => setDomainLabel(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
                placeholder="e.g. Unit 2 / Algorithms"
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-lg font-semibold text-slate-900">Sections</h4>
            <button type="button" onClick={addSection} className="rounded-xl border border-cyan-200 px-4 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-50">
              + Add section
            </button>
          </div>

          <div className="space-y-3">
            {sections.map((section) => (
              <div key={section.id} className="grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-[minmax(0,1fr)_180px_96px]">
                <input
                  value={section.title}
                  onChange={(event) => updateSection(section.id, 'title', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
                  placeholder="Section title"
                />
                <select
                  value={section.section_type}
                  onChange={(event) => updateSection(section.id, 'section_type', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="custom">Custom</option>
                  <option value="unit">Unit wise</option>
                  <option value="question_type">Question type wise</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeSection(section.id)}
                  disabled={sections.length === 1}
                  className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-lg font-semibold text-slate-900">Questions</h4>
            <button type="button" onClick={addQuestion} className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700">
              + Add question
            </button>
          </div>

          <div className="space-y-4">
            {questions.map((question, index) => {
              const questionErrors = errors.questions?.[index] || {};

              return (
                <article key={question.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <p className="text-sm font-semibold text-slate-900">Question {index + 1}</p>
                    <button type="button" onClick={() => removeQuestion(question.id)} className="text-sm font-semibold text-red-600">Remove</button>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)_120px]">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Type</label>
                        <select
                          value={question.type}
                          onChange={(event) => updateQuestion(question.id, 'type', event.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
                        >
                          {QUESTION_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Question Text *</label>
                        <textarea
                          rows={3}
                          value={question.question_text}
                          onChange={(event) => updateQuestion(question.id, 'question_text', event.target.value)}
                          className={`w-full rounded-xl border px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 ${questionErrors.question_text ? 'border-red-300' : 'border-slate-200'}`}
                        />
                        {questionErrors.question_text && <p className="mt-1 text-sm text-red-600">{questionErrors.question_text}</p>}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Marks</label>
                        <input
                          type="number"
                          min={1}
                          value={question.marks}
                          onChange={(event) => updateQuestion(question.id, 'marks', event.target.value)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Section</label>
                      <select
                        value={question.section_id}
                        onChange={(event) => updateQuestion(question.id, 'section_id', event.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="">Choose a section</option>
                        {sections.map((section) => <option key={section.id} value={section.id}>{section.title}</option>)}
                      </select>
                    </div>

                    {question.type === 'mcq' && (
                      <div className="grid gap-4 md:grid-cols-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={`${question.id}-${optionIndex}`}>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Option {optionIndex + 1}</label>
                            <input
                              value={option}
                              onChange={(event) => updateQuestionOption(question.id, optionIndex, event.target.value)}
                              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
                            />
                          </div>
                        ))}

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Correct Option</label>
                          <select
                            value={question.correct_option}
                            onChange={(event) => updateQuestion(question.id, 'correct_option', Number(event.target.value))}
                            className={`w-full rounded-xl border px-3 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 ${questionErrors.correct_option ? 'border-red-300' : 'border-slate-200'}`}
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

                    {question.type === 'short_answer' && (
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Expected Answer *</label>
                        <textarea
                          rows={3}
                          value={question.short_answer}
                          onChange={(event) => updateQuestion(question.id, 'short_answer', event.target.value)}
                          className={`w-full rounded-xl border px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 ${questionErrors.short_answer ? 'border-red-300' : 'border-slate-200'}`}
                        />
                        {questionErrors.short_answer && <p className="mt-1 text-sm text-red-600">{questionErrors.short_answer}</p>}
                      </div>
                    )}

                    {question.type === 'code' && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Coding Language *</label>
                          <select
                            value={question.language}
                            onChange={(event) => updateQuestion(question.id, 'language', event.target.value)}
                            className={`w-full rounded-xl border px-3 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 ${questionErrors.language ? 'border-red-300' : 'border-slate-200'}`}
                          >
                            {CODE_LANGUAGES.map((language) => <option key={language.value} value={language.value}>{language.label}</option>)}
                          </select>
                          {questionErrors.language && <p className="mt-1 text-sm text-red-600">{questionErrors.language}</p>}
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Starter Code</label>
                          <textarea
                            rows={3}
                            value={question.starter_code}
                            onChange={(event) => updateQuestion(question.id, 'starter_code', event.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Sample Input</label>
                          <textarea
                            rows={3}
                            value={question.sample_input}
                            onChange={(event) => updateQuestion(question.id, 'sample_input', event.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Sample Output</label>
                          <textarea
                            rows={3}
                            value={question.sample_output}
                            onChange={(event) => updateQuestion(question.id, 'sample_output', event.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="flex gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-60">
              {isSubmitting ? 'Saving...' : 'Save Question Bank'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionBankModal;