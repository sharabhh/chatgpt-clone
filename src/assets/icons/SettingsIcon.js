export default function SettingsIcon({ className = "", ...props }) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      className={className}
      {...props}
    >
      <circle cx="8" cy="4" r="2" fill="currentColor"/>
      <path d="M4 14V12C4 10.8954 4.89543 10 6 10H10C11.1046 10 12 10.8954 12 12V14" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    </svg>
  );
}
