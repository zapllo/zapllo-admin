import connectDB from "@/lib/db";
import Ticket from "@/models/ticketModel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id
  try{
    await connectDB();
    const organizationId = id;

    // Fetch tickets and populate user data
    // First, get users that belong to this organization
    const tickets = await Ticket.find({})
      .populate({
        path: 'user',
        select: 'firstName lastName organization',
        match: { organization: organizationId }, // Only match users from this org
      })
      .sort({ createdAt: -1 })
      .limit(10); // Limit to 10 most recent tickets

    // Filter out tickets where user is null (not belonging to this org)
    const orgTickets = tickets.filter(ticket => ticket.user !== null);

    return NextResponse.json({
      message: "Tickets fetched successfully",
      tickets: orgTickets,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
