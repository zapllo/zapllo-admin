import mongoose, { Document, Schema, Model } from "mongoose";

export interface IChecklistItem extends Document {
    text: string; // Checklist objective text
    tutorialLink: string; // URL to the tutorial
    category: string;
}

const checklistItemSchema: Schema<IChecklistItem> = new mongoose.Schema({
    text: { type: String, required: true },
    category: { type: String, required: true },
    tutorialLink: { type: String, required: false }, // Optional tutorial link
});

const ChecklistItem: Model<IChecklistItem> = mongoose.models.checklistItems || mongoose.model<IChecklistItem>("checklistItems", checklistItemSchema);

export default ChecklistItem;
