"use client";

import { useState, useEffect } from "react";

export default function TypewriterText({ 
  text, 
  speed = 1, // milliseconds per character
  onComplete = () => {},
  showActionButtons = true,
  actionButtonsComponent = null 
}) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (currentIndex >= text.length && !isComplete) {
      setIsComplete(true);
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete, isComplete]);

  // Reset when text changes
  useEffect(() => {
    setDisplayText("");
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  return (
    <div className="group flex gap-3 py-4">
      <div className="flex-1">
        <div className="whitespace-pre-wrap leading-7 text-[15px] text-white">
          {displayText}
          {!isComplete && (
            <span className="animate-pulse text-white/60">|</span>
          )}
        </div>
        {isComplete && showActionButtons && actionButtonsComponent}
      </div>
    </div>
  );
}
