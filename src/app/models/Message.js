import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema({
  role: {
    type: String, // "user" or "assistant"
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default messageSchema;