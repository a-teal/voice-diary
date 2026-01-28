'use client';

interface MicPencilIconProps {
  className?: string;
  size?: number;
}

export default function MicPencilIcon({ className = '', size = 24 }: MicPencilIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Rotated Microphone-Pencil */}
      <g transform="translate(50, 47) rotate(-35) translate(-16, -32)">
        {/* Microphone Head (pill shape) */}
        <rect x="6" y="0" width="20" height="26" rx="10" fill="currentColor"/>

        {/* Microphone Ring */}
        <ellipse cx="16" cy="29" rx="8.5" ry="3.2" fill="none" stroke="white" strokeOpacity="0.8" strokeWidth="1.6"/>

        {/* Pencil Body */}
        <path d="M7.5 29 L4 60 L16 72 L28 60 L24.5 29 Z" fill="currentColor"/>

        {/* Pencil Tip */}
        <path d="M4 60 L16 78 L28 60 Z" fill="currentColor"/>

        {/* Pencil Tip (white inner) */}
        <path d="M11 66 L16 78 L21 66 Z" fill="white" fillOpacity="0.95"/>
      </g>
    </svg>
  );
}
