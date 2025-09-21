"use client";

import { SignedIn, useUser } from "@clerk/nextjs";
import UserProfileButton from "./UserProfileButton";

export default function Sidebar({ newChat, conversations, loadConversation, currentConversationId }) {
  

  // Function to get conversation title for display (first 30 chars of first message or DB title)
  const getConversationTitle = (conversation) => {
    if (conversation.messages && conversation.messages.length > 0) {
      const firstUserMessage = conversation.messages.find(msg => msg.role === 'user');
      if (firstUserMessage) {
        return firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '');
      }
    }
    return conversation.title || 'New Conversation';
  };
  return (
    <SignedIn>
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
          Chats
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
          {conversations && conversations.length > 0 ? (
            conversations.map((conversation) => (
              <div
                key={conversation._id}
                onClick={() => loadConversation(conversation._id)}
                className={`text-sm px-3 py-2 rounded-md cursor-pointer truncate ${
                  currentConversationId === conversation._id
                    ? 'bg-black/[.1] dark:bg-white/[.1]'
                    : 'hover:bg-black/[.05] dark:hover:bg-white/[.05]'
                }`}
              >
                {getConversationTitle(conversation)}
              </div>
            ))
          ) : (
            <div className="text-sm px-3 py-2 rounded-md text-black/60 dark:text-white/50 cursor-default">
              No conversations yet
            </div>
          )}
        </div>
        
        {/* User Profile Section at Bottom */}
       <UserProfileButton />
      </aside>
    </SignedIn>
  );
}
