import connectDB from "@/lib/db";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id
  try {
    await connectDB();
    const organizationId = id;

    // Fetch all users belonging to this organization
    const users = await User.find({ organization: organizationId })
      .select("firstName lastName email whatsappNo role status profilePic");

    return NextResponse.json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
