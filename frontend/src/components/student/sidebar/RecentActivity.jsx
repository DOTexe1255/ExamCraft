import React from 'react'

const RecentActivity = () => {
  return (
    <>
         {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <p className="text-sm text-gray-600">Your latest exam attempts</p>
              </div>
              <div className="p-8 text-center text-gray-500">
                <svg className="h-12 w-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No recent activity</p>
                <p className="text-sm">Start an exam to see your progress here</p>
              </div>
            </div>
    </>
  )
}

export default RecentActivity