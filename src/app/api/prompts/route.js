import { NextResponse } from "next/server";
import connectDB from "@/app/lib/dbconnect";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import mem0 from "@/app/lib/mem0";
import Conversation from "@/app/models/Conversation";

const googleAI = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

// Helper function to summarize old messages
async function summarizeOldMessages(messages) {
  try {
    const messageText = messages
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    const summaryResponse = await generateText({
      model: googleAI("gemini-2.0-flash-001"),
      prompt: `Please provide a concise summary of this conversation history. Focus on key topics, decisions, and important context that would be relevant for continuing the conversation. Keep it under 500 words:

${messageText}`,
    });

    return summaryResponse.text;
  } catch (error) {
    console.error("Error summarizing messages:", error);
    return "Unable to summarize previous conversation.";
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { userId, prompt, conversationId } = body;
    console.log(body);

    // Check if we need to summarize conversation history
    let conversationContext = "";
    if (conversationId) {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (conversation && conversation.messages.length >= 20) {
          console.log(
            `Conversation has ${conversation.messages.length} messages, summarizing...`
          );

          // Get all messages except the last few recent ones
          const messagesToSummarize = conversation.messages.slice(0, -5); // Keep last 5 messages as recent context
          const recentMessages = conversation.messages.slice(-5);

          // Summarize the older messages
          const summary = await summarizeOldMessages(messagesToSummarize);
          console.log("Generated summary for AI context:", summary);

          // Format recent messages
          const recentContext = recentMessages
            .map((msg) => `${msg.role}: ${msg.content}`)
            .join("\n");

          conversationContext = `

Previous conversation summary (for context): ${summary}

Recent conversation history:
${recentContext}

`;
        }
      } catch (error) {
        console.log("Error retrieving conversation for summarization:", error);
      }
    }

    // Retrieve memories for personalized context
    let personalizedPrompt = prompt;
    if (userId) {
      try {
        console.log("Retrieving memories for user:", userId);
        const memories = await mem0.search(prompt, { user_id: userId });

        if (memories && memories.length > 0) {
          const relevantContext = memories
            .map((memory) => memory.memory)
            .join(". ");
          personalizedPrompt = `Based on what I know about you: ${relevantContext}${conversationContext}\n\nUser question: ${prompt}`;
        } else {
          personalizedPrompt = `${conversationContext}User question: ${prompt}`;
        }
      } catch (memoryError) {
        console.log("Memory retrieval failed:", memoryError);
        // Continue with conversation context if available
        personalizedPrompt = `${conversationContext}User question: ${prompt}`;
      }
    } else {
      // If no userId, just add conversation context
      personalizedPrompt = `${conversationContext}User question: ${prompt}`;
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
          { role: "assistant", content: response.text },
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
