"use client";

import { useState } from "react";
import { ThumbsDownLined, ThumbsUpLined } from "@/assets/icons";

export default function ActionButtons({ content, onRegenerate }) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(null); // null, 'up', or 'down'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleLike = (type) => {
    setLiked(liked === type ? null : type);
  };

  const handleShare = () => {
    // Implement share functionality
    console.log('Share clicked');
  };

  const handleMore = () => {
    // Implement more options
    console.log('More options clicked');
  };

  return (
    <div className="flex items-center gap-1 mt-2">
      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
        title={copied ? "Copied!" : "Copy"}
      >
        {copied ? (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>

      {/* Thumbs Up */}
      <button
        onClick={() => handleLike('up')}
        className={`p-1.5 rounded-md hover:bg-white/10 transition-colors ${
          liked === 'up' ? 'text-white' : 'text-gray-400'
        }`}
        title="Good response"
      >
        <ThumbsUpLined />
      </button>

      {/* Thumbs Down */}
      <button
        onClick={() => handleLike('down')}
        className={`p-1.5 rounded-md hover:bg-white/10 transition-colors ${
          liked === 'down' ? 'text-white' : 'text-gray-400'
        }`}
        title="Bad response"
      >
        <ThumbsDownLined />
      </button>

      {/* Share Button */}
      <button
        onClick={handleShare}
        className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
        title="Share"
      >
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
      </button>

      {/* Regenerate Button */}
      <button
        onClick={onRegenerate}
        className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
        title="Regenerate response"
      >
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

      {/* More Options */}
      <button
        onClick={handleMore}
        className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
        title="More options"
      >
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
    </div>
  );
}
