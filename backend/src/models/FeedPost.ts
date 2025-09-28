import mongoose, { Document, Schema } from 'mongoose';

interface IFeedPost extends Document {
    author: mongoose.Types.ObjectId;
    content: string;
    media: string[];
    type: 'text' | 'media' | 'poll' | 'link' | 'calendar';
    status: 'pending' | 'approved' | 'rejected';
    comments: mongoose.Types.ObjectId[];
    reactions: mongoose.Types.ObjectId[];
}

const FeedPostSchema: Schema = new Schema({
    author: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    media: { type: [String], default: [] },
    type: { type: String, enum: ['text', 'media', 'poll', 'link', 'calendar'], default: 'text' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    comments: [{ type: mongoose.Types.ObjectId, ref: 'Comment' }],
    reactions: [{ type: mongoose.Types.ObjectId, ref: 'Reaction' }],
}, { timestamps: true });

const FeedPost = mongoose.model<IFeedPost>('FeedPost', FeedPostSchema);

export default FeedPost;