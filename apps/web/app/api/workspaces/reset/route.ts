import { NextResponse } from 'next/server';

/**
 * POST /api/workspaces/reset
 * Reset all workspaces to default
 * Delegates to the DELETE handler in the main route
 */
export async function POST(request: Request) {
  // Forward to the DELETE handler
  const baseUrl = new URL(request.url).origin;
  const response = await fetch(`${baseUrl}/api/workspaces`, {
    method: 'DELETE',
    headers: request.headers,
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
