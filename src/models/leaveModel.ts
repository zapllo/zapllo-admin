import mongoose, { Document, Schema, Model } from 'mongoose';
import { ILeaveType } from './leaveTypeModel';
import { IUser } from './userModel';
import { differenceInCalendarDays } from 'date-fns'; // Import date-fns to calculate the difference

// Define the interface for leave days
interface ILeaveDay {
    status: string;
    date: Date; // Date of the leave
    unit: 'Full Day' | '1st Half' | '2nd Half' | '1st Quarter' | '2nd Quarter' | '3rd Quarter' | '4th Quarter'; // Updated leave units
}

// Define the interface for the Leave document
export interface ILeave extends Document {
    leaveType: mongoose.Types.ObjectId | ILeaveType; // Reference to leave type
    user: mongoose.Types.ObjectId | IUser; // Reference to the user applying for the leave
    fromDate: Date; // Start date of leave
    toDate: Date; // End date of leave
    appliedDays: number; // Number of days applied for
    leaveDays: ILeaveDay[]; // List of leave days with unit
    leaveReason: string; // Reason for leave
    attachment: [string]; // File URL for attachments
    audioUrl: string; // File URL for audio attachment
    status: 'Pending' | 'Approved' | 'Rejected' | 'Partially Approved'; // Leave approval status
    remarks: string;
    approvedBy: mongoose.Types.ObjectId | IUser; // Reference to the user who approved the leave
    rejectedBy: mongoose.Types.ObjectId | IUser; // Reference to the user who rejected the leave
}

// Define the schema
const leaveSchema: Schema<ILeave> = new mongoose.Schema({
    leaveType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'leaveTypes', // Reference to leaveTypes model
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', // Reference to User model
        required: true,
    },
    fromDate: {
        type: Date,
        required: true,
    },
    toDate: {
        type: Date,
        required: true,
    },
    appliedDays: {
        type: Number,
        required: true, // Calculated field for the number of days applied
    },
    leaveDays: [
        {
            date: { type: Date, required: true },
            unit: {
                type: String,
                enum: ['Full Day', '1st Half', '2nd Half', '1st Quarter', '2nd Quarter', '3rd Quarter', '4th Quarter'], // Updated enum values
                required: true
            },
            status: {  // Ensure status is part of the schema
                type: String,
                enum: ['Pending', 'Approved', 'Rejected'],
                default: 'Pending',
            }
        }
    ],
    leaveReason: {
        type: String,
        required: true,
    },
    attachment: {
        type: [String], // URL of uploaded file
    },
    audioUrl: {
        type: String, // URL of uploaded audio
        default: '',
    },
    status: {
        type: String,
        enum: ['Approved', 'Rejected', 'Pending', 'Partially Approved'],
        default: 'Pending',
    },
    remarks: {
        type: String,
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', // Reference to User model
        default: null, // Store the user who approved the leave
    },
    rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', // Reference to User model
        default: null, // Store the user who rejected the leave
    },
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt timestamps
});


// Define and export the Leave model
const Leave: Model<ILeave> = mongoose.models.Leave || mongoose.model<ILeave>('Leave', leaveSchema);
export default Leave;
