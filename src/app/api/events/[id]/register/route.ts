import connectDB from "@/lib/db";
import Event from "@/models/eventModel";
import { getDataFromToken } from "@/helper/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";

connectDB();

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userId = await getDataFromToken(request);
        const eventId = params.id;

        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Check if event is already full
        if (event.registrations.length >= event.capacity) {
            return NextResponse.json({ error: "Event is already at full capacity" }, { status: 400 });
        }

        // Check if user is already registered
        const isRegistered = event.registrations.some(reg => reg.user.toString() === userId.toString());
        if (isRegistered) {
            return NextResponse.json({ error: "You are already registered for this event" }, { status: 400 });
        }

        // Register the user
        event.registrations.push({ user: userId, registeredAt: new Date() });
        await event.save();

        return NextResponse.json({
            message: "Successfully registered for the event",
            data: event
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userId = await getDataFromToken(request);
        const eventId = params.id;

        // Find the event and pull the user's registration
        const event = await Event.findByIdAndUpdate(
            eventId,
            { $pull: { registrations: { user: userId } } },
            { new: true }
        );

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Successfully unregistered from the event",
            data: event
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
