import connectDB from '@/lib/db';
import Organization from '@/models/organizationModel';
import Task from '@/models/taskModal';
import Ticket from '@/models/ticketModel';
import User from '@/models/userModel';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id

    try {
        const response = await fetch(`https://crm.zapllo.com/api/admin/tickets/${id}`, {
             headers: {
               // Copy any required auth headers from the original request
               'Authorization': req.headers.get('Authorization') || '',
               'Content-Type': 'application/json',
             },
             cache: 'no-store',
           });

           const data = await response.json();

           // Return the data from the CRM API
           return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching organization:', error);
        return NextResponse.json(
            { error: 'Failed to fetch organization', details: error.message },
            { status: 500 }
        );
    }
}



export async function POST(req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id

  try {
    // read the payload from the request
    const body = await req.json();

    // forward to the actual CRM endpoint
    const crmResponse = await fetch(`https://crm.zapllo.com/api/admin/tickets/${id}`, {
      method: 'POST',
      headers: {
        'Authorization': req.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await crmResponse.json();
    if (!crmResponse.ok) {
      // e.g. return the error from the CRM
      return NextResponse.json(data, { status: crmResponse.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: 'Error proxying POST to CRM', details: error.message }, { status: 500 });
  }
}
