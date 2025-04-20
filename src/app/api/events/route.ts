import connectDB from "@/lib/db";
import Event from "@/models/eventModel";
import { getDataFromToken } from "@/helper/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";

connectDB();

// Get all events
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const filter = searchParams.get('filter') || 'all'; // all, upcoming, past

        // Get current date without time for more accurate comparison
        const currentDate = new Date();
        let query = {};

        console.log("Filter type:", filter);
        console.log("Current date:", currentDate);

        if (filter === 'upcoming') {
            query = { endDate: { $gte: currentDate } }; // Show events that haven't ended yet
        } else if (filter === 'past') {
            query = { endDate: { $lt: currentDate } }; // Show events that have ended
        }

        console.log("Query:", JSON.stringify(query));

        // First let's just find all events with no filtering to debug
        const allEvents = await Event.find({}).lean();
        console.log("Total events in DB:", allEvents.length);
        if (allEvents.length > 0) {
            console.log("Sample event:", JSON.stringify(allEvents[0]));
        }

        // Now apply the filter
        const events = await Event.find(query)
            .sort({ startDate: filter === 'past' ? -1 : 1 })
            .populate({
                path: 'registrations.user',
                select: 'firstName lastName profilePic'
            })
            .populate({
                path: 'comments.user',
                select: 'firstName lastName profilePic'
            });

        console.log("Filtered events count:", events.length);

        return NextResponse.json({
            message: "Events fetched successfully",
            data: events
        });
    } catch (error: any) {
        console.error("Error fetching events:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// Rest of the code remains the same
// Create new event (admin only)
export async function POST(request: NextRequest) {
    try {
        const userId = await getDataFromToken(request);
        const reqBody = await request.json();

        const { title, description, coverImage, startDate, endDate, location, isVirtual, meetingLink, capacity } = reqBody;

        const newEvent = await Event.create({
            title,
            description,
            coverImage,
            startDate,
            endDate,
            location,
            isVirtual,
            meetingLink,
            capacity,
            createdBy: userId
        });

        return NextResponse.json({
            message: "Event created successfully",
            data: newEvent
        }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
