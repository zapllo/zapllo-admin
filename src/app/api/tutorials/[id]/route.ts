import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Tutorial from "@/models/tutorialModel"; // Adjust path to your Tutorial model


// Define RouteContext type with params
interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
    const { id } = await params; // Await params resolution

    try {
        await connectDB();

        const { title, thumbnail, link, category } = await req.json();

        if (!title || !link || !category) {
            return NextResponse.json({ error: "Title, link, and category are required." }, { status: 400 });
        }

        const updatedTutorial = await Tutorial.findByIdAndUpdate(
            id,
            { title, thumbnail, link, category },
            { new: true } // Return the updated document
        );

        if (!updatedTutorial) {
            return NextResponse.json({ error: "Tutorial not found." }, { status: 404 });
        }

        return NextResponse.json({ tutorial: updatedTutorial }, { status: 200 });
    } catch (error: any) {
        console.error("Error updating tutorial:", error);
        return NextResponse.json({ error: "Failed to update tutorial." }, { status: 500 });
    }
}


export async function DELETE(req: NextRequest, { params }: RouteContext) {
    const { id } = await params; // Await params resolution

    try {
        await connectDB();

        const deletedTutorial = await Tutorial.findByIdAndDelete(id);

        if (!deletedTutorial) {
            return NextResponse.json({ error: "Tutorial not found." }, { status: 404 });
        }

        return NextResponse.json({ message: "Tutorial deleted successfully." }, { status: 200 });
    } catch (error: any) {
        console.error("Error deleting tutorial:", error);
        return NextResponse.json({ error: "Failed to delete tutorial." }, { status: 500 });
    }
}