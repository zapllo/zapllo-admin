import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch('https://crm.zapllo.com/api/admin/tickets', {
      headers: {
        // Copy any required auth headers from the original request
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();

    // Return the data from the CRM API
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from CRM API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from CRM' },
      { status: 500 }
    );
  }
}
