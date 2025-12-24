import React from 'react';

const RecentActivity = () => {
  return (
    <>
      {/* Recent Activity Content */}
      <div className="space-y-4">
        {/* Sample Activity 1 */}
        <div className="flex items-center gap-3 p-4 bg-student-50/50 border border-student-100 
                        rounded-xl hover:bg-student-50 transition-all duration-200 group">
          <div className="w-2 h-2 bg-status-completed rounded-full animate-pulse"></div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-sm truncate group-hover:text-student-700">
              Completed "Data Structures Midterm"
            </p>
            <p className="text-xs text-gray-500 mt-0.5">42/50 (84%) • 1h 15m ago</p>
          </div>
          <span className="px-2 py-1 bg-status-completed/10 text-status-completed text-xs font-medium rounded-full">
            84%
          </span>
        </div>

        {/* Sample Activity 2 */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 
                        rounded-xl hover:bg-gray-100 transition-all duration-200 group">
          <div className="w-2 h-2 bg-status-active rounded-full animate-pulse"></div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-sm truncate group-hover:text-status-active">
              Database Management (In Progress)
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Resumed 30m ago • 12/20 answered</p>
          </div>
          <span className="px-2 py-1 bg-status-active/10 text-status-active text-xs font-medium rounded-full">
            Live
          </span>
        </div>

        {/* Sample Activity 3 */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 
                        rounded-xl hover:bg-gray-100 transition-all duration-200">
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-sm">Digital Electronics Quiz</p>
            <p className="text-xs text-gray-500 mt-0.5">Scheduled for Dec 25 • 10:00 AM</p>
          </div>
          <span className="px-2 py-1 bg-status-scheduled/10 text-status-scheduled text-xs font-medium rounded-full">
            Soon
          </span>
        </div>
      </div>
    </>
  );
};

export default RecentActivity;
