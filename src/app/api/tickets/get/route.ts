import { getDataFromToken } from "@/helper/getDataFromToken";
import connectDB from "@/lib/db";
import Ticket from "@/models/ticketModel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDB(); // Ensure the database is connected

        const user = await getDataFromToken(req);

        if (!user) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // Fetch tickets for the specific user and populate user data
        const tickets = await Ticket.find({ user });
        console.log(tickets, 'tickets')
        return NextResponse.json(tickets);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
    }
}