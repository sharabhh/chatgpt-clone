import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/dbconnect';

export async function GET() {
  try {
   await connectDB();
   return NextResponse.json({ message: "This is a health check route" }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
