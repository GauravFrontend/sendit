// db.js
import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Atlas Connected...");
    } catch (err) {
        console.error("❌ Database connection failed:", err.message);
        process.exit(1); // Stop the server if DB fails
    }
};

export default connectDB;