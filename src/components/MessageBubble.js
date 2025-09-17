"use client";

export default function MessageBubble({ role, content }) {
  const isAssistant = role === "assistant";
  return (
    <div className={`flex gap-3 ${isAssistant ? "" : "flex-row-reverse"}`}>
      <div
        className={`h-8 w-8 rounded-sm flex items-center justify-center text-xs font-semibold ${
          isAssistant
            ? "bg-black text-white dark:bg-white dark:text-black"
            : "bg-[#e5e5e5] text-black dark:bg-[#2a2a2a] dark:text-white"
        }`}
      >
        {isAssistant ? "GPT" : "You"}
      </div>
      <div
        className={`max-w-[80%] whitespace-pre-wrap leading-6 text-sm rounded-lg px-3 py-2 ${
          isAssistant
            ? "bg-black/[.03] dark:bg-white/[.04]"
            : "bg-[#f2f2f2] dark:bg-[#1a1a1a]"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
