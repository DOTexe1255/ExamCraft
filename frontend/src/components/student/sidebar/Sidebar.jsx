import React from 'react'
import RecentActivity from './RecentActivity'
import ExamTip from './ExamTip'

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
            <ExamTip />
            
          </div>
    </>
  )
}

export default Sidebar