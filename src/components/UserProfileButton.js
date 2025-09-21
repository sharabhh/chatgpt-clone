import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";

export default function UserProfileButton() {
  const { user } = useUser();
  return (
    <div className="p-3 border-t border-black/[.08] dark:border-white/[.06]">
          <div className="flex items-center gap-3 mb-2">
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8"
                }
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-black dark:text-white truncate">
                {user?.fullName}
              </div>
              <div className="text-xs text-black/60 dark:text-white/50">
                Free
              </div>
            </div>
            <button 
              onClick={() => window.open('https://chatgpt.com/c/pricing', '_blank')}
              className="px-4 py-1.5 text-xs font-medium bg-[#1a1a1a] dark:bg-[#2a2a2a] text-white dark:text-white rounded-full border border-gray-300 dark:border-gray-600 hover:bg-[#2a2a2a] dark:hover:bg-[#3a3a3a] transition-all duration-200 shadow-sm"
            >
              Upgrade
            </button>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-full h-px bg-black/[.08] dark:bg-white/[.06]"></div>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              className="text-black/40 dark:text-white/40 mx-2"
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="w-full h-px bg-black/[.08] dark:bg-white/[.06]"></div>
          </div>
        </div>
  );
}