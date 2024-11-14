// app/api/tickets/route.ts

import { NextResponse } from 'next/server';
import Ticket from '@/models/ticketModel';
import connectDB from '@/lib/db';
import { sendEmail, SendEmailOptions } from '@/lib/sendEmail';
import User from '@/models/userModel';

// Helper function to format date
const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: '2-digit' };
    return new Intl.DateTimeFormat('en-GB', options).format(date);
};


// Helper function to send WhatsApp notification for ticket creation
const sendTicketWebhookNotification = async (user: any, ticketData: any) => {
    const payload = {
        phoneNumber: user.whatsappNo,
        templateName: 'ticketrequest',
        bodyVariables: [
            user.firstName,
            `#${ticketData._id}`, // Ensure Ticket ID is a string
            formatDate(ticketData.createdAt), // Ensure Created Date is formatted as a string
            ticketData.subject, // Ticket Subject
        ]
    };
    console.log('Payload for WhatsApp notification:', JSON.stringify(payload, null, 2), user.whatsappNo);

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
const sendTicketCreationEmail = async (ticketData: any) => {
    const emailOptions: SendEmailOptions = {
        to: `${ticketData.email}`, // Assumes the email is part of the ticket data
        text: "New Ticket Created",
        subject: "New Ticket Created",
        html: `<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
    <div style="background-color: #f0f4f8; padding: 20px; ">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <div style="padding: 20px; text-align: center;">
                <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1724000375/orjojzjia7vfiycfzfly.png" alt="Zapllo Logo" style="max-width: 150px; height: auto;">
            </div>
          <div style="background: linear-gradient(90deg, #7451F8, #F57E57); color: #ffffff; padding: 20px 40px; font-size: 16px; font-weight: bold; text-align: center; border-radius: 12px; margin: 20px auto; max-width: 80%;">
    <h1 style="margin: 0; font-size: 20px;">New Ticket Created</h1>
</div>
                    <div style="padding: 20px;">
                        <p>Dear ${ticketData.customerName},</p>
                        <p>Thank you for reaching out to us! Your support ticket has been successfully created. Our team will review your request and reply as soon as possible.</p>
                         <div style="border-radius:8px; margin-top:4px; color:#000000; padding:10px; background-color:#ECF1F6">
                        <p><strong>Ticket ID:</strong> #${ticketData.ticketId}</p>
                        <p><strong>Date Created:</strong> ${formatDate(ticketData.createdAt)}</p>
                        <p><strong>Issue:</strong> ${ticketData.issue}</p>
                        <p><strong>Description:</strong> ${ticketData.description}</p>
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

// POST request to create a new ticket
export async function POST(req: Request) {
    try {
        await connectDB(); // Ensure the database is connected
        const data = await req.json(); // Parse the request body

        const newTicket = new Ticket(data); // Create a new ticket instance
        await newTicket.save(); // Save the ticket to the database

        // Slice the ticketId from _id to 6 characters
        const ticketId = newTicket._id.toString().slice(0, 6);

        // Fetch user details including email
        const user = await User.findById(data.user).select('email firstName whatsappNo'); // Assuming `user` contains the user ID

        // Send the email notification
        await sendTicketCreationEmail({
            customerName: user?.firstName,
            email: user?.email,
            ticketId, // Use the 6-character sliced ticket ID
            createdAt: new Date(),
            issue: data.subject,
            description: data.description,
        });
        await sendTicketWebhookNotification(user, {
            _id: ticketId, // Use the 6-character sliced ticket ID,
            createdAt: new Date(),
            subject: data.subject,
        });

        return NextResponse.json(newTicket, { status: 201 });
    } catch (error: any) {
        console.error('Error creating ticket:', error);
        if (error.response) {
            console.error('SendGrid Error Response:', error.response.body);
        }
    }
}

// PATCH request to update an existing ticket
export async function PATCH(req: Request) {
    try {
        await connectDB(); // Ensure the database is connected
        const { id, ...data } = await req.json(); // Parse the request body

        // Update the ticket by its ID
        const updatedTicket = await Ticket.findByIdAndUpdate(id, data, { new: true });

        if (!updatedTicket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        return NextResponse.json(updatedTicket);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
    }
}
