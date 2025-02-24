import { NextRequest, NextResponse } from 'next/server';
import { saveInstallation } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');
    const locationId = searchParams.get('locationId');
    const companyId = searchParams.get('companyId');
    const storedState = request.cookies.get('oauth_state')?.value;

    // Verify state to prevent CSRF
    if (!state || !storedState || state !== storedState) {
      return NextResponse.json(
        { error: 'Invalid state parameter' },
        { status: 400 }
      );
    }

    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.json(
        { error: 'Authorization denied' },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: 'No authorization code received' },
        { status: 400 }
      );
    }

    console.log('Received auth code:', code);
    console.log('Location ID:', locationId);
    console.log('Company ID:', companyId);

    // Exchange the authorization code for tokens using the marketplace endpoint
    const tokenResponse = await fetch('https://services.leadconnectorhq.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.NEXT_PUBLIC_GHL_CLIENT_ID,
        client_secret: process.env.GHL_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.NEXT_PUBLIC_GHL_REDIRECT_URI,
        user_type: 'Location' // Case sensitive
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange error:', errorText);
      return NextResponse.json(
        { error: 'Failed to exchange authorization code', details: errorText },
        { status: 500 }
      );
    }

    const tokenData = await tokenResponse.json();
    console.log('Token exchange successful');

    // Save the installation data
    if (locationId && companyId) {
      await saveInstallation({
        locationId,
        companyId,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        tokenType: tokenData.token_type,
        installedAt: new Date().toISOString(),
        tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      });
    }

    // Create the response with tokens
    const response = NextResponse.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
      locationId,
      companyId
    });

    // Set secure cookies for token storage
    response.cookies.set('ghl_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expires_in
    });

    response.cookies.set('ghl_refresh_token', tokenData.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    // Clear the oauth_state cookie
    response.cookies.delete('oauth_state');

    // Redirect to the dashboard with location ID and company ID
    const redirectUrl = new URL('/dashboard', request.url);
    if (locationId) {
      redirectUrl.searchParams.set('locationId', locationId);
    }
    if (companyId) {
      redirectUrl.searchParams.set('companyId', companyId);
    }

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.json(
      { error: 'Failed to complete authentication' },
      { status: 500 }
    );
  }
} 