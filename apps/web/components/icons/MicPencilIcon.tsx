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
      <g transform="translate(50, 50) rotate(-25) translate(-30, -45)">
        {/* Microphone Head (pill shape) */}
        <rect x="15" y="0" width="30" height="40" rx="15" fill="currentColor"/>

        {/* Microphone Ring */}
        <ellipse cx="30" cy="46" rx="14" ry="6" fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="3"/>

        {/* Pencil Body */}
        <path d="M16 46 L10 85 L30 95 L50 85 L44 46 Z" fill="currentColor"/>

        {/* Pencil Tip */}
        <path d="M10 85 L30 105 L50 85 Z" fill="currentColor"/>

        {/* Pencil Tip (white inner) */}
        <path d="M22 92 L30 105 L38 92 Z" fill="white" fillOpacity="0.9"/>
      </g>
    </svg>
  );
}
