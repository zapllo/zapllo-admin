import mongoose, { Document, Schema, Model } from "mongoose";

interface IFaceRegistrationRequest extends Document {
    userId: mongoose.Types.ObjectId;
    imageUrls: string[];
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}

const faceRegistrationRequestSchema: Schema<IFaceRegistrationRequest> = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    imageUrls: { type: [String], required: true }, // URLs of the face images
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, // Status of the request
}, { timestamps: true });

const FaceRegistrationRequest: Model<IFaceRegistrationRequest> = mongoose.models.FaceRegistrationRequest || mongoose.model<IFaceRegistrationRequest>("FaceRegistrationRequest", faceRegistrationRequestSchema);

export default FaceRegistrationRequest;
