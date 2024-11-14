import mongoose, { Document, Model, Schema } from 'mongoose';

interface ISubscriber extends Document {
  email: string;
  createdAt: Date;
}

const SubscriberSchema: Schema<ISubscriber> = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
}, { timestamps: { createdAt: true, updatedAt: false } }); // Automatically add `createdAt` field

const Subscriber: Model<ISubscriber> =
  mongoose.models.Subscriber || mongoose.model<ISubscriber>('Subscriber', SubscriberSchema);

export default Subscriber;
