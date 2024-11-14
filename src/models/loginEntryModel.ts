// src/models/loginEntryModel.ts

import mongoose, { Schema, Document, Model } from 'mongoose';
import { IUser } from './userModel';

export interface ILoginEntry extends Document {
    userId: IUser | mongoose.Types.ObjectId;
    action: 'login' | 'logout' | 'regularization';
    lat?: number;
    lng?: number;
    timestamp: Date;
    loginTime?: string;
    logoutTime?: string;
    remarks?: string;
    notes?: string;

    // New Fields for Approval
    approvalStatus?: 'Pending' | 'Approved' | 'Rejected';
    approvedBy?: IUser | mongoose.Types.ObjectId; // Approver's User ID (either manager or orgAdmin)
    approvalRemarks?: string;

    approvedAt?: Date;
}

const loginEntrySchema: Schema<ILoginEntry> = new Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
        action: { type: String, enum: ['login', 'logout', 'regularization'], required: true },
        lat: { type: Number },
        lng: { type: Number },
        timestamp: { type: Date, default: Date.now },
        loginTime: { type: String },
        logoutTime: { type: String },
        remarks: { type: String },
        notes: { type: String },
        // Approval Fields
        approvalStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
        approvalRemarks: { type: String },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users' }, // Explicitly reference 'users' collection
        approvedAt: { type: Date },
    },
    { timestamps: true }
);

// Prevent model overwrite upon initial compile
const LoginEntry: Model<ILoginEntry> =
    mongoose.models.LoginEntry || mongoose.model<ILoginEntry>('LoginEntry', loginEntrySchema);

export default LoginEntry;
