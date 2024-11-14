import mongoose, { Document, Schema, Model } from 'mongoose';

// Define an interface for the Category document
export interface ICategory extends Document {
    name: string;
    organization: mongoose.Types.ObjectId;
}

// Define the schema
const categorySchema: Schema<ICategory> = new mongoose.Schema({
    name: {
        type: String,
        unique: false,
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'organizations', // Referencing the Organization model
        required: true,
    },
}, {
    timestamps: true,
});

// Define and export the Category model
const Category: Model<ICategory> = mongoose.models.categories || mongoose.model<ICategory>('categories', categorySchema);
export default Category;
