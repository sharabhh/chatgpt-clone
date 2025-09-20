import { NextResponse } from "next/server";
import connectDB from "@/app/lib/dbconnect";
import User from "@/app/models/User";

export async function GET(request) {
  try {
    await connectDB();
    const users = await User.find();
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Users retrieval failed", error },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { clerkId, name, email } = body;
    console.log("body", body);
    const existingUser = await User.findOne({ email });
    // early return if user already exists
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists", user: existingUser },
        { status: 200 }
      );
    }

    const user = await User.create({ clerkId, name, email });
    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "User creation failed", error },
      { status: 500 }
    );
  }
}
