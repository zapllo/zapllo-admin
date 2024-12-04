import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ChecklistItem from "@/models/checklistModel";

connectDB();

// Define RouteContext type with params
interface RouteContext {
    params: Promise<{ id: string }>;
}

// Delete a checklist item
export async function DELETE(req: NextRequest, { params }: RouteContext) {
    const { id } = await params; // Await params resolution

    try {
        const deletedItem = await ChecklistItem.findByIdAndDelete(id);
        if (!deletedItem) {
            return NextResponse.json({ error: "Checklist item not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Checklist item deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting checklist item:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// Edit a checklist item
export async function PATCH(req: NextRequest, { params }: RouteContext) {
    const { id } = await params; // Await params resolution

    try {
        const body = await req.json();
        const { text, tutorialLink, category } = body;

        const updatedItem = await ChecklistItem.findByIdAndUpdate(
            id,
            { text, tutorialLink, category },
            { new: true, runValidators: true }
        );

        if (!updatedItem) {
            return NextResponse.json({ error: "Checklist item not found" }, { status: 404 });
        }

        return NextResponse.json({ checklistItem: updatedItem }, { status: 200 });
    } catch (error) {
        console.error("Error updating checklist item:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
