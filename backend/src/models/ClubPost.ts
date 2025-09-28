import mongoose, { Document, Schema } from 'mongoose';

interface IClubPost extends Document {
    club: mongoose.Types.ObjectId;
    author: mongoose.Types.ObjectId;
    content: string;
    media: string[];
    comments: mongoose.Types.ObjectId[];
    reactions: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const ClubPostSchema: Schema = new Schema({
    club: { type: mongoose.Types.ObjectId, ref: 'Club', required: true },
    author: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    media: { type: [String], default: [] },
    comments: [{ type: mongoose.Types.ObjectId, ref: 'Comment' }],
    reactions: [{ type: mongoose.Types.ObjectId, ref: 'Reaction' }],
}, { timestamps: true });

const ClubPost = mongoose.model<IClubPost>('ClubPost', ClubPostSchema);

export default ClubPost;