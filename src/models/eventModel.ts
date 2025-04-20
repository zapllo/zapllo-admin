import mongoose, { Document, Schema, Model } from "mongoose";

// Define interface for comments
interface IComment {
  user: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
}

// Define interface for event registrations
interface IRegistration {
  user: mongoose.Types.ObjectId;
  registeredAt: Date;
}

// Define interface for Event document
export interface IEvent extends Document {
  title: string;
  description: string;
  coverImage: string;
  startDate: Date;
  endDate: Date;
  location: string;
  isVirtual: boolean;
  meetingLink?: string;
  capacity: number;
  registrations: IRegistration[];
  comments: IComment[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const RegistrationSchema = new Schema<IRegistration>({
  user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  registeredAt: { type: Date, default: Date.now }
});

const eventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  coverImage: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: { type: String, required: true },
  isVirtual: { type: Boolean, default: false },
  meetingLink: { type: String },
  capacity: { type: Number, required: true },
  registrations: [RegistrationSchema],
  comments: [CommentSchema],
  isActive: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'users', required: true }
}, { timestamps: true });

const Event: Model<IEvent> = mongoose.models.events || mongoose.model<IEvent>("events", eventSchema);
export default Event;
