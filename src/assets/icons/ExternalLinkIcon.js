export default function ExternalLinkIcon({ className = "", ...props }) {
  return (
    <svg 
      width="12" 
      height="12" 
      viewBox="0 0 12 12" 
      fill="none" 
      className={className}
      {...props}
    >
      <path d="M3 3L9 9M9 3V9H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
