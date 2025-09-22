// Application constants
export const APP_NAME = "ChatGPT Clone";
export const APP_DESCRIPTION = "A modern ChatGPT clone built with Next.js";

// Timing constants
export const TYPEWRITER_SPEED = 20; // milliseconds per character
export const COPY_FEEDBACK_DURATION = 2000; // milliseconds

// UI constants
export const TEXTAREA_MAX_HEIGHT = 200; // pixels
export const TEXTAREA_MIN_HEIGHT = 24; // pixels

// Message roles
export const MESSAGE_ROLES = {
  USER: "user",
  ASSISTANT: "assistant"
};

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  NEW_CHAT: "ctrl+shift+o",
  SEND_MESSAGE: "enter",
  CANCEL_EDIT: "escape"
};

// API endpoints
export const API_ENDPOINTS = {
  CONVERSATIONS: "/api/conversations",
  PROMPTS: "/api/prompts",
  USERS: "/api/users",
  HEALTH: "/api/health"
};

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: "An unexpected error occurred. Please try again.",
  NETWORK: "Network error. Please check your connection.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION: "Please check your input and try again."
};

// Success messages
export const SUCCESS_MESSAGES = {
  COPIED: "Copied to clipboard!",
  SAVED: "Message saved successfully",
  SHARED: "Chat link copied to clipboard!"
};
