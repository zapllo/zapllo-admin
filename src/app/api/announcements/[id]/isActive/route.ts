import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Announcement from "@/models/announcementModel";

// Define RouteContext type with params
interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
    const { id } = await params; // Await params resolution
    try {
        await connectDB();

        const body = await req.json();
        const { isActive } = body;

        if (isActive) {
            // Deactivate all other announcements if activating one
            await Announcement.updateMany({}, { isActive: false });
        }

        // Update the specified announcement's isActive status
        const updatedAnnouncement = await Announcement.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (!updatedAnnouncement) {
            return NextResponse.json({ error: "Announcement not found." }, { status: 404 });
        }

        return NextResponse.json({ announcement: updatedAnnouncement }, { status: 200 });
    } catch (error) {
        console.error("Error updating isActive:", error);
        return NextResponse.json({ error: "Failed to update isActive." }, { status: 500 });
    }
}
