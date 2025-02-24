import { NextRequest, NextResponse } from 'next/server';
import { getInstallation } from '@/lib/firebase';
import { updateOpportunityStage } from '@/lib/api';

export async function POST(
  request: NextRequest,
  { params }: { params: { opportunityId: string } }
) {
  const opportunityId = params.opportunityId;
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

    const body = await request.json();
    const { pipelineId, stageId } = body;

    if (!pipelineId || !stageId) {
      return NextResponse.json(
        { error: 'Missing pipeline ID or stage ID' },
        { status: 400 }
      );
    }

    const updatedOpportunity = await updateOpportunityStage(
      installation,
      opportunityId,
      pipelineId,
      stageId
    );

    return NextResponse.json(updatedOpportunity);
  } catch (error) {
    console.error('Error moving opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to move opportunity' },
      { status: 500 }
    );
  }
} 