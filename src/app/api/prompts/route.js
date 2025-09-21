import { NextResponse } from "next/server";
import connectDB from "@/app/lib/dbconnect";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import mem0 from "@/app/lib/mem0";

const googleAI = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const {userId, prompt} = body;
    console.log(body);

    // Retrieve memories for personalized context
    let personalizedPrompt = prompt;
    if (userId) {
      try {
        console.log("Retrieving memories for user:", userId);
        const memories = await mem0.search(prompt, { user_id: userId });
        
        if (memories && memories.length > 0) {
          const relevantContext = memories.map(memory => memory.memory).join(". ");
          personalizedPrompt = `Based on what I know about you: ${relevantContext}\n\nUser question: ${prompt}`;
        }
      } catch (memoryError) {
        console.log("Memory retrieval failed:", memoryError);
        // Continue with original prompt if memory retrieval fails
      }
    }

    const response = await generateText({
      model: googleAI("gemini-2.0-flash-001"),
      prompt: personalizedPrompt,
    });

    // Save conversation to mem0 using proper message format
    if (userId) {
      try {
        console.log("Saving conversation to mem0");
        const messages = [
          { role: "user", content: prompt },
          { role: "assistant", content: response.text }
        ];
        
        await mem0.add(messages, { user_id: userId });
        console.log("Successfully saved to mem0");
      } catch (memoryError) {
        console.log("Memory saving failed:", memoryError);
        // Don't fail the entire request if memory saving fails
      }
    }

    return NextResponse.json({ message: response.text }, { status: 200 });
  } catch (error) {
    console.error("Prompts API error:", error);
    return NextResponse.json(
      { message: "Prompts failed with error: " + error },
      { status: 500 }
    );
  }
}
