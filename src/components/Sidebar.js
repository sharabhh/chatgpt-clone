"use client";

import { SignedIn, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import UserProfileButton from "./UserProfileButton";
import { ChatGPTIcon, NewChatIcon, SearchIcon, LibraryIcon } from "@/assets/icons";

export default function Sidebar({ newChat, conversations, loadConversation, currentConversationId }) {
  const { user } = useUser();

  // Add keyboard shortcut listener for Ctrl+Shift+O
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'O') {
        event.preventDefault();
        newChat();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [newChat]);

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
        {/* Header with Logo and Collapse Button */}
        <div className="flex items-center justify-between p-4 border-b border-black/[.08] dark:border-white/[.06]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-sm flex items-center justify-center">
             <ChatGPTIcon />
            </div>
            {/* <span className="text-sm font-semibold text-black dark:text-white">ChatGPT</span> */}
          </div>
          <button className="p-1 hover:bg-black/[.05] dark:hover:bg-white/[.1] rounded">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-black/60 dark:text-white/60">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Main Navigation */}
        <div className="p-3 space-y-1">
          <button
            onClick={newChat}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-black dark:text-white hover:bg-black/[.05] dark:hover:bg-white/[.18] rounded-md transition-colors group"
          >
            <div className="flex items-center gap-3">
              <NewChatIcon className="w-8 h-8" />
              New chat
            </div>
            <span className="text-xs text-black/40 dark:text-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Ctrl+Shift+O
            </span>
          </button>
          
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-black dark:text-white hover:bg-black/[.05] dark:hover:bg-white/[.18] rounded-md transition-colors">
            <SearchIcon />
            Search chats
          </button>
          
          <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-black dark:text-white hover:bg-black/[.05] dark:hover:bg-white/[.18] rounded-md transition-colors">
            <LibraryIcon className="w-8 h-8" />
            Library
          </button>
        </div>

        {/* Chats Section - Takes remaining space */}
        <div className="flex-1 flex flex-col px-3 min-h-0">
          <div className="text-xs text-black/60 dark:text-white/50 mb-2 font-medium">
            Chats
          </div>
          <div className="flex-1 overflow-y-auto space-y-1 pr-1 pb-3">
            {conversations && conversations.length > 0 ? (
              conversations.map((conversation) => (
                <div
                  key={conversation._id}
                  onClick={() => loadConversation(conversation._id)}
                  className={`text-sm px-3 py-2 rounded-md cursor-pointer truncate ${
                    currentConversationId === conversation._id
                      ? 'bg-black/[.1] dark:bg-white/[.1]'
                      : 'hover:bg-black/[.05] dark:hover:bg-white/[.18]'
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
        </div>
        
        {/* User Profile Section at Bottom */}
        <UserProfileButton />
      </aside>
    </SignedIn>
  );
}
