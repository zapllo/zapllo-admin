import connectDB from "@/lib/db";
import User from "@/models/userModel";
import Organization from "@/models/organizationModel";
import Onboarding from "@/models/onboardingModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { sendEmail } from "@/lib/sendEmail";

connectDB();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const {
      onboardingId,
      firstName,
      lastName,
      whatsappNo,
      email,
      password = "defaultPassword123", // Default password for orgAdmin
      companyName,
      industry,
      subscribedUserCount,
      teamSize, // Optional input for team size
      country,
      description,
    } = reqBody;

    // Check if the user or organization already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists." }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create trial expiration date
    const trialDays = 7;
    const trialExpires = new Date();
    trialExpires.setDate(trialExpires.getDate() + trialDays);

    // Determine the team size based on subscribedUserCount or use default
    const determineTeamSize = (count: number): string => {
      if (count <= 10) return "1-10";
      if (count <= 20) return "11-20";
      if (count <= 30) return "21-30";
      if (count <= 50) return "31-50";
      return "51+";
    };

    const calculatedTeamSize = teamSize || determineTeamSize(subscribedUserCount || 1); // Default to 1-10 if not provided

    // Create the organization
    const newOrg = new Organization({
      companyName,
      industry,
      trialExpires,
      teamSize: calculatedTeamSize,
      description,
      country,
    });
    const savedOrg = await newOrg.save();

    // Create the user as orgAdmin
    const newUser = new User({
      whatsappNo,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "orgAdmin",
      organization: savedOrg._id,
      isAdmin: true,
      trialExpires,
    });
    await newUser.save();

    // Mark the onboarding record as registered
    if (onboardingId) {
      await Onboarding.findByIdAndDelete(onboardingId);
    }

    // Prepare email content with all credential details
    const emailSubject = `Welcome to Zapllo - Your Workspace is Ready!`;
    const emailText = `Hi, your workspace ${companyName} has been successfully registered! Login to start managing your team.`;
    const emailHtml = `
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
        <div style="background-color: #f0f4f8; padding: 20px; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <div style="padding: 20px; text-align: center;">
              <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1724000375/orjojzjia7vfiycfzfly.png" alt="Zapllo Logo" style="max-width: 150px; height: auto;">
            </div>
            <div style="padding: 20px; text-align: left;">
              <h2>Welcome to Zapllo!</h2>
              <p>Your workspace <strong>${companyName}</strong> has been successfully registered.</p>
              <p>Here are your login credentials:</p>
              <ul>
                <li><strong>Name:</strong> ${newUser.firstName || ""} ${newUser.lastName || ""}</li>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Password:</strong> ${password}</li>
                <li><strong>WhatsApp:</strong> ${whatsappNo}</li>
                <li><strong>Role:</strong> orgAdmin</li>
                <li><strong>Team Size:</strong> ${calculatedTeamSize}</li>
                <li><strong>Trial Expires:</strong> ${trialExpires.toLocaleDateString()}</li>
              </ul>
              <p>Click the button below to log in and start managing your team:</p>
              <div style="text-align: center; margin-top: 20px;">
                <a href="https://zapllo.com/login" style="background-color: #815BF5; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Now</a>
              </div>
              <p style="margin-top: 20px; font-size: 12px; text-align: center; color: #888888;">This is an automated notification. Please do not reply.</p>
            </div>
          </div>
        </div>
      </body>
    `;

    // Send email
    const emailOptions = {
      to: email,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    };
    await sendEmail(emailOptions);

    // Send webhook notification
    const mediaUrl =
      "https://interaktprodmediastorage.blob.core.windows.net/mediaprodstoragecontainer/d262fa42-63b2-417e-83f2-87871d3474ff/message_template_media/w4B2cSkUyaf3/logo-02%204.png?se=2029-07-07T15%3A30%3A43Z&sp=rt&sv=2019-12-12&sr=b&sig=EtEFkVbZXLeBLJ%2B9pkZitby/%2BwJ4HzJkGgeT2%2BapgoQ%3D";
    const templateName = "loginsuccessadmin";
    const bodyVariables = [
      newUser.firstName,
      companyName,
    ];

    const payload = {
      phoneNumber: whatsappNo,
      bodyVariables,
      templateName,
      mediaUrl,
    };

    await fetch("https://zapllo.com/api/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return NextResponse.json({
      message: "Organization and orgAdmin registered successfully",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
