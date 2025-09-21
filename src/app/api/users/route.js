import { NextResponse } from "next/server";
import connectDB from "@/app/lib/dbconnect";
import User from "@/app/models/User";

export async function GET(request) {
  try {
    await connectDB();
    
    // Get clerkId from query parameters
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get('clerkId');
    
    console.log("Getting user with clerkId:", clerkId);
    
    if (!clerkId) {
      return NextResponse.json(
        { message: "clerkId query parameter is required" }, 
        { status: 400 }
      );
    }

    const user = await User.findOne({ clerkId: clerkId });
    
    if (!user) {
      return NextResponse.json(
        { message: "User not found with the provided clerkId" }, 
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: "User retrieved successfully",
      user 
    }, { status: 200 });
    
  } catch (error) {
    console.error("User retrieval error:", error);
    return NextResponse.json(
      { message: "User retrieval failed", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { clerkId, name, email } = body;
    if(!clerkId || !name || !email) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    console.log("Creating user with data:", { clerkId, name, email });

    // Check if user already exists by clerkId (primary identifier) or email
    const existingUser = await User.findOne({ 
      $or: [{ clerkId }, { email }] 
    });
    
    if (existingUser) {
      // Update existing user data if needed
      if (existingUser.clerkId !== clerkId || existingUser.name !== name || existingUser.email !== email) {
        existingUser.clerkId = clerkId;
        existingUser.name = name;
        existingUser.email = email;
        existingUser.updatedAt = new Date();
        await existingUser.save();
        
        return NextResponse.json(
          { message: "User updated successfully", user: existingUser },
          { status: 200 }
        );
      }
      
      return NextResponse.json(
        { message: "User already exists", user: existingUser },
        { status: 200 }
      );
    }

    // Create new user
    const user = await User.create({ clerkId, name, email });
    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("User creation error:", error);
    return NextResponse.json(
      { message: "User creation failed", error: error.message },
      { status: 500 }
    );
  }
}
