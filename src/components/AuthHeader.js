"use client";

import { useState, useEffect, useRef } from "react";
import {
  SignInButton,
  SignUpButton,
  SignedOut,
} from "@clerk/nextjs";
import {
  PlansAndPricingIcon,
  SettingsIcon,
  HelpCenterIcon,
  ReleaseNotesIcon,
  TermsAndPoliciesIcon,
  ExternalLinkIcon
} from "@/assets/icons";

export default function AuthHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuItems = [
    {
      icon: <PlansAndPricingIcon />,
      text: "See plans and pricing",
      hasArrow: true,
      onClick: () => console.log("See plans and pricing")
    },
    {
      icon: <SettingsIcon />,
      text: "Settings",
      onClick: () => console.log("Settings")
    },
    {
      icon: <HelpCenterIcon />,
      text: "Help center",
      onClick: () => console.log("Help center")
    },
    {
      icon: <ReleaseNotesIcon />,
      text: "Release notes",
      onClick: () => console.log("Release notes")
    },
    {
      icon: <TermsAndPoliciesIcon />,
      text: "Terms & policies",
      onClick: () => console.log("Terms & policies")
    }
  ];

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-4">
      <SignedOut>
        <SignInButton>
          <button className="bg-white text-black rounded-full font-medium text-sm px-4 py-2 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm">
            Log in
          </button>
        </SignInButton>
        <SignUpButton>
          <button className="bg-black text-white rounded-full font-medium text-sm px-4 py-2 cursor-pointer hover:bg-gray-800 transition-colors shadow-sm">
            Sign up for free
          </button>
        </SignUpButton>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors text-sm font-medium shadow-sm"
          >
            ?
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 top-10 w-64 bg-[#2f2f2f] rounded-lg shadow-xl py-2 z-50">
              {menuItems.map((item, index) => (
                <div key={index}>
                  <button
                    onClick={() => {
                      item.onClick();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#3f3f3f] transition-colors group"
                  >
                    <span className="text-gray-300 group-hover:text-white transition-colors">
                      {item.icon}
                    </span>
                    <span className="flex-1 text-sm text-gray-200 group-hover:text-white transition-colors">
                      {item.text}
                    </span>
                    {item.hasArrow && (
                      <ExternalLinkIcon className="text-gray-400 group-hover:text-gray-300" />
                    )}
                  </button>
                  {index === 0 && (
                    <div className="border-t border-gray-600 mx-4 my-1"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </SignedOut>
    </div>
  );
}
