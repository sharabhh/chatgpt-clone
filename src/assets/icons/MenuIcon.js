export default function MenuIcon({ className = "", ...props }) {
  return (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
      {...props}
    >
      <path 
        d="M3 6h18M3 12h18M3 18h18" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}
