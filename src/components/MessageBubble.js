"use client";

import ActionButtons from "./ActionButtons";

export default function MessageBubble({ role, content, onRegenerate }) {
  const isAssistant = role === "assistant";
  
  if (isAssistant) {
    // Assistant messages: blend with background, no visible bubble
    return (
      <div className="group flex gap-3 py-4">
        <div className="flex-1">
          <div className="whitespace-pre-wrap leading-7 text-[15px] text-white">
            {content}
          </div>
          <ActionButtons content={content} onRegenerate={onRegenerate} />
        </div>
      </div>
    );
  } else {
    // User messages: distinct bubble on the right
    return (
      <div className="flex justify-end py-4">
        <div className="max-w-[70%] whitespace-pre-wrap leading-6 text-[15px] rounded-2xl px-4 py-3 bg-[#2f2f2f] text-white">
          {content}
        </div>
      </div>
    );
  }
}
