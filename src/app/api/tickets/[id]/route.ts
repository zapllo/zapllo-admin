import connectDB from '@/lib/db'
import Ticket from '@/models/ticketModel'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params
    try {
        await connectDB();

        const ticket = await Ticket.findById(id).populate({
            path: 'comments.userId',
            select: 'firstName lastName'
        });
        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
        }

        return NextResponse.json(ticket)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 })
    }
}


export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;
    try {
        await connectDB();

        const ticket = await Ticket.findByIdAndDelete(id);

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Ticket deleted successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 });
    }
}