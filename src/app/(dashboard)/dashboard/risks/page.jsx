'use client';

import { Suspense } from 'react';
import RiskDashboard from '../../../../components/risks/RiskDashboard';

export default function RisksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      }>
        <RiskDashboard />
      </Suspense>
    </div>
  );
}