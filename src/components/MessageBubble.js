"use client";

import { useState, useRef, useEffect } from "react";
import ActionButtons from "./ActionButtons";
import TypewriterText from "./TypewriterText";

export default function MessageBubble({ role, content, onRegenerate, onEdit, isTyping = false, onTypingComplete = () => {} }) {
  const isAssistant = role === "assistant";
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const textareaRef = useRef(null);
  
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (!isAssistant) {
      setIsEditing(true);
      setEditContent(content);
    }
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent.trim() !== content) {
      onEdit(editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(content);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };
  
  if (isAssistant) {
    // Assistant messages: blend with background, no visible bubble
    if (isTyping) {
      return (
        <TypewriterText
          text={content}
          speed={20} // Fast typing speed (20ms per character)
          onComplete={onTypingComplete}
          showActionButtons={true}
          actionButtonsComponent={<ActionButtons content={content} onRegenerate={onRegenerate} />}
        />
      );
    }
    
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
    if (isEditing) {
      // Full width edit mode
      return (
        <div className="py-4">
          <div className="bg-[#2f2f2f] rounded-2xl p-4 w-full ">
              <textarea
                ref={textareaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-white text-[15px] leading-6 resize-none outline-none min-h-[60px] placeholder-gray-400"
                placeholder="Enter your message..."
              />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editContent.trim()}
                className="px-4 py-2 text-sm bg-white hover:bg-gray-100 disabled:bg-gray-600 disabled:cursor-not-allowed text-black disabled:text-white rounded-lg transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      // Normal message bubble
      return (
        <div className="flex justify-end py-4 group">
          <div className="max-w-[90%] relative">
            <div className="whitespace-pre-wrap leading-6 text-[15px] rounded-2xl px-4 py-3 bg-[#2f2f2f] text-white">
              {content}
            </div>
            {/* Edit button - only visible on hover */}
            <button
              onClick={handleEdit}
              className="absolute -left-8 top-3 p-1.5 rounded-md hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
              title="Edit message"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002 2h-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </div>
      );
    }
  }
  }