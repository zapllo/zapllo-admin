import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the types for leave type and paid/unpaid options
enum LeaveType {
    Paid = 'Paid',
    Unpaid = 'Unpaid',
}

enum LeaveUnit {
    FullDay = 'Full Day',
    HalfDay = 'Half Day',
    ShortLeave = 'Short Leave',
}

// Define the interface for the Leave document
export interface ILeaveType extends Document {
    _id: mongoose.Types.ObjectId;
    leaveType: string;
    description: string;
    allotedLeaves: number;
    type: LeaveType;
    backdatedLeaveDays: number;
    advanceLeaveDays: number;
    includeHolidays: boolean;
    includeWeekOffs: boolean;
    unit: LeaveUnit[]; // Full Day, Half Day, Short Leave
    organization: mongoose.Types.ObjectId;
}

// Define the schema
const leaveTypeSchema: Schema<ILeaveType> = new mongoose.Schema({
    leaveType: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    allotedLeaves: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: Object.values(LeaveType),
        required: true,
    },
    backdatedLeaveDays: {
        type: Number,
        default: 0,
    },
    advanceLeaveDays: {
        type: Number,
        default: 0,
    },
    includeHolidays: {
        type: Boolean,
        default: false,
    },
    includeWeekOffs: {
        type: Boolean,
        default: false,
    },
    unit: {
        type: [String],
        enum: Object.values(LeaveUnit), // Only 'Full Day', 'Half Day', 'Short Leave'
        required: true,
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organizations',
        required: true,
    },
}, {
    timestamps: true,
});

const Leave: Model<ILeaveType> = mongoose.models.leaveTypes || mongoose.model<ILeaveType>('leaveTypes', leaveTypeSchema);
export default Leave;
