import { NextRequest, NextResponse } from "next/server";
import Tutorial from "@/models/tutorialModel";
import connectDB from "@/lib/db";

export async function GET() {
    try {
        await connectDB(); // Ensure the database is connected
        const tutorials = await Tutorial.find().lean(); // Fetch tutorials from the database
        return NextResponse.json({ success: true, tutorials });
    } catch (error) {
        console.error("Failed to fetch tutorials:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch tutorials" }, { status: 500 });
    }
}


export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();

        // Validate the required fields
        const { title, thumbnail, link, category } = body;
        if (!title || !thumbnail || !link || !category) {
            return NextResponse.json(
                { message: "All fields are required." },
                { status: 400 }
            );
        }

        // Create a new tutorial
        const newTutorial = await Tutorial.create({
            title,
            thumbnail,
            link,
            category,
        });

        return NextResponse.json(
            { message: "Tutorial created successfully.", tutorial: newTutorial },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating tutorial:", error);
        return NextResponse.json(
            { message: "Failed to create tutorial." },
            { status: 500 }
        );
    }
}
