import React from 'react';
import { useParams } from 'react-router-dom';
import ExamWorkspace from './ExamWorkspace';

const ExamSettingsPage = () => {
  const { examId } = useParams();

  return <ExamWorkspace mode="edit" examId={examId} />;
};

export default ExamSettingsPage;