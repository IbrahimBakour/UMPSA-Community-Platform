import mongoose, { Document, Schema } from 'mongoose';

export interface IReaction extends Document {
    postId: mongoose.Types.ObjectId;
    postType: 'feed' | 'club';
    user: mongoose.Types.ObjectId;
    type: 'like' | 'love' | 'laugh' | 'dislike';
    createdAt: Date;
}

const ReactionSchema: Schema = new Schema({
    postId: { type: mongoose.Types.ObjectId, required: true },
    postType: { type: String, enum: ['feed', 'club'], required: true },
    user: { type: mongoose.Types.ObjectId, required: true },
    type: { type: String, enum: ['like', 'love', 'laugh', 'dislike'], required: true },
}, { timestamps: true });

ReactionSchema.index({ postId: 1, user: 1 }, { unique: true });

const Reaction = mongoose.model<IReaction>('Reaction', ReactionSchema);

export default Reaction;