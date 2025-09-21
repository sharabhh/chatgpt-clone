"use client";

import { useEffect, useRef, useState } from "react";
import MessageBubble from "../components/MessageBubble";
import TypingBubble from "../components/TypingBubble";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { SignedIn, useUser } from "@clerk/nextjs";

const initialMessages = [
  // { id: "m1", role: "assistant", content: "How can I help you today?" },
];

export default function Home() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
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
        console.log("User creation response:", response.data);
        setUserDetails(response.data.user);
      } catch (error) {
        console.error("Error creating user:", error);
      }
    }
  }
  createUser();
}, [isLoaded, user])

// Load conversations when user is loaded
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

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [input]);

  async function handleSend() {
    try {
      const trimmed = input.trim();
      if (!trimmed || isSending) return;
      
      // If no current conversation, create a new one with the prompt as title
      let conversationId = currentConversationId;
      if (!conversationId) {
        conversationId = await createNewConversation(trimmed);
        setCurrentConversationId(conversationId);
      }

      const userMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsSending(true);
      setIsTyping(true);

      // Save user message to conversation
      await axios.post(`/api/conversations/${conversationId}`, {
        role: "user",
        content: trimmed,
      });

      // Update conversation title if it's still the default and this is likely the first message
      const currentConversation = conversations.find(conv => conv._id === conversationId);
      if (currentConversation && currentConversation.title === "New Conversation") {
        await axios.put("/api/conversations", {
          conversationId: conversationId,
          title: trimmed.slice(0, 15),
        });
      }

      const response = await axios.post("/api/prompts", {
        prompt: trimmed,
        userId: userDetails._id,
      });
      const data = await response.data;
      console.log("data", data);

      const reply = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.message,
      };
      setMessages((prev) => [...prev, reply]);

      // Save assistant message to conversation
      await axios.post(`/api/conversations/${conversationId}`, {
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

// Helper function to create a new conversation
async function createNewConversation(firstPrompt = null) {
  try {
     const title = firstPrompt ? firstPrompt.slice(0, 30) : "New Conversation";
    const response = await axios.post("/api/conversations", {
      clerkId: user.id,
      title: title,
    });
    return response.data._id;
  } catch (error) {
    console.error("Error creating conversation:", error);
    return null;
  }
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

function createMessage(role, content) {
  return {
    id: `a-${Date.now()}`,
    role: role,
    content: content,
  };
}

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function newChat() {
    // Reset to no active conversation - new one will be created when user sends first message
    setCurrentConversationId(null);
    setMessages(initialMessages);
    setInput("");
  }

  // Function to load messages from a specific conversation
  async function loadConversation(conversationId) {
    try {
      const response = await axios.get(`/api/conversations/${conversationId}`);
      const conversationMessages = response.data.map((msg, index) => ({
        id: `${msg.role}-${index}`,
        role: msg.role,
        content: msg.content,
      }));
      setMessages(conversationMessages);
      setCurrentConversationId(conversationId);
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  }

  async function handleRegenerate(messageId) {
    // Find the user message that prompted this response
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;
    
    // Find the previous user message
    const userMessage = messages[messageIndex - 1];
    if (!userMessage || userMessage.role !== 'user') return;

    setIsTyping(true);
    
    try {
      const response = await axios.post("/api/prompts", {
        prompt: userMessage.content,
        userId: user.id,
      });
      
      // Update the assistant message with new response
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: response.data.message }
          : msg
      ));
    } catch (error) {
      console.error('Error regenerating:', error);
    } finally {
      setIsTyping(false);
    }
  }

  console.log("messages", messages);

  return (
    <div className="font-sans flex h-screen bg-white dark:bg-[#121212] text-[#111] dark:text-[#e5e5e5]">
      <Sidebar 
        newChat={newChat} 
        conversations={conversations}
        loadConversation={loadConversation}
        currentConversationId={currentConversationId}
      />

      <div className="flex-1 flex flex-col dark:bg-[#212121]">
        <header className="h-12 border-b border-black/[.08] dark:border-white/[.01] flex items-center px-4 text-sm">
          ChatGPT
        </header>

{messages.length === 0 ? (
          /* Centered layout when no messages */
          <div className="flex-1 flex flex-col items-center justify-center px-4 md:pb-60">
            <div className="text-center mb-4">
              <h1 className="text-2xl md:text-3xl font-normal text-black/90 dark:text-white/90 mb-8">
                What's on your mind today?
              </h1>
            </div>
            
            <div className="w-full max-w-md md:max-w-2xl">
              <div className="relative">
                <div className="flex items-end gap-2 bg-[#f4f4f4] dark:bg-[#2f2f2f] rounded-3xl p-3 shadow-sm border border-black/[.05] dark:border-white/[.08]">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Plus icon */}
                    <button className="p-1 rounded-lg hover:bg-black/[.05] dark:hover:bg-white/[.1] transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-black/60 dark:text-white/60">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
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

                  {/* Right side icons */}
                  <div className="flex items-center gap-2">
                    <button className="p-1 rounded-lg hover:bg-black/[.05] dark:hover:bg-white/[.1] transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-black/60 dark:text-white/60">
                        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" fill="currentColor"/>
                        <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    
                    <button className="p-1 rounded-lg hover:bg-black/[.05] dark:hover:bg-white/[.1] transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-black/60 dark:text-white/60">
                        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                        <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                        <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                        <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* <div className="mt-2 text-[11px] text-black/40 dark:text-white/40 text-center">
                ChatGPT can make mistakes. Check important info. See <span className="underline cursor-pointer">Cookie Preferences</span>.
              </div> */}
            </div>
          </div>
        ) : (
          /* Normal layout when messages exist */
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
                {messages.map((m) => (
                  <MessageBubble 
                    key={m.id} 
                    role={m.role} 
                    content={m.content} 
                    onRegenerate={() => handleRegenerate(m.id)}
                  />
                ))}
                {isTyping && <TypingBubble />}
                <div ref={scrollAnchorRef} />
              </div>
            </div>

            <div className="border-t border-black/[.08] dark:border-white/[.06]">
              <div className="max-w-3xl mx-auto p-4">
                <div className="relative">
                  <div className="flex items-end gap-2 bg-[#f4f4f4] dark:bg-[#2f2f2f] rounded-3xl p-3 shadow-sm border border-black/[.05] dark:border-white/[.08]">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Attachment icon */}
                      <button className="p-1 rounded-lg hover:bg-black/[.05] dark:hover:bg-white/[.1] transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-black/60 dark:text-white/60">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66L9.64 16.2a2 2 0 01-2.83-2.83l8.49-8.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
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

                    {/* Send button */}
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isSending}
                      className="p-2 rounded-full bg-black text-white disabled:opacity-40 disabled:cursor-not-allowed dark:bg-white dark:text-black transition-all hover:scale-105 active:scale-95"
                      aria-label="Send message"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  
                  {/* Microphone and other icons */}
                  <div className="absolute right-16 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <button className="p-1 rounded-lg hover:bg-black/[.05] dark:hover:bg-white/[.1] transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-black/60 dark:text-white/60">
                        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" fill="currentColor"/>
                        <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="mt-2 text-[11px] text-black/40 dark:text-white/40 text-center">
                  ChatGPT can make mistakes. Check important info. See <span className="underline cursor-pointer">Cookie Preferences</span>.
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
