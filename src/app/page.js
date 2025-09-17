"use client";

import { useEffect, useRef, useState } from "react";
import MessageBubble from "../components/MessageBubble";

const initialMessages = [
  { id: "m1", role: "assistant", content: "How can I help you today?" },
];

export default function Home() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
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

  function handleSend() {
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

    setTimeout(() => {
      const reply = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content:
          "This is a placeholder response. Connect an API to get real answers.",
      };
      setMessages((prev) => [...prev, reply]);
      setIsSending(false);
    }, 500);
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

  return (
    <div className="font-sans flex h-screen bg-white dark:bg-[#121212] text-[#111] dark:text-[#e5e5e5]">
      <aside className="hidden md:flex w-[260px] shrink-0 flex-col border-r border-black/[.08] dark:border-white/[.06] bg-[#f7f7f7] dark:bg-[#0f0f0f]">
        <div className="p-3">
          <button
            onClick={newChat}
            className="w-full rounded-md border border-black/[.08] dark:border-white/[.12] bg-white dark:bg-[#1a1a1a] hover:bg-[#f2f2f2] dark:hover:bg-[#2a2a2a] px-3 py-2 text-sm"
          >
            + New chat
          </button>
        </div>
        <div className="px-3 pb-3 text-xs text-black/60 dark:text-white/50">
          Recent
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
          <div className="text-sm px-3 py-2 rounded-md hover:bg-black/[.05] dark:hover:bg-white/[.05] cursor-default">
            Welcome
          </div>
        </div>
        <div className="p-3 border-t border-black/[.08] dark:border-white/[.06] text-xs text-black/60 dark:text-white/50">
          ChatGPT Clone
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-12 border-b border-black/[.08] dark:border-white/[.06] flex items-center px-4 text-sm">
          ChatGPT
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
            {messages.map((m) => (
              <MessageBubble key={m.id} role={m.role} content={m.content} />
            ))}
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
