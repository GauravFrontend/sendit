import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['one-time', 'recurring'],
        default: 'one-time'
    },
    startDate: {
        type: String, // YYYY-MM-DD
        required: true
    },
    endDate: {
        type: String, // YYYY-MM-DD, optional for recurring (if infinite)
        default: null
    },
    completedDates: [{
        type: String // Format: YYYY-MM-DD
    }],
    createdAt: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Goal', goalSchema);
