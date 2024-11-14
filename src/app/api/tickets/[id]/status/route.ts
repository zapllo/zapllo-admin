import { NextRequest, NextResponse } from 'next/server'
import Ticket from '@/models/ticketModel'
import User from '@/models/userModel'
import connectDB from '@/lib/db'
import { getDataFromToken } from '@/helper/getDataFromToken'

// Helper function to send WhatsApp notification
const sendWhatsAppNotification = async (user: any, ticketId: string, status: string, comment: string, templateName: string) => {
    const payload = {
        phoneNumber: user.whatsappNo,
        templateName: templateName,
        bodyVariables: [
            user.firstName,
            `#${ticketId}`, // Ticket ID
            status,
            comment,
        ],
    }

    try {
        const response = await fetch('https://zapllo.com/api/webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const responseData = await response.json();
            throw new Error(`Webhook API error, response data: ${JSON.stringify(responseData)}`);
        }

        console.log('WhatsApp notification sent successfully:', payload);
    } catch (error) {
        console.error('Error sending WhatsApp notification:', error);
    }
}

// PATCH /api/tickets/[id]/status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();

        const { status, comment, fileUrls } = await req.json();

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        // Find the ticket and update its status
        const updatedTicket = await Ticket.findByIdAndUpdate(
            params.id,
            { status },
            { new: true }
        );

        if (!updatedTicket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        const userId = await getDataFromToken(req);
        // Slice the ticketId from _id to 6 characters
        const ticketId = updatedTicket._id.toString().slice(0, 6);
        // Add the comment
        if (comment) {
            updatedTicket.comments.push({
                userId,
                content: comment,
                fileUrls: fileUrls || [],
                createdAt: new Date(),
            });
            await updatedTicket.save();
        }

        // Get user details for WhatsApp notification
        const user = await User.findById(updatedTicket.user);

        if (user && (status === 'In Resolution' || status === 'Closed')) {
            const templateName = status === 'In Resolution' ? 'ticketinresolution' : 'ticketclosed';
            await sendWhatsAppNotification(user, ticketId, status, comment, templateName);
        }

        return NextResponse.json(updatedTicket);
    } catch (error) {
        console.error('Error updating ticket status:', error);
        return NextResponse.json({ error: 'Failed to update ticket status' }, { status: 500 });
    }
}
