import { NextResponse } from "next/server";
import connectDB from "@/app/lib/dbconnect";
import Conversation from "@/app/models/Conversation";

export async function POST(req, { params }) {
  try {
    console.log("Creating new message");
    await connectDB();
    const { id } = await params; // conversationId
    const { role, content } = await req.json();

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    conversation.messages.push({ role, content });
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
