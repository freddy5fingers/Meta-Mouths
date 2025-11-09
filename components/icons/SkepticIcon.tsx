
import React from 'react';

export const SkepticIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M20 10.5c0-.98-.5-1.92-1.34-2.61a6.47 6.47 0 0 0-8.66-8.66C9.12 1.39 8.18 1.89 7.5 3" />
    <path d="m4 13.5c0 .98.5 1.92 1.34 2.61a6.47 6.47 0 0 0 8.66 8.66c.88.66 1.82 1.16 2.5 1.39" />
    <path d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z" />
    <path d="M12 19.5c-4.66 0-8.4-3.72-8.4-8.35" />
    <path d="M12 4.5c4.66 0 8.4 3.72 8.4 8.35" />
  </svg>
);
