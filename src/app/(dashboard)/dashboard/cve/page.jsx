'use client';

import { Suspense } from 'react';
import CVEDashboard from '../../../../components/cve/CVEDashboard';

export default function CVEPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg text-gray-600">Cargando dashboard CVE...</div>
          </div>
        </div>
      }>
        <CVEDashboard />
      </Suspense>
    </div>
  );
}