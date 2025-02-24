'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getInstallation, Installation } from '@/lib/firebase';
import PipelineView from '@/components/PipelineView';

export default function Dashboard() {
  const searchParams = useSearchParams();
  const [installation, setInstallation] = useState<Installation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const locationId = searchParams.get('locationId');
    const companyId = searchParams.get('companyId');

    if (!locationId || !companyId) {
      setError('Missing location or company ID');
      setIsLoading(false);
      return;
    }

    loadInstallation(locationId, companyId);
  }, [searchParams]);

  const loadInstallation = async (locationId: string, companyId: string) => {
    try {
      const installationData = await getInstallation(locationId, companyId);
      
      if (!installationData) {
        throw new Error('Installation not found');
      }

      setInstallation(installationData);
    } catch (error) {
      console.error('Error loading installation:', error);
      setError(error instanceof Error ? error.message : 'Failed to load installation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpportunityMove = (opportunityId: string, fromStageId: string, toStageId: string) => {
    console.log('Opportunity moved:', { opportunityId, fromStageId, toStageId });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-red-800">{error}</h3>
        </div>
      </div>
    );
  }

  if (!installation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-yellow-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-yellow-800">No installation data available</h3>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-8">
              Pipeline Dashboard
            </h1>

            <PipelineView
              installation={installation}
              onOpportunityMove={handleOpportunityMove}
            />
          </div>
        </div>
      </div>
    </main>
  );
} 