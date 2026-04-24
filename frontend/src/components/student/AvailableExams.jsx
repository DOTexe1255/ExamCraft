import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FALLBACK_EXAMS = [
  {
    exam_id: 'exam-1',
    title: 'Data Structures & Algorithms',
    description: 'Test your knowledge on arrays, linked lists, trees, and sorting algorithms',
    duration_minutes: 60,
    status: 'scheduled',
    question_count: 25
  },
  {
    exam_id: 'exam-2',
    title: 'Database Management',
    description: 'SQL queries, normalization, transactions, and database design',
    duration_minutes: 45,
    status: 'active',
    question_count: 20
  }
];

const AvailableExams = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await fetch('/api/exams', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setExams(data.exams || FALLBACK_EXAMS);
        } else {
          setExams(FALLBACK_EXAMS);
        }
      } catch {
        setExams(FALLBACK_EXAMS);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const handleStartExam = (examId) => {
    navigate(`/exam/${examId}`);
  };

  if (loading) {
    return (
      <div className="lg:col-span-2">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Exams</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-student-600"></div>
        </div>
      </div>
    );
  }

  const statusLabel = (exam) => {
    if (exam.completed) return 'Completed';
    if (exam.status === 'active') return 'In Progress';
    return 'Available';
  };

  const statusClass = (exam) => {
    if (exam.completed) return 'bg-status-completed/10 text-status-completed';
    if (exam.status === 'active') return 'bg-status-active/10 text-status-active';
    return 'bg-status-scheduled/10 text-status-scheduled';
  };

  return (
    <>
      {/* Available Exams */}
      <div className="lg:col-span-2">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Exams</h2>
        
        <div className="space-y-4">
          {exams.map((exam) => (
            <div
              key={exam.exam_id}
              className="bg-white rounded-xl shadow-dashboard hover:shadow-dashboard-hover 
                          border hover:border-student-200 p-6 transition-all duration-300 
                          group hover:scale-[1.02]"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusClass(exam)}`}>
                      {statusLabel(exam)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{exam.description}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    {exam.question_count && (
                      <div className="flex items-center gap-1">
                        <svg className="h-4 w-4 text-student-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>{exam.question_count} questions</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <svg className="h-4 w-4 text-student-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{exam.duration_minutes || exam.duration} minutes</span>
                    </div>
                  </div>
                </div>
              </div>
              {!exam.completed && (
                <button 
                  onClick={() => handleStartExam(exam.exam_id)}
                  className={`w-full px-6 py-3 rounded-xl text-sm font-semibold 
                            flex items-center justify-center gap-2 transition-all duration-300 
                            group-hover:scale-[1.05] ${
                    exam.status === 'active'
                      ? 'border-2 border-student-200 text-student-700 hover:bg-student-50 hover:border-student-400 hover:shadow-dashboard'
                      : 'bg-student-600 text-white hover:bg-student-700 shadow-dashboard hover:shadow-dashboard-hover'
                  }`}
                >
                  {exam.status === 'active' ? 'Resume Exam' : (
                    <>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                      Start Exam
                    </>
                  )}
                </button>
              )}
            </div>
          ))}

          {exams.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No exams available at this time.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AvailableExams;
