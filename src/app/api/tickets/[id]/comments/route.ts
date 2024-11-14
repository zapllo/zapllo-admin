import connectDB from '@/lib/db'
import Ticket, { IComment } from '@/models/ticketModel'
import { NextRequest, NextResponse } from 'next/server'
import { getDataFromToken } from '@/helper/getDataFromToken'

// Get comments for a ticket
export async function GET(req: NextRequest, { params }: { params: any }) {
    const { id } = params;  // Accessing `id` from `params` directly
    try {
        await connectDB();
        const ticket = await Ticket.findById(id).populate({
            path: 'comments.userId',
            select: 'firstName lastName'
        });

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        return NextResponse.json(ticket.comments || []);
    } catch (error) {
        console.error("Error fetching comments:", error);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

// Post a new comment to a ticket
export async function POST(req: NextRequest, { params }: { params: any }) {
    const { id } = params;  // Accessing `id` from `params` directly
    try {
        await connectDB();
        const { comment, fileUrls } = await req.json();

        if (!comment || typeof comment !== 'string') {
            return NextResponse.json({ error: 'Invalid comment' }, { status: 400 });
        }

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        const userId = await getDataFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const newComment: IComment = {
            userId,
            content: comment,
            fileUrls,
            createdAt: new Date()
        };

        ticket.comments.push(newComment);
        await ticket.save();

        return NextResponse.json(newComment, { status: 201 });
    } catch (error) {
        console.error("Error adding comment:", error);
        return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
    }
}
