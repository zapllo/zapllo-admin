import mongoose, { Document, Schema, Model } from 'mongoose';
import { ICategory } from './categoryModel';

// Define an interface for the Intranet document
export interface IIntranet extends Document {
    linkUrl: string;
    description: string;
    linkName: string;
    category: mongoose.Types.ObjectId; // Reference to the Category model
    organization: mongoose.Types.ObjectId; // Reference to the User's organization
}

// Define the schema
const intranetSchema: Schema<IIntranet> = new mongoose.Schema({
    linkUrl: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    linkName: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'categories', // Referencing the Category model
        required: true,
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organizations', // Referencing the Organization model
        required: true,
    },
}, {
    timestamps: true,
});

// Define and export the Intranet model
const Intranet: Model<IIntranet> = mongoose.models.intranet || mongoose.model<IIntranet>('intranet', intranetSchema);
export default Intranet;
