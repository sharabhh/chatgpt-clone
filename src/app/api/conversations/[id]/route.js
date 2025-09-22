import { NextResponse } from "next/server";
import connectDB from "@/app/lib/dbconnect";
import Conversation from "@/app/models/Conversation";

export async function POST(req, { params }) {
  try {
    console.log("Creating new message");
    await connectDB();
    const { id } = await params; // conversationId
    const { role, content, attachments = [] } = await req.json();

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Handle empty content - allow it if there are attachments
    const messageContent = content || "";
    conversation.messages.push({ role, content: messageContent, attachments });
    await conversation.save();

    return NextResponse.json(conversation);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Get all messages for a conversation
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    return NextResponse.json(conversation.messages);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Update a specific message and remove all subsequent messages
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params; // conversationId
    const { messageIndex, newContent } = await req.json();

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Validate message index
    if (messageIndex < 0 || messageIndex >= conversation.messages.length) {
      return NextResponse.json({ error: "Invalid message index" }, { status: 400 });
    }

    // Update the message content
    conversation.messages[messageIndex].content = newContent;
    
    // Remove all messages after this index
    conversation.messages = conversation.messages.slice(0, messageIndex + 1);
    
    await conversation.save();

    return NextResponse.json(conversation.messages);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}