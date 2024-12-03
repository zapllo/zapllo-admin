import connectDB from '@/lib/db';
import Ticket, { IComment } from '@/models/ticketModel';
import { NextRequest, NextResponse } from 'next/server';
import { getDataFromToken } from '@/helper/getDataFromToken';

// Define RouteContext type with params
interface RouteContext {
    params: Promise<{ id: string }>;
}

// Get comments for a ticket
export async function GET(req: NextRequest, { params }: RouteContext) {
    const { id } = await params; // Await params resolution

    try {
        await connectDB();

        const ticket = await Ticket.findById(id).populate({
            path: 'comments.userId',
            select: 'firstName lastName',
        });

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        return NextResponse.json(ticket.comments || [], { status: 200 });
    } catch (error: any) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: 'Failed to fetch comments', details: error.message }, { status: 500 });
    }
}

// Post a new comment to a ticket
export async function POST(req: NextRequest, { params }: RouteContext) {
    const { id } = await params; // Await params resolution

    try {
        await connectDB();

        const { comment, fileUrls } = await req.json();

        // Validate comment
        if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
            return NextResponse.json({ error: 'Invalid or empty comment' }, { status: 400 });
        }

        const userId = await getDataFromToken(req);

        // Validate userId
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized or missing user ID' }, { status: 401 });
        }

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        const newComment: IComment = {
            userId,
            content: comment,
            fileUrls: fileUrls || [],
            createdAt: new Date(),
        };

        // Add the comment to the ticket
        ticket.comments.push(newComment);
        await ticket.save();

        return NextResponse.json(newComment, { status: 201 });
    } catch (error: any) {
        console.error('Error adding comment:', error);
        return NextResponse.json({ error: 'Failed to add comment', details: error.message }, { status: 500 });
    }
}
