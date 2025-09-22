"use client";

import { useState, useRef, useEffect, memo } from "react";
import ActionButtons from "./ActionButtons";
import TypewriterText from "./TypewriterText";
import { EditIcon } from "@/assets/icons";

function MessageBubble({ role, content, onRegenerate, onEdit, isTyping = false, onTypingComplete = () => {}, isReadOnly = false }) {
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
    if (!isAssistant && !isReadOnly) {
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
      <div className="group flex gap-3 py-4" role="article" aria-label="Assistant message">
        <div className="flex-1">
          <div 
            className="whitespace-pre-wrap leading-7 text-[15px] text-[#111] dark:text-white"
            role="text"
            aria-live="polite"
          >
            {content}
          </div>
          {!isReadOnly && <ActionButtons content={content} onRegenerate={onRegenerate} />}
        </div>
      </div>
    );
  } else {
    // User messages: distinct bubble on the right
    if (isEditing) {
      // Full width edit mode
      return (
        <div className="py-4" role="form" aria-label="Edit message">
          <div className="bg-[#2f2f2f] rounded-2xl p-4 w-full ">
              <textarea
                ref={textareaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-white text-[15px] leading-6 resize-none outline-none min-h-[60px] placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                placeholder="Enter your message..."
                aria-label="Edit your message"
                aria-describedby="edit-instructions"
              />
              <div id="edit-instructions" className="sr-only">
                Press Enter to save, Escape to cancel
              </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                aria-label="Cancel editing"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editContent.trim()}
                className="px-4 py-2 text-sm bg-white hover:bg-gray-100 disabled:bg-gray-600 disabled:cursor-not-allowed text-black disabled:text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Save edited message"
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
        <div className="flex justify-end py-4 group" role="article" aria-label="User message">
          <div className="max-w-[90%] relative">
            <div 
              className="whitespace-pre-wrap leading-6 text-[15px] rounded-2xl px-4 py-3 bg-[#2f2f2f] text-white"
              role="text"
            >
              {content}
            </div>
            {/* Edit button - only visible on hover and not in read-only mode */}
            {!isReadOnly && (
              <button
                onClick={handleEdit}
                className="absolute -left-8 top-3 p-1.5 rounded-md hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Edit message"
                aria-label="Edit this message"
              >
                <EditIcon className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      );
    }
  }
}

// Memoize component for performance
export default memo(MessageBubble);