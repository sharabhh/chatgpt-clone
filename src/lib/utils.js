// Utility functions

/**
 * Debounce function to limit the rate of function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit the rate of function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Format error message for display
 * @param {Error} error - Error object
 * @returns {string} Formatted error message
 */
export function formatErrorMessage(error) {
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  if (error?.message) {
    return error.message;
  }
  return "An unexpected error occurred";
}

/**
 * Generate a unique ID
 * @returns {string} Unique identifier
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Copy text to clipboard with error handling
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand("copy");
      textArea.remove();
      return success;
    }
  } catch (error) {
    console.error("Failed to copy text:", error);
    return false;
  }
}

/**
 * Validate if a string is a valid MongoDB ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} Is valid ObjectId
 */
export function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Sanitize HTML content
 * @param {string} content - Content to sanitize
 * @returns {string} Sanitized content
 */
export function sanitizeContent(content) {
  const div = document.createElement("div");
  div.textContent = content;
  return div.innerHTML;
}

/**
 * Format timestamp for display
 * @param {Date|string} timestamp - Timestamp to format
 * @returns {string} Formatted timestamp
 */
export function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffHours < 1) {
    return "Just now";
  } else if (diffHours < 24) {
    return `${Math.floor(diffHours)} hour${Math.floor(diffHours) !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${Math.floor(diffDays)} day${Math.floor(diffDays) !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}
