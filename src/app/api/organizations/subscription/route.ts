import connectDB from "@/lib/db";
import Organization from "@/models/organizationModel";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
    try {
        await connectDB();

        const { organizationId, extensionDays } = await request.json();

        if (!organizationId || !extensionDays) {
            return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
        }

        // Validate extensionDays
        if (extensionDays <= 0) {
            return NextResponse.json({ error: "Extension days must be a positive number." }, { status: 400 });
        }

        const organization = await Organization.findById(organizationId);
        if (!organization) {
            return NextResponse.json({ error: "Organization not found." }, { status: 404 });
        }

        // Calculate new subscription expiry date
        const currentDate = organization.subscriptionExpires
            ? new Date(organization.subscriptionExpires)
            : new Date();

        currentDate.setDate(currentDate.getDate() + extensionDays);
        organization.subscriptionExpires = currentDate;

        // If organization isn't pro, set it to pro
        if (!organization.isPro) {
            organization.isPro = true;
        }

        await organization.save();

        return NextResponse.json({
            message: "Subscription renewed successfully",
            data: {
                subscriptionExpires: organization.subscriptionExpires,
                isPro: organization.isPro
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
