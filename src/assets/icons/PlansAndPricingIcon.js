export default function PlansAndPricingIcon({ className = "", ...props }) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      className={className}
      {...props}
    >
      <path d="M8.5 2.5L13 7L8.5 11.5L7.5 10.5L11 7L7.5 3.5L8.5 2.5Z" fill="currentColor"/>
      <rect x="3" y="6" width="2" height="2" fill="currentColor"/>
    </svg>
  );
}
