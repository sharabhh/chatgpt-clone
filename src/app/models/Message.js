import mongoose, { Schema } from "mongoose";

const attachmentSchema = new Schema({
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const messageSchema = new Schema({
  role: {
    type: String, // "user" or "assistant"
    required: true,
  },
  content: {
    type: String,
    required: false, // Allow empty content when there are attachments
    default: "",
  },
  attachments: {
    type: [attachmentSchema],
    default: [],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default messageSchema;