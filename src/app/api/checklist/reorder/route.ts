// /api/checklist/reorder.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ChecklistItem from "@/models/checklistModel";

connectDB();

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json(); // Expecting an array of updated items
        const { updates } = body; // Array of items with `_id` and `order`

        if (!updates || !Array.isArray(updates)) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }

        // Update the order of each item
        await Promise.all(
            updates.map(async (item: { _id: string; order: number }) => {
                await ChecklistItem.findByIdAndUpdate(item._id, { order: item.order });
            })
        );

        return NextResponse.json({ message: "Order updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error updating order:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
