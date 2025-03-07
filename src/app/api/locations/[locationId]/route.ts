import { NextRequest, NextResponse } from 'next/server';
import { getInstallation } from '@/lib/firebase';

export async function GET(
  request: NextRequest,
  { params }: { params: { locationId: string } }
) {
  const locationId = params.locationId;
  const companyId = request.nextUrl.searchParams.get('companyId');

  if (!locationId || !companyId) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
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

    return NextResponse.json({
      id: locationId,
      name: 'Location Name',
      companyId: installation.companyId,
      settings: installation.settings || {},
      installedAt: installation.installedAt
    });
  } catch (error) {
    console.error('Error fetching location:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location data' },
      { status: 500 }
    );
  }
} 