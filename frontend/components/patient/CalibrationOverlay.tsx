'use client';

import React from 'react';

interface CalibrationOverlayProps {
  joint: string;
}

export const CalibrationOverlay: React.FC<CalibrationOverlayProps> = ({ joint }) => {
  const isFrontal = ['SA001', 'NR001'].includes(joint);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none flex flex-col items-center justify-between p-4">
      {/* Top Orientation Banner */}
      <div className="bg-black/60 backdrop-blur-sm border border-white/10 px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-white/80 shadow-md">
        {isFrontal ? '👤 FRONT VIEW: Align your body facing the camera' : '👤 SIDE VIEW: Align your body sideways to the camera'}
      </div>

      {/* Center Anatomical Silhouette Guide */}
      <div className="relative w-full h-[75%] flex items-center justify-center">
        {isFrontal ? (
          // Front-facing Silhouette Guide
          <svg
            viewBox="0 0 100 120"
            className="w-full h-full max-h-[85%] text-[#00b4d8]/25 stroke-current fill-none stroke-[1.2]"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Framing Bounds */}
            <rect x="15" y="5" width="70" height="110" rx="8" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 3" />

            {/* Head */}
            <circle cx="50" cy="20" r="9" />
            {/* Shoulders & Torso */}
            <line x1="32" y1="34" x2="68" y2="34" strokeWidth="2" />
            <path d="M 35,34 L 38,70 L 62,70 L 65,34" />
            {/* Arms resting at sides */}
            <path d="M 32,34 L 27,65 L 25,75" strokeDasharray="2 2" />
            <path d="M 68,34 L 73,65 L 75,75" strokeDasharray="2 2" />
            {/* Legs */}
            <line x1="42" y1="70" x2="40" y2="112" strokeWidth="2" strokeDasharray="3 3" />
            <line x1="58" y1="70" x2="60" y2="112" strokeWidth="2" strokeDasharray="3 3" />

            {/* Joint Target Indicator */}
            {joint === 'SA001' && (
              <circle cx="68" cy="34" r="5" fill="#00b4d8" fillOpacity="0.3" stroke="#00b4d8" strokeWidth="1.5" />
            )}
            {joint === 'NR001' && (
              <circle cx="50" cy="20" r="11" fill="#00b4d8" fillOpacity="0.2" stroke="#00b4d8" strokeWidth="1.5" />
            )}
          </svg>
        ) : (
          // Side-facing Profile Guide
          <svg
            viewBox="0 0 100 120"
            className="w-full h-full max-h-[85%] text-[#00b4d8]/25 stroke-current fill-none stroke-[1.2]"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Framing Bounds */}
            <rect x="20" y="5" width="60" height="110" rx="8" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 3" />

            {/* Profile Head */}
            <circle cx="50" cy="20" r="9" />
            {/* Profile Spine / Torso */}
            <path d="M 50,29 Q 47,48 50,68" strokeWidth="2" />
            {/* Arm guideline */}
            <path d="M 50,35 L 53,55 L 53,75" strokeDasharray="2 2" strokeWidth="1.5" />
            {/* Leg guideline */}
            <path d="M 50,68 L 50,90 L 50,112" strokeWidth="2" strokeDasharray="3 3" />

            {/* Target Joint Highlights */}
            {joint === 'SF001' && (
              <circle cx="50" cy="35" r="5" fill="#00b4d8" fillOpacity="0.3" stroke="#00b4d8" strokeWidth="1.5" />
            )}
            {joint === 'EF001' && (
              <circle cx="53" cy="55" r="5" fill="#00b4d8" fillOpacity="0.3" stroke="#00b4d8" strokeWidth="1.5" />
            )}
            {joint === 'KF001' && (
              <circle cx="50" cy="90" r="5" fill="#00b4d8" fillOpacity="0.3" stroke="#00b4d8" strokeWidth="1.5" />
            )}
            {joint === 'HF001' && (
              <circle cx="50" cy="68" r="5" fill="#00b4d8" fillOpacity="0.3" stroke="#00b4d8" strokeWidth="1.5" />
            )}
          </svg>
        )}
      </div>

      {/* Bottom Positioning Note */}
      <div className="text-[10px] text-white/50 text-center">
        Step back until your body fits comfortably within the framing lines
      </div>
    </div>
  );
};

export default CalibrationOverlay;
