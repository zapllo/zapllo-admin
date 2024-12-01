import connectDB from "@/lib/db";
import Announcement from "@/models/announcementModel";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const data = await request.json();

        const attachment = new Announcement(data);
        await attachment.save();

        return NextResponse.json({ success: true, attachment });
    } catch (error) {
        console.error("Failed to create attachment:", error);
        return NextResponse.json(
            { success: false, message: "Failed to create attachment" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        await connectDB();
        // Fetch only the announcements with isActive set to true
        const attachments = await Announcement.find({ isActive: true }).lean();

        return NextResponse.json({ success: true, attachments });
    } catch (error) {
        console.error("Failed to fetch attachments:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch attachments" },
            { status: 500 }
        );
    }
}