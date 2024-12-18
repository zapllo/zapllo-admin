import connectDB from "@/lib/db";
import Organization from "@/models/organizationModel";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

connectDB();

export async function DELETE(request: NextRequest) {
    try {
        const { organizationId } = await request.json();
        // Find the organization
        const organization = await Organization.findById(organizationId);
        if (!organization) {
            return NextResponse.json({ error: "Organization not found." }, { status: 404 });
        }

        // Delete all users associated with the organization
        await User.deleteMany({ organization: organizationId });

        // Delete the organization itself
        await Organization.findByIdAndDelete(organizationId);

        return NextResponse.json({ message: "Organization and associated users deleted successfully." }, { status: 200 });
    } catch (error: any) {
        console.error("Error deleting organization:", error.message);
        return NextResponse.json({ error: "Failed to delete organization." }, { status: 500 });
    }
}
