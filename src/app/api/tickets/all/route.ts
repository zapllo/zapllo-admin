import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Ticket from "@/models/ticketModel";
import User from "@/models/userModel"; // Import the User model
import Organization from "@/models/organizationModel"; // Import the Organization model

export async function GET(req: NextRequest) {
    try {
        console.log("Connecting to the database...");
        await connectDB();
        console.log("Database connected successfully.");

        console.log("Fetching tickets...");
        const tickets = await Ticket.find({})
            .populate({
                path: 'user', // Reference the 'user' field in the Ticket model
                model: User, // Explicitly use the imported User model
                select: 'firstName lastName organization email', // Fields to select from the User model
                populate: {
                    path: 'organization', // Reference the 'organization' field in the User model
                    model: Organization, // Explicitly use the imported Organization model
                    select: 'companyName', // Fields to select from the Organization model
                },
            })
            .lean();

        if (!tickets || tickets.length === 0) {
            console.error("No tickets found.");
        } else {
            console.log(`Fetched ${tickets.length} tickets.`);
        }

        // Calculate stats
        const totalTickets = tickets.length;
        const resolvedTickets = tickets.filter(ticket => ticket.status === "Closed").length;
        const pendingTickets = tickets.filter(ticket => ticket.status === "Pending").length;
        const inResolutionTickets = tickets.filter(ticket => ticket.status === "In Resolution").length;

        console.log("Stats calculated:", {
            totalTickets,
            resolvedTickets,
            pendingTickets,
            inResolutionTickets,
        });

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
        console.error("An error occurred while fetching tickets:", error);
        return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
    }
}
