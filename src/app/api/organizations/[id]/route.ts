import connectDB from '@/lib/db';
import Organization from '@/models/organizationModel';
import Task from '@/models/taskModal';
import Ticket from '@/models/ticketModel';
import User from '@/models/userModel';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id

    try {
        await connectDB();

        // Fetch the organization details
        const organization = await Organization.findById(id).lean();

        if (!organization) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
        }

        // Fetch all users directly from the User model associated with this organization
        const users = await User.find({ organization: id })
            .select('firstName lastName email whatsappNo profilePic role isTaskAccess isLeaveAccess')
            .lean();

        // User-specific stats
        const totalUsers = users.length;
        const usersWithTaskAccess = users.filter((user) => user.isTaskAccess).length;
        const usersWithLeaveAccess = users.filter((user) => user.isLeaveAccess).length;

        // Fetch task-related stats
        const totalTasks = await Task.countDocuments({ organization: id });
        const completedTasks = await Task.countDocuments({ organization: id, status: 'Completed' });
        const pendingTasks = await Task.countDocuments({ organization: id, status: 'Pending' });
        const inProgressTasks = await Task.countDocuments({ organization: id, status: 'In Progress' });

        const completedTasksPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Fetch ticket-related stats
        const totalTickets = await Ticket.countDocuments({ user: { $in: users.map((user) => user._id) } });
        const pendingTickets = await Ticket.countDocuments({
            user: { $in: users.map((user) => user._id) },
            status: 'Pending',
        });
        const resolvedTickets = await Ticket.countDocuments({
            user: { $in: users.map((user) => user._id) },
            status: 'Resolved',
        });

        // Stats object
        const stats = {
            totalTasks,
            completedTasks,
            completedTasksPercentage,
            pendingTasks,
            inProgressTasks,
            totalUsers,
            usersWithTaskAccess,
            usersWithLeaveAccess,
            totalTickets,
            pendingTickets,
            resolvedTickets,
        };
        console.log(organization, 'org?')
        return NextResponse.json({ organization, users, stats }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching organization:', error);
        return NextResponse.json(
            { error: 'Failed to fetch organization', details: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id
    try {
        await connectDB();

        const organization = await Organization.findByIdAndDelete(id);

        if (!organization) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Organization deleted successfully' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to delete organization' }, { status: 500 });
    }
}
