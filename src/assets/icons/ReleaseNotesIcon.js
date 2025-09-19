export default function ReleaseNotesIcon({ className = "", ...props }) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      className={className}
      {...props}
    >
      <path d="M3 3H13V13H3V3Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M6 6H10" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 8H10" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6 10H8" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}
