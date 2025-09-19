"use client";

import { useEffect, useRef, useState } from "react";
import MessageBubble from "../components/MessageBubble";
import TypingBubble from "../components/TypingBubble";
import Sidebar from "../components/Sidebar";
import axios from "axios";

const initialMessages = [
  { id: "m1", role: "assistant", content: "How can I help you today?" },
];

export default function Home() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAnchorRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [input]);

  async function handleSend() {
    try {
      const trimmed = input.trim();
      if (!trimmed || isSending) return;
      const userMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsSending(true);
      setIsTyping(true);

      const response = await axios.post("/api/prompts", {
        prompt: trimmed,
      });
      const data = await response.data;
      console.log("data", data);

      const reply = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.message,
      };
      setMessages((prev) => [...prev, reply]);
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function newChat() {
    setMessages(initialMessages);
    setInput("");
  }

  async function handleRegenerate(messageId) {
    // Find the user message that prompted this response
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;
    
    // Find the previous user message
    const userMessage = messages[messageIndex - 1];
    if (!userMessage || userMessage.role !== 'user') return;

    setIsTyping(true);
    
    try {
      const response = await axios.post("/api/prompts", {
        prompt: userMessage.content,
      });
      
      // Update the assistant message with new response
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: response.data.message }
          : msg
      ));
    } catch (error) {
      console.error('Error regenerating:', error);
    } finally {
      setIsTyping(false);
    }
  }

  console.log("messages", messages);

  return (
    <div className="font-sans flex h-screen bg-white dark:bg-[#121212] text-[#111] dark:text-[#e5e5e5]">
      <Sidebar newChat={newChat} />

      <div className="flex-1 flex flex-col dark:bg-[#212121]">
        <header className="h-12 border-b border-black/[.08] dark:border-white/[.01] flex items-center px-4 text-sm">
          ChatGPT
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
            {messages.map((m) => (
              <MessageBubble 
                key={m.id} 
                role={m.role} 
                content={m.content} 
                onRegenerate={() => handleRegenerate(m.id)}
              />
            ))}
            {isTyping && <TypingBubble />}
            <div ref={scrollAnchorRef} />
          </div>
        </div>

        <div className="border-t border-black/[.08] dark:border-white/[.06]">
          <div className="max-w-3xl mx-auto p-4">
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                className="flex-1 resize-none rounded-md border border-black/[.08] dark:border-white/[.12] bg-white dark:bg-[#1a1a1a] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                placeholder="Message ChatGPT..."
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="rounded-md bg-black text-white disabled:opacity-40 dark:bg-white dark:text-black px-3 py-2 text-sm"
                aria-label="Send"
              >
                Send
              </button>
            </div>
            <div className="mt-2 text-[11px] text-black/50 dark:text-white/40">
              Press Enter to send, Shift+Enter for a new line.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
