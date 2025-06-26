import React from 'react';

export const JefoLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12,22A10,10,0,1,0,12,2a10,10,0,0,0,0,20Z" />
    <path d="M12,12m-3,0a3,3,0,1,0,6,0a3,3,0,1,0,-6,0" />
    <path d="M10 7l-2 2" />
    <path d="M14 7l2 2" />
    <path d="M8 12H6" />
    <path d="M18 12h-2" />
    <path d="M10 17l-2-2" />
    <path d="M14 17l2-2" />
  </svg>
);
