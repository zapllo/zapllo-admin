import connectDB from '@/lib/db'
import Ticket from '@/models/ticketModel'
import { NextRequest, NextResponse } from 'next/server'


// Get ticket by ID
export async function GET(request: NextRequest, context: { params: { id: string } }) {
    try {
        const { id } = context.params; // Access params correctly
        await connectDB();

        const ticket = await Ticket.findById(id).populate({
            path: 'comments.userId',
            select: 'firstName lastName',
        });

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        return NextResponse.json(ticket);
    } catch (error) {
        console.error('Error fetching ticket:', error);
        return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
    }
}

// Delete ticket by ID
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
    try {
        const { id } = context.params; // Access params correctly
        await connectDB();

        const ticket = await Ticket.findByIdAndDelete(id);

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Ticket deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting ticket:', error);
        return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 });
    }
}

