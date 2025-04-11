import connectDB from "@/lib/db";
import User from "@/models/userModel";
import Organization from "@/models/organizationModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { SendEmailOptions, sendEmail } from "@/lib/sendEmail";

connectDB();

const sendWebhookNotification = async (
  phoneNumber: string,
  country: string,
  templateName: string,
  bodyVariables: string[]
) => {
  const payload = {
    phoneNumber,
    country,
    bodyVariables,
    templateName,
  };
  console.log(payload, 'payload?')
  try {
    const response = await fetch("https://zapllo.com/api/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const responseData = await response.json();
      throw new Error(`Webhook API error: ${responseData.message}`);
    }
  } catch (error) {
    console.error("Error sending webhook notification:", error);
    throw new Error("Failed to send WhatsApp notification");
  }
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id
  try {
    const organizationId = id;
    const reqBody = await req.json();
    const { firstName, lastName, email, whatsappNo, role = "member", country } = reqBody;

    // Validate input
    if (!firstName || !lastName || !email || !whatsappNo) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    // Check if the organization exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return NextResponse.json({ error: "Organization not found." }, { status: 404 });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists." }, { status: 400 });
    }

    // Generate a default password
    const defaultPassword = `User@${Math.floor(Math.random() * 10000)}`;
    const hashedPassword = await bcryptjs.hash(defaultPassword, 10);

    // Create the user and associate them with the organization
    const newUser = new User({
      firstName,
      lastName,
      email,
      whatsappNo,
      password: hashedPassword,
      organization: organizationId,
      role,
      isAdmin: role === "orgAdmin", // Assign admin status if role is orgAdmin
    });

    const savedUser = await newUser.save();
    // Flag to track if notifications were sent successfully
    let notificationSuccess = true;
    let emailError, whatsappError;
    // Email content
    const emailSubject = `Welcome to Zapllo - You've been added to ${organization.companyName}!`;
    const emailHtml = `
     <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
    <div style="background-color: #f0f4f8; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        <div style="padding: 20px; text-align: center;">
         <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1724000375/orjojzjia7vfiycfzfly.png" alt="Zapllo Logo" style="max-width: 150px; height: auto;">
        </div>
        <div style="padding: 20px;">
          <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1731423673/01_xlguy8.png" alt="Team Illustration" style="max-width: 100%; height: auto;">
        </div>
        <h1 style="font-size: 24px; margin: 0; padding: 10px 20px; color: #000000;">Welcome to Team - ${organization.companyName}</h1>
         <div style="padding: 20px;">
              <p>You've been successfully added as a member of ${organization.companyName}.</p>
              <p>Here are your login credentials:</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Password:</strong> ${defaultPassword}</p>
              <p><strong>Role:</strong> ${role}</p>
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://zapllo.com/login" style="background-color: #0C874B; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Login Here</a>
              </div>
            </div>
            <p style="margin-top: 20px; font-size: 12px; text-align: center; color: #888888;">This is an automated notification. Please do not reply.</p>
          </div>
        </div>
      </body>
    `;

    const emailOptions: SendEmailOptions = {
      to: email,
      text: "Zapllo",
      subject: emailSubject,
      html: emailHtml,
    };

     // Try to send email but continue if it fails
     try {
      await sendEmail(emailOptions);
    } catch (error) {
      notificationSuccess = false;
      emailError = error;
      console.error("Failed to send email notification:", error);
    }

    // WhatsApp content
    const bodyVariables = [
      firstName,
      organization.companyName,
      email,
      defaultPassword,
    ];

    const templateName = "loginsuccessmember";

    // Try to send WhatsApp notification but continue if it fails
    try {
      await sendWebhookNotification(whatsappNo, country, templateName, bodyVariables);
    } catch (error) {
      notificationSuccess = false;
      whatsappError = error;
      console.error("Failed to send WhatsApp notification:", error);
    }
    if (notificationSuccess) {
      return NextResponse.json({
        message: "User added successfully to the organization.",
        user: {
          firstName,
          lastName,
          email,
          whatsappNo,
          role,
          organization: organizationId,
        },
      });
    } else {
      // Return a partial success response when user is created but notifications failed
      return NextResponse.json({
        message: "User added successfully but notification delivery failed.",
        partialSuccess: true,
        user: {
          firstName,
          lastName,
          email,
          whatsappNo,
          role,
          organization: organizationId,
        },
        errors: {
          email: emailError ? "Email notification failed" : null,
          whatsapp: whatsappError ? "WhatsApp notification failed" : null,
        }
      });
    }
  } catch (error: any) {
    console.error("Error adding user:", error.message);
    return NextResponse.json({ error: "Failed to add user." }, { status: 500 });
  }
}
