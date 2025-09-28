import mongoose, { Schema, Document } from 'mongoose';

interface IComment extends Document {
    postId: mongoose.Types.ObjectId;
    postType: 'feed' | 'club';
    author: mongoose.Types.ObjectId;
    content: string;
    media?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

const CommentSchema: Schema = new Schema({
    postId: { type: mongoose.Types.ObjectId, required: true },
    postType: { type: String, enum: ['feed', 'club'], required: true },
    author: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    media: { type: [String], default: [] },
}, { timestamps: true });

const Comment = mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;