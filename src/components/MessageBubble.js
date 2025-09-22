"use client";

import { useState, useRef, useEffect, memo } from "react";
import ActionButtons from "./ActionButtons";
import TypewriterText from "./TypewriterText";
import FileAttachment from "./FileAttachment";
import { EditIcon, NewChatIcon } from "@/assets/icons";
import PencilIcon from "@/assets/icons/PencilIcon";

function MessageBubble({ role, content, attachments = [], onRegenerate, onEdit, isTyping = false, onTypingComplete = () => {}, isReadOnly = false }) {
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
    // Allow saving even if content is empty (for attachment-only messages)
    if (editContent.trim() !== content) {
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
                className="w-full bg-transparent text-white text-[15px] leading-6 resize-none outline-none min-h-[60px] placeholder-gray-400 focus:outline-none"
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
                className="px-4 py-2 text-sm bg-white hover:bg-gray-100 text-black rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="flex justify-end py-4" role="article" aria-label="User message">
          <div className="max-w-[90%] relative">
            <div 
              className="whitespace-pre-wrap leading-6 text-[15px] rounded-2xl px-4 py-3 bg-[#2f2f2f] text-white min-h-[3rem]"
              role="text"
            >
              {/* Display attachments first if any */}
              {attachments && attachments.length > 0 && (
                <div className={content && content.trim() ? "mb-3 space-y-2" : "space-y-2"}>
                  {attachments.map((attachment, index) => (
                    <FileAttachment key={index} attachment={attachment} />
                  ))}
                </div>
              )}
              {/* Display content if provided */}
              {content && content.trim() && (
                <div>{content}</div>
              )}
              {/* Ensure there's always some content for the message bubble */}
              {(!content || !content.trim()) && (!attachments || attachments.length === 0) && (
                <div className="text-gray-400 italic">Empty message</div>
              )}
            </div>
            {/* Edit control shown below the prompt */}
            {!isReadOnly && onEdit && (
              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md  text-white hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
                  title="Edit this message"
                  aria-label="Edit this message"
                >
                  {/* <EditIcon /> */}
                  <NewChatIcon className="w-3 h-3" />
                  {/* Edit */}
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }
  }
}

// Memoize component for performance
export default memo(MessageBubble);