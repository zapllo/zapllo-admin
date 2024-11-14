import connectDB from '@/lib/db'
import Ticket, { IComment } from '@/models/ticketModel'
import User from '@/models/userModel'
import { NextRequest, NextResponse } from 'next/server'
import { getDataFromToken } from '@/helper/getDataFromToken'
import { Types } from 'mongoose'

// Get comments for a ticket
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params
    try {
        await connectDB();

        const ticket = await Ticket.findById(id).populate({
            path: 'comments.userId',
            select: 'firstName lastName'
        });

        console.log(ticket, 'check')
        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        return NextResponse.json(ticket.comments || []);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

// Post a new comment to a ticket
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params
    try {
        await connectDB()

        const { comment, fileUrls } = await req.json()
        if (!comment || typeof comment !== 'string') {
            return NextResponse.json({ error: 'Invalid comment' }, { status: 400 })
        }

        const ticket = await Ticket.findById(id)
        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
        }

        const userId = await getDataFromToken(req)
        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
        }
        console.log(userId, comment, 'lets check')

        const newComment: IComment = {
            userId,  // Ensure _id is of type ObjectId
            content: comment,
            fileUrls, // Ensure this is consistent with your schema (or use undefined if preferable)
            createdAt: new Date()
        }

        ticket.comments.push(newComment)
        await ticket.save()

        return NextResponse.json(newComment, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 })
    }
}
