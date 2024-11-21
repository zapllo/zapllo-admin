import connectDB from "@/lib/db";
import Onboarding from "@/models/onboardingModel";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const onboardingLogs = await Onboarding.find();
        return NextResponse.json({
            message: "Onboarding logs fetched successfully",
            data: onboardingLogs,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
