import { NextResponse } from "next/server";
import connectDB from "@/app/lib/dbconnect";
import Conversation from "@/app/models/Conversation";
import User from "@/app/models/User";

// Create new conversation for a user
export async function POST(req) {
  try {
    console.log("Creating new conversation");
    await connectDB();
    const { clerkId, title } = await req.json();

    if (!clerkId) {
      return NextResponse.json({ error: "clerkId is required" }, { status: 400 });
    }

    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const conversation = new Conversation({
      userId: user._id,
      title: title || "New Conversation",
      messages: [],
    });

    await conversation.save();

    return NextResponse.json(conversation, { status: 201 });
  } catch (err) {
    console.error("Error creating conversation:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Get all conversations for a user
export async function GET(req) {
  try {
    console.log("Getting all conversations");
    await connectDB();
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get("clerkId");

    if (!clerkId) {
      return NextResponse.json({ error: "clerkId is required" }, { status: 400 });
    }

    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const conversations = await Conversation.find({ userId: user._id })
      .sort({ updatedAt: -1 });

    return NextResponse.json({ conversations });
  } catch (err) {
    console.error("Error getting conversations:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Update conversation title
export async function PUT(req) {
  try {
    await connectDB();
    const { conversationId, title } = await req.json();

    if (!conversationId || !title) {
      return NextResponse.json({ error: "conversationId and title are required" }, { status: 400 });
    }

    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { title: title.slice(0, 15) }, // Ensure max 15 characters
      { new: true }
    );

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    return NextResponse.json({ conversation });
  } catch (err) {
    console.error("Error updating conversation title:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
