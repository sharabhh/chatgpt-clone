"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MessageBubble from "../../../components/MessageBubble";
import TypingBubble from "../../../components/TypingBubble";
import Sidebar from "../../../components/Sidebar";
import { MenuIcon, ShareIcon, AttachmentIcon, SendIcon, MicrophoneIcon } from "@/assets/icons";
import axios from "axios";
import { SignedIn, useUser } from "@clerk/nextjs";

export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(id);
  const [conversations, setConversations] = useState([]);
  const [typingMessageId, setTypingMessageId] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [conversationOwner, setConversationOwner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollAnchorRef = useRef(null);
  const textareaRef = useRef(null);
  const { user, isLoaded } = useUser();
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Create user in database when they sign up/sign in
  useEffect(() => {
    async function createUser() {
      if (isLoaded && user) {
        try {
          const response = await axios.post("/api/users", {
            clerkId: user.id,
            name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            email: user.primaryEmailAddress?.emailAddress,
          });
          setUserDetails(response.data.user);
        } catch (error) {
          console.error("Error creating user:", error);
        }
      }
    }
    createUser();
  }, [isLoaded, user]);

  // Load conversations when user is loaded (only for logged-in users)
  useEffect(() => {
    async function loadConversations() {
      if (isLoaded && user) {
        try {
          const response = await axios.get(`/api/conversations?clerkId=${user.id}`);
          setConversations(response.data.conversations || []);
        } catch (error) {
          console.error("Error loading conversations:", error);
        }
      }
    }
    loadConversations();
  }, [isLoaded, user]);

  // Load the specific conversation based on the URL
  useEffect(() => {
    async function loadConversation() {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // First, try to get the conversation
        const conversationResponse = await axios.get(`/api/conversations/${id}`);
        const conversationMessages = conversationResponse.data.map((msg, index) => ({
          id: `${msg.role}-${index}`,
          role: msg.role,
          content: msg.content,
          messageIndex: index,
        }));
        setMessages(conversationMessages);

        // Get conversation details to check ownership
        const detailsResponse = await axios.get(`/api/conversations/${id}/details`);
        const conversationDetails = detailsResponse.data;
        setConversationOwner(conversationDetails.userId);

        setCurrentConversationId(id);
      } catch (error) {
        console.error("Error loading conversation:", error);
        setError("Conversation not found or you don't have access to it.");
      } finally {
        setIsLoading(false);
      }
    }

    loadConversation();
  }, [id]);

  // Separate effect to check ownership once userDetails is loaded
  useEffect(() => {
    if (conversationOwner && isLoaded) {
      if (user && userDetails) {
        // User is logged in - check if they own the conversation
        const isOwner = conversationOwner._id.toString() === userDetails._id.toString();
        console.log("Ownership check:", {
          conversationOwnerId: conversationOwner._id.toString(),
          currentUserId: userDetails._id.toString(),
          isOwner: isOwner
        });
        setIsReadOnly(!isOwner); // Read-only if NOT owner
      } else {
        // Not logged in - read only
        console.log("User not logged in - setting read-only");
        setIsReadOnly(true);
      }
    }
  }, [conversationOwner, isLoaded, user, userDetails]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [input]);

  async function handleSend() {
    if (isReadOnly) return; // Prevent sending in read-only mode

    try {
      const trimmed = input.trim();
      if (!trimmed || isSending) return;
      
      const userMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
        messageIndex: messages.length,
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsSending(true);
      setIsTyping(true);

      // Save user message to conversation
      await axios.post(`/api/conversations/${currentConversationId}`, {
        role: "user",
        content: trimmed,
      });

      // Update conversation title if it's still the default
      const currentConversation = conversations.find(conv => conv._id === currentConversationId);
      if (currentConversation && currentConversation.title === "New Conversation") {
        await axios.put("/api/conversations", {
          conversationId: currentConversationId,
          title: trimmed.slice(0, 15),
        });
      }

      const response = await axios.post("/api/prompts", {
        prompt: trimmed,
        userId: userDetails._id,
        conversationId: currentConversationId,
      });
      const data = await response.data;

      const replyId = `a-${Date.now()}`;
      const reply = {
        id: replyId,
        role: "assistant",
        content: data.message,
        messageIndex: messages.length + 1,
      };
      
      setTypingMessageId(replyId);
      setMessages((prev) => [...prev, reply]);

      // Save assistant message to conversation
      await axios.post(`/api/conversations/${currentConversationId}`, {
        role: "assistant",
        content: data.message,
      });

      // Reload conversations to update sidebar
      await loadConversations();
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  }

  async function newChat() {
    // Create a new conversation immediately and navigate to it
    if (isLoaded && user && userDetails) {
      try {
        const response = await axios.post("/api/conversations", {
          clerkId: user.id,
          title: "New Conversation",
        });
        const conversationId = response.data._id;
        router.push(`/chat/${conversationId}`);
      } catch (error) {
        console.error("Error creating conversation:", error);
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }

  async function loadConversationFromSidebar(conversationId) {
    router.push(`/chat/${conversationId}`);
  }

  // Helper function to load conversations
  async function loadConversations() {
    if (isLoaded && user) {
      try {
        const response = await axios.get(`/api/conversations?clerkId=${user.id}`);
        setConversations(response.data.conversations || []);
      } catch (error) {
        console.error("Error loading conversations:", error);
      }
    }
  }

  async function handleRegenerate(messageId) {
    if (isReadOnly) return; // Prevent regeneration in read-only mode

    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;
    
    const userMessage = messages[messageIndex - 1];
    if (!userMessage || userMessage.role !== 'user') return;

    setIsTyping(true);
    
    try {
      const response = await axios.post("/api/prompts", {
        prompt: userMessage.content,
        userId: userDetails?._id,
        conversationId: currentConversationId,
      });
      
      setTypingMessageId(messageId);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: response.data.message }
          : msg
      ));

      if (userMessage.messageIndex !== undefined) {
        await axios.put(`/api/conversations/${currentConversationId}`, {
          messageIndex: userMessage.messageIndex,
          newContent: userMessage.content,
        });
        
        await axios.post(`/api/conversations/${currentConversationId}`, {
          role: "assistant",
          content: response.data.message,
        });
      }
    } catch (error) {
      console.error('Error regenerating:', error);
    } finally {
      setIsTyping(false);
    }
  }

  async function handleEdit(messageId, newContent) {
    if (isReadOnly) return; // Prevent editing in read-only mode

    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;
    
    const message = messages[messageIndex];
    if (message.role !== 'user') return;

    try {
      setIsSending(true);
      setIsTyping(true);

      if (message.messageIndex !== undefined) {
        await axios.put(`/api/conversations/${currentConversationId}`, {
          messageIndex: message.messageIndex,
          newContent: newContent,
        });
      }

      const updatedMessages = messages.slice(0, messageIndex + 1);
      updatedMessages[messageIndex] = { ...message, content: newContent };
      setMessages(updatedMessages);

      const response = await axios.post("/api/prompts", {
        prompt: newContent,
        userId: userDetails?._id,
        conversationId: currentConversationId,
      });

      const replyId = `a-${Date.now()}`;
      const reply = {
        id: replyId,
        role: "assistant",
        content: response.data.message,
        messageIndex: messageIndex + 1,
      };
      
      setTypingMessageId(replyId);
      setMessages(prev => [...prev, reply]);

      await axios.post(`/api/conversations/${currentConversationId}`, {
        role: "assistant",
        content: response.data.message,
      });

      await loadConversations();
    } catch (error) {
      console.error('Error editing message:', error);
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey && !isReadOnly) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="font-sans flex h-screen bg-white dark:bg-[#121212] text-[#111] dark:text-[#e5e5e5]">
      {/* Only show sidebar for logged-in users who own the conversation */}
      {isLoaded && user && !isReadOnly && (
        <Sidebar 
          newChat={newChat} 
          conversations={conversations}
          loadConversation={loadConversationFromSidebar}
          currentConversationId={currentConversationId}
          isMobileSidebarOpen={isMobileSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        />
      )}

      <div className="flex-1 flex flex-col dark:bg-[#212121]">
        {/* Loading State */}
        {isLoading && (
          <>
            <header className="h-12 border-b border-black/[.08] dark:border-white/[.01] flex items-center justify-between px-4 text-xl">
              {/* Mobile hamburger menu - only for logged-in users who own the conversation */}
              {isLoaded && user && !isReadOnly && (
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="md:hidden p-2 -ml-2 hover:bg-black/[.05] dark:hover:bg-white/[.1] rounded-lg transition-colors"
                >
                  <MenuIcon className="text-black dark:text-white" />
                </button>
              )}
              
              <div className="flex-1 md:flex-none text-center md:text-left">
                ChatGPT
              </div>

              {/* Share button for conversation owners - only show if there are at least 2 messages */}
              {!isReadOnly && messages.length >= 2 && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Chat link copied to clipboard!");
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-current">
                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="16,6 12,2 8,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Share
                </button>
              )}
            </header>

            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-[#111] dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p>Loading conversation...</p>
              </div>
            </div>
          </>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <>
            <header className="h-12 border-b border-black/[.08] dark:border-white/[.01] flex items-center justify-between px-4 text-xl">
              {/* Mobile hamburger menu - only for logged-in users who own the conversation */}
              {isLoaded && user && !isReadOnly && (
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="md:hidden p-2 -ml-2 hover:bg-black/[.05] dark:hover:bg-white/[.1] rounded-lg transition-colors"
                >
                  <MenuIcon className="text-black dark:text-white" />
                </button>
              )}
              
              <div className="flex-1 md:flex-none text-center md:text-left">
                ChatGPT
              </div>

              {/* Share button for conversation owners - only show if there are at least 2 messages */}
              {!isReadOnly && messages.length >= 2 && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Chat link copied to clipboard!");
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-current">
                    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="16,6 12,2 8,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Share
                </button>
              )}
            </header>

            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
                <button
                  onClick={() => router.push('/')}
                  className="px-4 py-2 bg-[#111] dark:bg-white text-white dark:text-[#111] rounded-lg hover:opacity-80 transition-opacity"
                >
                  Go Home
                </button>
              </div>
            </div>
          </>
        )}

        {/* Normal Content - only show when not loading and no error */}
        {!isLoading && !error && (
          <>
        <header className="h-12 border-b border-black/[.08] dark:border-white/[.01] flex items-center justify-between px-4 text-xl">
          {/* Mobile hamburger menu - only for logged-in users who own the conversation */}
          {isLoaded && user && !isReadOnly && (
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 hover:bg-black/[.05] dark:hover:bg-white/[.1] rounded-lg transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-black dark:text-white">
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          
          <div className="flex-1 md:flex-none text-center md:text-left">
            ChatGPT {isReadOnly && <span className="text-sm text-gray-500 dark:text-gray-400">(Read-only)</span>}
          </div>

          {/* Share button for conversation owners - only show if there are at least 2 messages */}
          {!isReadOnly && messages.length >= 2 && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                // You could add a toast notification here
                alert("Chat link copied to clipboard!");
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
            >
              <ShareIcon className="text-current" />
              Share
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
            {messages.map((m) => (
              <MessageBubble 
                key={m.id} 
                role={m.role} 
                content={m.content} 
                onRegenerate={!isReadOnly ? () => handleRegenerate(m.id) : undefined}
                onEdit={!isReadOnly ? (newContent) => handleEdit(m.id, newContent) : undefined}
                isTyping={m.role === "assistant" && m.id === typingMessageId}
                onTypingComplete={() => {
                  if (m.id === typingMessageId) {
                    setTypingMessageId(null);
                  }
                }}
                isReadOnly={isReadOnly}
              />
            ))}
            {isTyping && <TypingBubble />}
            <div ref={scrollAnchorRef} />
          </div>
        </div>

        {/* Input area - only show for conversation owners */}
        {!isReadOnly && (
          <div className="border-t border-black/[.08] dark:border-white/[.06]">
            <div className="max-w-3xl mx-auto p-4">
              <div className="relative">
                <div className="flex items-end gap-2 bg-[#f4f4f4] dark:bg-[#2f2f2f] rounded-3xl p-3 shadow-sm border border-black/[.05] dark:border-white/[.08]">
                  <div className="flex items-center gap-3 flex-1">
                    <button className="p-1 rounded-lg hover:bg-black/[.05] dark:hover:bg-white/[.1] transition-colors">
                    <AttachmentIcon className="text-black/60 dark:text-white/60" />
                    </button>

                    <textarea
                      ref={textareaRef}
                      className="flex-1 resize-none bg-transparent border-0 text-sm placeholder:text-black/50 dark:placeholder:text-white/50 focus:outline-none min-h-[24px] max-h-[200px] py-1"
                      placeholder="Ask anything"
                      rows={1}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                  </div>

                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isSending}
                    className="p-2 rounded-full bg-black text-white disabled:opacity-40 disabled:cursor-not-allowed dark:bg-white dark:text-black transition-all hover:scale-105 active:scale-95"
                    aria-label="Send message"
                  >
                    <SendIcon />
                  </button>
                </div>
                
                <div className="absolute right-16 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  <button className="p-1 rounded-lg hover:bg-black/[.05] dark:hover:bg-white/[.1] transition-colors">
                    <MicrophoneIcon className="text-black/60 dark:text-white/60" />
                  </button>
                </div>
              </div>
              
              <div className="mt-2 text-[11px] text-black/40 dark:text-white/40 text-center">
                ChatGPT can make mistakes. Check important info. See <span className="underline cursor-pointer">Cookie Preferences</span>.
              </div>
            </div>
          </div>
        )}

        {/* Read-only message for shared chats */}
        {isReadOnly && (
          <div className="border-t border-black/[.08] dark:border-white/[.06] p-4 text-center text-sm text-black/60 dark:text-white/60">
            This is a shared conversation. You can view the messages but cannot respond.
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}
