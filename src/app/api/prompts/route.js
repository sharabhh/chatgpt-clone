import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/dbconnect';
import {generateText} from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const googleAI = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function POST(request) {
    try {
      await connectDB();
      const body = await request.json();
      console.log(body);
      const response = await generateText({
        model: googleAI("gemini-2.0-flash-001"),
        prompt: body.prompt,
      });
      return NextResponse.json({ message: response.text }, { status: 200 })
    // return NextResponse.json({ message: "This is a prompts route" }, { status: 200 })
    } catch (error) {
      return NextResponse.json({ message: "Prompts failed with error: " + error }, { status: 500 })
    }
  }