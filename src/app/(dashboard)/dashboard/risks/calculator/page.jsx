'use client';

import { Suspense } from 'react';
import RiskCalculator from '../../../../components/risks/RiskCalculator';

export default function RiskCalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Suspense fallback={
        <div className="flex items-center justify-center h-96">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6 mx-auto"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      }>
        <RiskCalculator />
      </Suspense>
    </div>
  );
}