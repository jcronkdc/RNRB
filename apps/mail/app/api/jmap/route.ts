import { NextResponse } from 'next/server';

const STALWART_JMAP_URL = process.env.STALWART_JMAP_URL || 'https://mail.rnrb.me/jmap';

/**
 * Proxy API for JMAP requests
 * Solves CORS issues by making server-side requests to Stalwart
 */

export async function GET(request: Request) {
  // Proxy GET requests (session info)
  const authHeader = request.headers.get('Authorization');

  if (!authHeader) {
    return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
  }

  try {
    const response = await fetch(STALWART_JMAP_URL, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[JMAP Proxy] GET error:', error);
    return NextResponse.json({ error: 'Failed to connect to mail server' }, { status: 502 });
  }
}

export async function POST(request: Request) {
  // Proxy POST requests (JMAP method calls)
  const authHeader = request.headers.get('Authorization');

  if (!authHeader) {
    return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const response = await fetch(STALWART_JMAP_URL, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      return NextResponse.json(
        { error: `JMAP request failed: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[JMAP Proxy] POST error:', error);
    return NextResponse.json({ error: 'Failed to connect to mail server' }, { status: 502 });
  }
}
