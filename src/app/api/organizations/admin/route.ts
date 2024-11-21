import connectDB from "@/lib/db";
import Organization from "@/models/organizationModel";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";



export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Fetch all organizations
        const organizations = await Organization.find();

        // Fetch all orgAdmins from the User model
        const users = await User.find({
            role: "orgAdmin", // Fetch only users with the orgAdmin role
        }).select("firstName lastName email whatsappNo organization"); // Select necessary fields

        // Create a mapping of organization ID to their respective orgAdmin
        const userMap = new Map();
        users.forEach((user) => {
            userMap.set(user.organization?.toString(), user); // Map orgId to user
        });

        // Map organizations to include orgAdmin details
        const data = organizations.map((org) => {
            const orgAdmin = userMap.get(org._id.toString()); // Fetch orgAdmin for the organization

            return {
                _id: org._id,
                companyName: org.companyName,
                orgAdmin: orgAdmin
                    ? `${orgAdmin.firstName} ${orgAdmin.lastName}`
                    : "No Admin",
                email: orgAdmin?.email || "N/A",
                whatsappNo: orgAdmin?.whatsappNo || "N/A",
                trialExpires: org.trialExpires,
                isPro: org.isPro,
                subscriptionExpires: org.subscriptionExpires,
            };
        });

        console.log(data, "data");

        return NextResponse.json({
            message: "Organizations fetched successfully",
            data,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { organizationId, extensionDays, revoke } = await request.json();

        const organization = await Organization.findById(organizationId);
        if (!organization) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        if (revoke) {
            // Set the trialExpires date to now to revoke access
            organization.trialExpires = new Date();
        } else {
            // Extend the trial period
            const newTrialDate = new Date(organization.trialExpires);
            if (isNaN(newTrialDate.getTime())) {
                return NextResponse.json({ error: "Invalid trialExpires date" }, { status: 400 });
            }
            newTrialDate.setDate(newTrialDate.getDate() + extensionDays);
            organization.trialExpires = newTrialDate;
        }

        await organization.save();

        return NextResponse.json({
            message: "Operation successful",
            data: organization,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
