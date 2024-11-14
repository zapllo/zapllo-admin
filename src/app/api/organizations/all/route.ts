import connectDB from "@/lib/db";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import Organization from "@/models/organizationModel";

connectDB();

export async function GET(request: NextRequest) {
    try {
    
        const organization = await Organization.find({});

        return NextResponse.json({
            message: "Organizations fetched successfully",
            data: organization,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
