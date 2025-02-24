import { NextRequest, NextResponse } from 'next/server';
import { getInstallation } from '@/lib/firebase';
import { getPipelines } from '@/lib/api';

export async function GET(request: NextRequest) {
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

    const pipelines = await getPipelines(installation);
    return NextResponse.json(pipelines);
  } catch (error) {
    console.error('Error fetching pipelines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pipelines' },
      { status: 500 }
    );
  }
} 