"use client";

export default function TypingBubble() {
  return (
    <div className="flex gap-3 py-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-[#111] dark:bg-white rounded-full animate-[pulse-scale_1.5s_ease-in-out_infinite]"></div>
        </div>
    </div>
  );
}
