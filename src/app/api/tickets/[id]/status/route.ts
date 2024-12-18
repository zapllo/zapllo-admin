import { NextRequest, NextResponse } from 'next/server';
import Ticket from '@/models/ticketModel';
import User from '@/models/userModel';
import connectDB from '@/lib/db';
import { getDataFromToken } from '@/helper/getDataFromToken';
import { sendEmail, SendEmailOptions } from '@/lib/sendEmail';


// Helper function to format date
const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: '2-digit' };
    return new Intl.DateTimeFormat('en-GB', options).format(date);
};

// Helper function to send WhatsApp notification
const sendWhatsAppNotification = async (
    user: any,
    ticketId: string,
    status: string,
    comment: string,
    templateName: string
) => {
    const payload = {
        phoneNumber: user.whatsappNo,
        country: user.country,
        templateName: templateName,
        bodyVariables: [
            user.firstName,
            `#${ticketId}`, // Ticket ID
            status,
            comment || 'No additional comments',
        ],
    };

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
};


// Helper function to send email for ticket creation
const sendTicketStatusUpdate = async (ticketData: any) => {
    const emailOptions: SendEmailOptions = {
        to: `${ticketData.email}`, // Assumes the email is part of the ticket data
        text: "Ticket Status Updated",
        subject: "Ticket Status Updated",
        html: `<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
    <div style="background-color: #f0f4f8; padding: 20px; ">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <div style="padding: 20px; text-align: center;">
                <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1724000375/orjojzjia7vfiycfzfly.png" alt="Zapllo Logo" style="max-width: 150px; height: auto;">
            </div>
          <div style="background: linear-gradient(90deg, #7451F8, #F57E57); color: #ffffff; padding: 20px 40px; font-size: 16px; font-weight: bold; text-align: center; border-radius: 12px; margin: 20px auto; max-width: 80%;">
    <h1 style="margin: 0; font-size: 20px;">Ticket Status Updated to ${ticketData.status}</h1>
</div>
                    <div style="padding: 20px;">
                        <p>Dear ${ticketData.customerName},</p>
                        <p>The support team has replied to your ticket </p>
                         <div style="border-radius:8px; margin-top:4px; color:#000000; padding:10px; background-color:#ECF1F6">
                        <p><strong>Ticket ID:</strong> #${ticketData.ticketId}</p>
                        <p><strong>Remarks:</strong> ${ticketData.comment}</p>
                        <p><strong>Updated at:</strong> ${formatDate(ticketData.updatedAt)}</p>
                        </div>
                        <p>We appreciate your patience while we work to resolve your inquiry.</p>
                        <div style="text-align: center; margin-top: 20px;">
                            <a href="https://zapllo.com/help/tickets" style="background-color: #0C874B; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Ticket</a>
                        </div>
                        <p style="margin-top:20px; text-align:center; font-size: 12px; color: #888888;">This is an automated notification. Please do not reply.</p>
                    </div>
                </div>
            </div>
        </body>`,
    };

    await sendEmail(emailOptions);
};


// PATCH /api/tickets/[id]/status
export async function PATCH(req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id
    try {


        await connectDB();

        const { status, comment, fileUrls } = await req.json();

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        // Find the ticket and update its status
        const updatedTicket = await Ticket.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedTicket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        const userId = await getDataFromToken(req);
        // Slice the ticketId from _id to 6 characters
        const ticketId = updatedTicket._id.toString().slice(0, 4);

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
        const user = await User.findById(updatedTicket.user).select('email firstName whatsappNo')

        if (user && (status === 'In Resolution' || status === 'Closed')) {
            const templateName = status === 'In Resolution' ? 'ticketinresolution' : 'ticketclosed';
            // Send the email notification
            await sendTicketStatusUpdate({
                customerName: user?.firstName,
                email: user?.email,
                ticketId, // Use the 6-character sliced ticket ID
                createdAt: updatedTicket.createdAt,
                updatedAt: new Date(),
                status,
                comment,
            });
            await sendWhatsAppNotification(user, ticketId, status, comment, templateName);
        }

        return NextResponse.json(updatedTicket, { status: 200 });
    } catch (error: any) {
        console.error('Error updating ticket status:', error);
        return NextResponse.json({ error: 'Failed to update ticket status', details: error.message }, { status: 500 });
    }
}
