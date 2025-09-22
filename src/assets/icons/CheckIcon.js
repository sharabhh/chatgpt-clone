export default function CheckIcon({ className = "", ...props }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      {...props}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M5 13l4 4L19 7" 
      />
    </svg>
  );
}
