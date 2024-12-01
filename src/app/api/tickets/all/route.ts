import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Ticket from "@/models/ticketModel";

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // Fetch all tickets with user and organization data populated
        const tickets = await Ticket.find({})
            .populate({
                path: 'user',
                select: 'firstName lastName organization email',
                populate: {
                    path: 'organization',
                    select: 'companyName',
                },
            })
            .lean();

        // Calculate stats
        const totalTickets = tickets.length;
        const resolvedTickets = tickets.filter(ticket => ticket.status === "Closed").length;
        const pendingTickets = tickets.filter(ticket => ticket.status === "Pending").length;
        const inResolutionTickets = tickets.filter(ticket => ticket.status === "In Resolution").length;

        // Return tickets and stats as response
        return NextResponse.json({
            tickets,
            stats: {
                totalTickets,
                resolvedTickets,
                pendingTickets,
                inResolutionTickets,
            },
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
    }
}
