import connectDB from "@/lib/db";
import Event from "@/models/eventModel";
import { getDataFromToken } from "@/helper/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";

connectDB();

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userId = await getDataFromToken(request);
        const eventId = params.id;
        const { text } = await request.json();

        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Check if user is registered for the event
        const isRegistered = event.registrations.some(reg => reg.user.toString() === userId.toString());
        if (!isRegistered) {
            return NextResponse.json({ error: "Only registered users can comment" }, { status: 403 });
        }

        // Add the comment
        event.comments.push({ user: userId, text, createdAt: new Date() });
        await event.save();

        // Populate user details for the new comment
        const updatedEvent = await Event.findById(eventId).populate({
            path: 'comments.user',
            select: 'firstName lastName profilePic'
        });

        return NextResponse.json({
            message: "Comment added successfully",
            data: updatedEvent?.comments[updatedEvent.comments.length - 1]
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
