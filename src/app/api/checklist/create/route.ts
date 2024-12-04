import connectDB from "@/lib/db";
import ChecklistItem from "@/models/checklistModel";
import { NextRequest, NextResponse } from "next/server";

connectDB();

export async function POST(request: NextRequest) {
    try {
        const { text, tutorialLink, category } = await request.json();

        if (!text) {
            return NextResponse.json({ error: "Checklist text is required" }, { status: 400 });
        }

        const checklistItem = new ChecklistItem({ text, tutorialLink, category });
        await checklistItem.save();

        return NextResponse.json({ message: "Checklist item created successfully", checklistItem }, { status: 201 });
    } catch (error) {
        console.error("Error creating checklist item:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
