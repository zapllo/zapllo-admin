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

        const { announcementName, startDate, endDate, buttonName, buttonLink } = await req.json();

        const updatedAnnouncement = await Announcement.findByIdAndUpdate(
            id,
            { announcementName, startDate, endDate, buttonName, buttonLink },
            { new: true } // Return updated document
        );

        if (!updatedAnnouncement) {
            return NextResponse.json({ error: "Announcement not found." }, { status: 404 });
        }

        return NextResponse.json({ announcement: updatedAnnouncement }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update announcement." }, { status: 500 });
    }
}





export async function DELETE(req: NextRequest, { params }: RouteContext) {
    const { id } = await params; // Await params resolution
    try {
        await connectDB();

        const deletedAnnouncement = await Announcement.findByIdAndDelete(id);

        if (!deletedAnnouncement) {
            return NextResponse.json({ error: "Announcement not found." }, { status: 404 });
        }

        return NextResponse.json({ message: "Announcement deleted successfully." }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to delete announcement." }, { status: 500 });
    }
}