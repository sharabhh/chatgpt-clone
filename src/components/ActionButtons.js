"use client";

import { useState, memo } from "react";
import { CopyIcon, ShareIcon, RegenerateIcon, MoreOptionsIcon, CheckIcon } from "@/assets/icons";
import { ThumbsDownLined, ThumbsUpLined } from "@/assets/icons";

function ActionButtons({ content, onRegenerate }) {
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
          <CheckIcon className="w-4 h-4 text-green-600" />
        ) : (
          <CopyIcon className="w-4 h-4 text-gray-400" />
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
        <ShareIcon className="w-4 h-4 text-gray-400" />
      </button>

      {/* Regenerate Button */}
      <button
        onClick={onRegenerate}
        className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
        title="Regenerate response"
      >
        <RegenerateIcon className="w-4 h-4 text-gray-400" />
      </button>

      {/* More Options */}
      <button
        onClick={handleMore}
        className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
        title="More options"
      >
        <MoreOptionsIcon className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );
}

// Memoize component for performance
export default memo(ActionButtons);
