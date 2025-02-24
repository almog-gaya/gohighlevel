import { NextRequest, NextResponse } from 'next/server';
import { deleteInstallation } from '@/lib/firebase';
import crypto from 'crypto';

// Verify webhook signature
const verifyWebhookSignature = (payload: string, signature: string) => {
  const hmac = crypto.createHmac('sha256', process.env.GHL_CLIENT_SECRET || '');
  const calculatedSignature = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  );
};

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-ghl-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      );
    }

    const payload = await request.text();

    // Verify webhook signature
    if (!verifyWebhookSignature(payload, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(payload);

    // Handle different webhook events
    switch (event.type) {
      case 'app.uninstalled':
        await handleUninstall(event);
        break;
      
      // Add more event types as needed
      // case 'location.created':
      // case 'location.updated':
      // etc.
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

interface UninstallEvent {
  type: 'app.uninstalled';
  data: {
    locationId: string;
    companyId: string;
  };
}

async function handleUninstall(event: UninstallEvent) {
  const { locationId, companyId } = event.data;
  
  if (!locationId || !companyId) {
    throw new Error('Missing location or company ID in uninstall event');
  }

  await deleteInstallation(locationId, companyId);
  console.log('Installation marked as uninstalled:', { locationId, companyId });
} 