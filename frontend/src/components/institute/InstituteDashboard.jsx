import React from 'react';
import Header from './InstituteHeader';
import StatsCards from './InstituteStatesCards';
import DepartmentList from './DepartmentList';
import QuickActions from './InstituteQuickActions';
import { getStoredAuth } from '../ProtectedRoute';

const InstituteDashboard = () => {
  const auth = getStoredAuth();
  const instituteId = auth?.instituteId ?? auth?.user?.institute_id ?? 1;

  return (
    <main className="min-h-screen bg-institute-bg p-6">
      {/* Top header */}
      <Header />

      {/* Summary statistics */}
      <section aria-label="Institute statistics" className="mt-6">
        <StatsCards />
      </section>

      {/* Main dashboard content */}
      <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side: departments and related data */}
        <div className="lg:col-span-2">
          <DepartmentList instituteId={instituteId} />
        </div>

        {/* Right side: quick actions */}
        <aside>
          <QuickActions instituteId={instituteId} />
        </aside>
      </section>
    </main>
  );
};

export default InstituteDashboard;