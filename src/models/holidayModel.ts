import mongoose, { Document, Schema, Model } from 'mongoose';

// Define the interface for the Holiday document
export interface IHoliday extends Document {
    holidayName: string;
    holidayDate: Date;
    organization: mongoose.Types.ObjectId; // Each holiday is tied to an organization
}

// Define the schema
const holidaySchema: Schema<IHoliday> = new mongoose.Schema({
    holidayName: {
        type: String,
        required: true,
    },
    holidayDate: {
        type: Date,
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

// Define and export the Holiday model
const Holiday: Model<IHoliday> = mongoose.models.Holiday || mongoose.model<IHoliday>('Holiday', holidaySchema);
export default Holiday;
