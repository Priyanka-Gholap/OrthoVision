'use client';

import React from 'react';

interface CalibrationOverlayProps {
  joint: string;
}

export const CalibrationOverlay: React.FC<CalibrationOverlayProps> = ({ joint }) => {
  const isFrontal = ['SA001', 'NR001'].includes(joint);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center">
      {isFrontal ? (
        // Front-facing Outline Guide
        <svg 
          viewBox="0 0 100 100" 
          className="w-[70%] h-[70%] text-[#00b4d8]/40 stroke-current fill-none stroke-[1.5]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Head */}
          <circle cx="50" cy="25" r="10" />
          {/* Neck */}
          <line x1="50" y1="35" x2="50" y2="40" />
          {/* Shoulders */}
          <line x1="30" y1="40" x2="70" y2="40" />
          {/* Torso */}
          <line x1="35" y1="40" x2="38" y2="75" />
          <line x1="65" y1="40" x2="62" y2="75" />
          {/* Pelvis */}
          <line x1="38" y1="75" x2="62" y2="75" />
          {/* Arms placeholders */}
          <path d="M 30,40 Q 20,55 30,70" strokeDasharray="3,3" />
          <path d="M 70,40 Q 80,55 70,70" strokeDasharray="3,3" />
        </svg>
      ) : (
        // Side-facing Sagittal View Outline Guide
        <svg 
          viewBox="0 0 100 100" 
          className="w-[70%] h-[70%] text-[#9d4edd]/40 stroke-current fill-none stroke-[1.5]"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Head (Profile view tilted) */}
          <circle cx="45" cy="25" r="9" />
          {/* Neck */}
          <line x1="45" y1="34" x2="46" y2="40" />
          {/* Torso Profile line */}
          <path d="M 46,40 Q 42,55 48,75" />
          {/* Side Leg Silhouette */}
          <path d="M 48,75 L 45,95" />
          {/* Target Limb angle arc guidelines */}
          <path 
            d="M 46,40 Q 55,55 65,58" 
            stroke="#10b981" 
            strokeWidth="2" 
            strokeDasharray="2,2" 
          />
          {/* Bounding box guide */}
          <rect x="5" y="5" width="90" height="90" rx="10" stroke="#1e293b" strokeDasharray="5,5" />
        </svg>
      )}
    </div>
  );
};
export default CalibrationOverlay;
