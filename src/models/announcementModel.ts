import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAnnouncement extends Document {
    announcementName: string;
    category: string;
    startDate: Date;
    endDate: Date;
    buttonName: string;
    buttonLink: string;
    isActive: boolean;
}

const announcementSchema: Schema<IAnnouncement> = new mongoose.Schema(
    {
        announcementName: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        buttonName: { type: String, required: true },
        buttonLink: { type: String, required: true },
        isActive: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Announcement: Model<IAnnouncement> =
    mongoose.models.announcements ||
    mongoose.model<IAnnouncement>("announcements", announcementSchema);

export default Announcement;
