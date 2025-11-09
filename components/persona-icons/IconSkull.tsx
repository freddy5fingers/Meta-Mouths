import React from 'react';

export const IconSkull: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="9" cy="12" r="1" />
    <circle cx="15" cy="12" r="1" />
    <path d="M8 20v2h8v-2" />
    <path d="M12.5 17.5c-.5.5-1.5.5-2 0" />
    <path d="M16 20a4 4 0 0 0-8 0" />
    <path d="M12 2c-5 0-9 4-9 9 0 2.5 1 4.8 2.5 6.5" />
    <path d="M21.5 17.5c1.5-1.7 2.5-4 2.5-6.5 0-5-4-9-9-9" />
  </svg>
);
