import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const clientId = process.env.NEXT_PUBLIC_GHL_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_GHL_REDIRECT_URI;
    
    if (!clientId || !redirectUri) {
      return NextResponse.json(
        { error: 'Missing OAuth configuration' },
        { status: 500 }
      );
    }

    // Required scopes for the application
    const scopes = [
      'locations.readonly',
      'locations.write',
      'opportunities.readonly',
      'opportunities.write',
      'pipelines.readonly',
      'contacts.readonly'
    ].join(' '); // Use space for OAuth2 standard

    // State parameter to prevent CSRF
    const state = Buffer.from(Date.now().toString()).toString('base64');

    // Construct the authorization URL with the correct parameters
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scopes,
      state: state,
      access_type: 'offline'
    });

    // Use the correct OAuth endpoint as shown in the video
    const authUrl = `https://api.sandbox.gohighlevel.com/oauth/chooselocation?${params.toString()}`;

    console.log('Redirecting to:', authUrl);

    // Store the state in the response for verification in the callback
    const response = NextResponse.json({ authorizationUrl: authUrl });
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 5 // 5 minutes
    });

    return response;
  } catch (error) {
    console.error('Auth initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize authentication' },
      { status: 500 }
    );
  }
} 