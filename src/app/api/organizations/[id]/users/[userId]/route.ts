import connectDB from "@/lib/db";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const userId = (await params).userId
  try {
    await connectDB();
    const updates = await req.json();

    // Find the user and update
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user fields
    if (updates.firstName) user.firstName = updates.firstName;
    if (updates.lastName) user.lastName = updates.lastName;
    if (updates.email) user.email = updates.email;
    if (updates.whatsappNo) user.whatsappNo = updates.whatsappNo;
    if (updates.role) user.role = updates.role;
    if (updates.status) user.status = updates.status;

    // Set isAdmin based on role
    user.isAdmin = updates.role === 'orgAdmin';

    await user.save();

    return NextResponse.json({
      message: "User updated successfully",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        whatsappNo: user.whatsappNo,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    await connectDB();
    const { userId } = params;

    // Find and delete the user
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
