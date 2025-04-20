import { getDataFromToken } from "@/helper/getDataFromToken";
import connectDB from "@/lib/db";
import Event from "@/models/eventModel";
import { NextRequest, NextResponse } from "next/server";

connectDB();

export async function GET(request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const eventId = (await params).id

        const event = await Event.findById(eventId)
            .populate({
                path: 'registrations.user',
                select: 'firstName lastName profilePic email'
            })
            .populate({
                path: 'comments.user',
                select: 'firstName lastName profilePic'
            })
            .populate({
                path: 'createdBy',
                select: 'firstName lastName'
            });

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Event details fetched successfully",
            data: event
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
export async function PUT(request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const eventId = (await params).id
        const userId = await getDataFromToken(request);
        const reqBody = await request.json();

        const { title, description, coverImage, startDate, endDate, location, isVirtual, meetingLink, capacity } = reqBody;

        // Find the event
        const event = await Event.findById(eventId);
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Check if user is the creator of the event
        if (event.createdBy.toString() !== userId.toString()) {
            return NextResponse.json({ error: "Unauthorized to edit this event" }, { status: 403 });
        }

        // Update the event
        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            {
                title,
                description,
                coverImage,
                startDate,
                endDate,
                location,
                isVirtual,
                meetingLink,
                capacity
            },
            { new: true }
        );

        return NextResponse.json({
            message: "Event updated successfully",
            data: updatedEvent
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
