import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    gems: {
        type: Number,
        default: 20
    },
    lastDailyReward: {
        type: String, // YYYY-MM-DD
        default: null
    }
}, { timestamps: true });

export default mongoose.model('User', userSchema);