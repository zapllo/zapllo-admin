import connectDB from "@/lib/db";
import ChecklistItem from "@/models/checklistModel";
import { NextRequest, NextResponse } from "next/server";

connectDB();


export async function GET() {
    try {
        const checklistItems = await ChecklistItem.find();
        return NextResponse.json({ checklistItems }, { status: 200 });
    } catch (error) {
        console.error("Error fetching checklist items:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
