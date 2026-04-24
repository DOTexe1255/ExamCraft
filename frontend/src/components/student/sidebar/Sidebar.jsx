import React from 'react'
import RecentActivity from './RecentActivity'
import ExamTip from './ExamTip'
import QuestionTypes from './QuestionTypes'

const Sidebar = () => {
  return (
    <>
         {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
           <RecentActivity />

            {/* Exam Tips */}
            <ExamTip />

            {/* Question Types Info */}
            <QuestionTypes />
            
          </div>
    </>
  )
}

export default Sidebar