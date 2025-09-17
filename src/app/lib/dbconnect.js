import mongoose from "mongoose";

export default async function connectDB() {
    const isConnected = mongoose.connection.readyState;

    if(isConnected === 1){
        console.log("MongoDB already connected");
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: "chatgpt-clone",
            // bufferCommands: true,
        });
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.log("MongoDB connection error", error);
    }
}