import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    studentId: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["student", "clubMember", "admin"], default: "student" },
    nickname: { type: String },
    email: { type: String, index: true, sparse: true },
    profilePicture: { type: String }, // URL
    clubs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Club" }],
    restriction: {
        status: { type: Boolean, default: false },
        type: { type: String },
        reason: { type: String },
        restrictedUntil: { type: Date }
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;