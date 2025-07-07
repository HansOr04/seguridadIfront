'use client';

import { Suspense } from 'react';
import RiskMatrix from '../../../../components/risks/RiskMatrix';

export default function RiskMatrixPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Suspense fallback={
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
        </div>
      }>
        <RiskMatrix />
      </Suspense>
    </div>
  );
}