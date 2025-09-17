import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/dbconnect';

export async function POST(request) {
    try {
      await connectDB();
      const body = await request.json();
      console.log(body);
      return NextResponse.json({ message: "This is a prompts route" }, { status: 200 })
    } catch (error) {
      return NextResponse.json({ message: "Prompts failed" }, { status: 500 })
    }
  }