import connectDB from "@/lib/db";
import Organization from "@/models/organizationModel";
import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

export async function PATCH(req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id
  try {
    await connectDB();

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid organization ID" }, { status: 400 });
    }

    const { subscribedUserCount } = await req.json();

    if (subscribedUserCount === undefined || subscribedUserCount < 0) {
      return NextResponse.json({ error: "Invalid subscribed user count" }, { status: 400 });
    }

    const organization = await Organization.findById(id);

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    organization.subscribedUserCount = subscribedUserCount;
    await organization.save();

    return NextResponse.json({
      success: true,
      message: "Subscribed user count updated successfully",
      data: {
        subscribedUserCount: organization.subscribedUserCount
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update subscribed user count" },
      { status: 500 }
    );
  }
}
