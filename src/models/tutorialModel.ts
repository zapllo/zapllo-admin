import mongoose, { Document, Schema, Model } from 'mongoose';


// Define an interface for the Task document
export interface ITutorial extends Document {
    title: string;
    thumbnail: string;
    link: string;
    category: "Task Delegation App" | "Leave and Attendance App" | "Zapllo WABA";
}

// Define the schema
const tutorialSchema: Schema<ITutorial> = new mongoose.Schema(
    {
        title: { type: String, required: true },
        thumbnail: { type: String, required: true },
        link: { type: String, required: true },
        category: {
            type: String,
            enum: ["Task Delegation App", "Leave and Attendance App", "Zapllo WABA"],
            required: true,
        },
    },
    { timestamps: true }
);



// Define and export the Task model
const Tutorial: Model<ITutorial> = mongoose.models.tutorials || mongoose.model<ITutorial>('tutorials', tutorialSchema);

export default Tutorial;
