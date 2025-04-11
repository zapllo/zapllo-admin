import mongoose, { Document, Schema, Model } from "mongoose";

// Define an interface for the Leave Balance
interface ILeaveBalance {
    leaveType: mongoose.Types.ObjectId; // Reference to the leave type
    balance: number; // Remaining balance for this leave type
}

interface Allowance {
    name: string;
    amount: number;
}

interface IBankDetails {
    bankName: string;
    branchName: string;
    accountNumber: string;
    ifscCode: string;
}

interface ILegalDocuments {
    aadharCard?: string; // URL for Aadhar Card
    drivingLicense?: string; // URL for Driving License
    panCard?: string; // URL for PAN Card
    passportPhoto?: string; // URL for Passport Photo
}


interface IReminders {
    dailyReminderTime: string; // Time in HH:MM AM/PM format
    email: boolean;            // Email reminder toggle
    whatsapp: boolean;         // WhatsApp reminder toggle
    dailyAttendanceReportTime: string; // New field for daily attendance report time
}

interface IContactDetails {
    emergencyContact: string;
    contactPersonName: string;
    relation: string;
    address: string;
}

interface IPersonalInformation {
    dateOfBirth: Date | null;
    dateOfJoining: Date | null;
}

// Define an interface for the User document
export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    whatsappNo: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    isVerified: boolean;
    isAdmin: boolean;
    role: 'member' | 'manager' | 'orgAdmin';
    reportingManager: mongoose.Types.ObjectId | null;
    organization: mongoose.Types.ObjectId | null;
    notifications: {
        email: boolean;
        whatsapp: boolean;
    };
    isPro: boolean;
    subscribedPlan: string;
    promotionNotification: boolean;
    credits: number;
    leaveBalances: ILeaveBalance[]; // Individual balances for each leave type
    totalLeaveBalance: number; // Total leave balance (sum of all leave types)
    forgotPasswordToken: string | null;
    forgotPasswordTokenExpiry: Date | null;
    verifyToken: string | null;
    verifyTokenExpiry: Date | null;
    checklistProgress: mongoose.Types.ObjectId[];
    faceDescriptors: number[][]; // An array of face descriptors (each descriptor is an array of numbers)
    imageUrls: { type: [String], default: [] };
    country: string;
    profilePic: string;
    isLeaveAccess: boolean;
    isTaskAccess: boolean;
    reminders: IReminders;
    weeklyOffs: string[]; // Array of days (e.g., ["Sun", "Sat"])
    designation: string; // Editable input field
    staffType: string; // Editable dropdown (e.g., "Regular Employee", "Contractor", "Work Basis")
    contactNumber: string;
    asset: string; // Editable input field
    branch: string; // Editable input field
    workFromHomeAllowed: boolean;  // <-- Add this line
    department: string; // Editable input field
    status: string;
    salaryDetails?: Allowance[]; // New field for salary details
    deductionDetails?: Allowance[]; // New field for salary details
    monthCalculationType?: string;
    gender: "Male" | "Female" | "Other" | null; // New gen  der field
    bankDetails?: IBankDetails;
    legalDocuments?: ILegalDocuments;
    contactDetails?: IContactDetails; // New contact details field
    personalInformation?: IPersonalInformation;
    createdAt: Date;
}



const BankDetailsSchema: Schema<IBankDetails> = new Schema({
    bankName: { type: String, default: "" },
    branchName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    ifscCode: { type: String, default: "" },
});

const ContactDetailsSchema: Schema<IContactDetails> = new Schema({
    emergencyContact: { type: String, default: "" },
    contactPersonName: { type: String, default: "" },
    relation: { type: String, default: "" },
    address: { type: String, default: "" },
});

const LegalDocumentsSchema: Schema<ILegalDocuments> = new Schema({
    aadharCard: { type: String, default: "" },
    drivingLicense: { type: String, default: "" },
    panCard: { type: String, default: "" },
    passportPhoto: { type: String, default: "" },
});


const PersonalInformationSchema: Schema<IPersonalInformation> = new Schema({
    dateOfBirth: { type: Date, default: null },
    dateOfJoining: { type: Date, default: null },
});

// Define the schema
const userSchema: Schema<IUser> = new mongoose.Schema({
    whatsappNo: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    role: { type: String, default: 'member' },
    reportingManager: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'organizations', default: null },
    notifications: {
        email: { type: Boolean, default: true },
        whatsapp: { type: Boolean, default: true },
    },
    isPro: { type: Boolean, default: false },
    subscribedPlan: { type: String, default: '' },
    promotionNotification: { type: Boolean, default: false },
    credits: { type: Number, default: 0 },
    leaveBalances: [
        {
            leaveType: { type: mongoose.Schema.Types.ObjectId, ref: 'leaveTypes', required: true },
            balance: { type: Number, required: true }, // Balance for each leave type
        },
    ],
    totalLeaveBalance: {
        type: Number, // Total balance from all leave types
        default: 0,
    },
    forgotPasswordToken: { type: String, default: null },
    forgotPasswordTokenExpiry: { type: Date, default: null },
    verifyToken: { type: String, default: null },
    verifyTokenExpiry: { type: Date, default: null },
    checklistProgress: {
        type: [mongoose.Schema.Types.ObjectId], // Array of references to checklist items
        default: [],
        ref: "checklistItems",
    },

    faceDescriptors: {
        type: [[Number]], // A 2D array to store multiple face descriptors for each user
        default: [],
    },
    imageUrls: {
        type: [String], // Array to store multiple image URLs
        default: [],
    },
    country: {
        type: String,
    },
    profilePic: {
        type: String,
    },
    isLeaveAccess: {
        type: Boolean,
        default: true,
    },
    isTaskAccess: {
        type: Boolean,
        default: true,
    },
    reminders: {
        dailyReminderTime: { type: String, default: "09:00 AM" }, // Stores time in HH:MM AM/PM format
        email: { type: Boolean, default: false }, // Email reminder toggle
        whatsapp: { type: Boolean, default: false }, // WhatsApp reminder toggle
        dailyAttendanceReportTime: { type: String, default: "" }, // Time for daily attendance report
    },
    weeklyOffs: {
        type: [String], // Stores weekly off days as an array of strings (e.g., ["Sun", "Sat"])
        default: [],    // Empty array by default
    },
    designation: { type: String, default: null }, // New optional field
    staffType: { type: String, enum: ["Regular Employee", "Contractor", "Work Basis"], default: null }, // Enum for valid options
    asset: { type: String, default: null }, // New optional field
    branch: { type: String, default: null }, // New optional field
    workFromHomeAllowed: {
        type: Boolean,
        default: false,
    },
    department: { type: String, default: null }, // New optional field
    status: { type: String, enum: ["Active", "Deactivated"], default: "Active" }, // Status field with default
    monthCalculationType: {
        type: String,
        enum: [
            "Calendar Month",
            "Every Month 30 Days",
            "Every Month 28 Days",
            "Every Month 26 Days",
            "Exclude Weekly Offs",
        ],
        default: "Calendar Month", // Set a default type
    },
    salaryDetails: [
        {
            name: { type: String, },
            amount: { type: Number, },
        },
    ],
    deductionDetails: [
        {
            name: { type: String, },
            amount: { type: Number, },
        },
    ],
    gender: { type: String, enum: ["Male", "Female", "Other"], default: null }, // Gender field
    bankDetails: { type: BankDetailsSchema, default: null }, // Include Bank Details Field
    legalDocuments: { type: LegalDocumentsSchema, default: {} },
    contactDetails: { type: ContactDetailsSchema, default: null },
    personalInformation: { type: PersonalInformationSchema, default: null },
}, { timestamps: true });

// Define and export the User model
const User: Model<IUser> = mongoose.models.users || mongoose.model<IUser>("users", userSchema);
export default User;
