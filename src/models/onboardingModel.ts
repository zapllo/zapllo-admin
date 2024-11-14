import mongoose, { Schema, Document, Model, Types } from 'mongoose';

interface Ionboarding extends Document {
    firstName: string;
    lastName: string;
    companyName: string;
    industry: string;
    email: string;
    whatsappNo: string;
    orderId: string;
    paymentId: string;
    amount: number;
    planName: string;
    countryCode: string;
    creditedAmount: number;
    createdAt: Date;
    subscribedUserCount: number;
}

const OnboardingSchema: Schema<Ionboarding> = new Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        companyName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        whatsappNo: {
            type: String,
            required: true,
        },
        countryCode: {
            type: String,
            required: true,
        },
        orderId: {
            type: String,
            required: true,
        },
        paymentId: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        planName: {
            type: String,
            required: true,
        },
        creditedAmount: {
            type: Number,
            required: true,
        },
        subscribedUserCount: {
            type: Number,
            required: true
        }, // Number of users purchased for the plan
    },
    { timestamps: true }
);

const Onboarding: Model<Ionboarding> = mongoose.models.Onboarding || mongoose.model<Ionboarding>('Onboarding', OnboardingSchema);

export default Onboarding;
