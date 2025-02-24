import { NextRequest, NextResponse } from 'next/server';
import { getInstallation } from '@/lib/firebase';
import { getOpportunities } from '@/lib/api';

export async function GET(
  request: NextRequest,
  { params }: { params: { pipelineId: string } }
) {
  const { pipelineId } = params;
  const locationId = request.headers.get('locationId');
  const companyId = request.headers.get('companyId');

  if (!locationId || !companyId) {
    return NextResponse.json(
      { error: 'Missing location or company ID' },
      { status: 400 }
    );
  }

  try {
    const installation = await getInstallation(locationId, companyId);
    
    if (!installation) {
      return NextResponse.json(
        { error: 'Installation not found' },
        { status: 404 }
      );
    }

    const opportunities = await getOpportunities(installation, pipelineId);
    return NextResponse.json(opportunities);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunities' },
      { status: 500 }
    );
  }
} 