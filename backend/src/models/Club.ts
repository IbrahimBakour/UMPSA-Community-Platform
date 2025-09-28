import mongoose, { Schema, Document } from 'mongoose';

interface IClub extends Document {
    name: string;
    banner?: string;
    profilePicture?: string;
    about?: string;
    contactInfo?: string;
    members: mongoose.Types.ObjectId[];
    createdBy: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const ClubSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    banner: { type: String },
    profilePicture: { type: String },
    about: { type: String },
    contactInfo: { type: String },
    members: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Club = mongoose.model<IClub>('Club', ClubSchema);

export default Club;