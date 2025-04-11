import connectDB from "@/lib/db";
import Task from "@/models/taskModal";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id
  try {
    await connectDB();
    const organizationId = id;

    // Fetch tasks for this organization with populated user data
    const tasks = await Task.find({ organization: organizationId })
      .populate('assignedUser', 'firstName lastName')
      .populate('user', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10); // Limit to most recent 10 tasks

    return NextResponse.json({
      message: "Tasks fetched successfully",
      tasks,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
