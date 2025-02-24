import { NextRequest, NextResponse } from 'next/server';
import { getInstallation } from '@/lib/firebase';

type Props = {
  params: {
    locationId: string;
  };
};

export async function GET(request: NextRequest, context: Props) {
  const { locationId } = context.params;
  const searchParams = request.nextUrl.searchParams;
  const companyId = searchParams.get('companyId');

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

    // Return only the necessary data for the frontend
    return NextResponse.json({
      id: locationId,
      name: 'Location Name', // TODO: Fetch from GHL API
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