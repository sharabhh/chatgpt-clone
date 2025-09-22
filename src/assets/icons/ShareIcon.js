export default function ShareIcon({ className = "", ...props }) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none"
      className={className}
      {...props}
    >
      <path 
        d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <polyline 
        points="16,6 12,2 8,6" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <line 
        x1="12" 
        y1="2" 
        x2="12" 
        y2="15" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}
