import { NextResponse } from "next/server";
import connectDB from "@/app/lib/dbconnect";
import Conversation from "@/app/models/Conversation";

// Get conversation details including owner information
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const conversation = await Conversation.findById(id).populate('userId', 'name email');
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Return conversation details including owner info
    return NextResponse.json({
      _id: conversation._id,
      title: conversation.title,
      userId: conversation.userId,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
