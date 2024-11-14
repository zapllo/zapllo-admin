import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface ITicket extends Document {
    category: string;
    subcategory: string;
    user: Types.ObjectId;
    subject: string;
    description: string;
    fileUrl?: string[];
    createdAt?: Date;
    updatedAt?: Date;
    comments: IComment[];
    status: string; // Add status field
    _id: string; // Add status field
}

export interface IComment {
    userId: Types.ObjectId;
    content: string;
    fileUrls?: string[] | null;
    createdAt: Date;
}

const CommentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    content: { type: String, required: true },
    fileUrls: { type: [String] },
    createdAt: { type: Date, default: Date.now },
});

const TicketSchema = new Schema({
    category: {
        type: String,
        required: true
    },
    subcategory: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    fileUrl: {
        type: [String], // Array of strings to store multiple file URLs
    },
    comments: [CommentSchema],
    status: {
        type: String,
        default: 'Pending' // Default value for the status field
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

// Avoid overwriting the model
const Ticket: Model<ITicket> = mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);

export default Ticket;
