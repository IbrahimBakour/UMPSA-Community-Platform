import mongoose, { Document, Schema } from 'mongoose';

interface IReport extends Document {
    submittedBy: mongoose.Types.ObjectId;
    againstUser?: mongoose.Types.ObjectId;
    club?: mongoose.Types.ObjectId;
    description: string;
    status: 'open' | 'resolved' | 'dismissed';
    handledBy?: mongoose.Types.ObjectId;
}

const reportSchema = new Schema<IReport>({
    submittedBy: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    againstUser: { type: mongoose.Types.ObjectId, ref: 'User' },
    club: { type: mongoose.Types.ObjectId, ref: 'Club' },
    description: { type: String, required: true },
    status: { type: String, enum: ['open', 'resolved', 'dismissed'], default: 'open' },
    handledBy: { type: mongoose.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Report = mongoose.model<IReport>('Report', reportSchema);

export default Report;