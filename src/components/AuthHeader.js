"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export default function AuthHeader() {
  return (
    <header className="flex justify-end items-center p-4 gap-4">
      <SignedOut>
        <SignInButton>
          <button className="bg-[#f9f9f9] text-black rounded-full font-medium text-sm sm:text-base h-3 sm:h-6 px-4 sm:px-5 cursor-pointer hover:bg-gray-200 transition-colors">
            Log In
          </button>
        </SignInButton>
        <SignUpButton>
          <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer hover:bg-[#5a3ed9] transition-colors">
            Sign Up for free
          </button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );
}
