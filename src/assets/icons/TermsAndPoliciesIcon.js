export default function TermsAndPoliciesIcon({ className = "", ...props }) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      className={className}
      {...props}
    >
      <path d="M3 2H11L13 4V14H3V2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M11 2V4H13" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M5 7H11" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 9H9" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}
