'use client';

import React from 'react';
import { Camera } from 'lucide-react';

interface MovementVisualGuideProps {
  jointId: string;
  sideMode: 'inferred' | 'both';
  cameraDistance: string;
  lockedSide?: 'LEFT' | 'RIGHT' | null;
  movementInstruction?: string;
  coachMode?: boolean;
  className?: string;
  compact?: boolean;
}

const AnimatedReferenceFigure: React.FC<{
  jointId: string;
  lockedSide?: 'LEFT' | 'RIGHT' | null;
}> = ({ jointId, lockedSide }) => {
  const isFrontView = jointId === 'SA001' || jointId === 'NR001';

  return (
    <svg
      viewBox="0 0 360 360"
      className="w-full h-full max-h-[32rem]"
      role="img"
      aria-label={`${jointId} animated movement reference figure`}
      preserveAspectRatio="xMidYMid meet"
    >
      <style>{`
        @keyframes coach-raise-forward {
          0%, 18%, 100% { transform: rotate(0deg); }
          38%, 58% { transform: rotate(-118deg); }
          78% { transform: rotate(0deg); }
        }
        @keyframes coach-abduct-right {
          0%, 18%, 100% { transform: rotate(0deg); }
          38%, 58% { transform: rotate(-118deg); }
          78% { transform: rotate(0deg); }
        }
        @keyframes coach-abduct-left {
          0%, 18%, 100% { transform: rotate(0deg); }
          38%, 58% { transform: rotate(118deg); }
          78% { transform: rotate(0deg); }
        }
        @keyframes coach-elbow-bend {
          0%, 18%, 100% { transform: rotate(0deg); }
          38%, 58% { transform: rotate(132deg); }
          78% { transform: rotate(0deg); }
        }
        @keyframes coach-knee-bend {
          0%, 18%, 100% { transform: rotate(0deg); }
          38%, 58% { transform: rotate(128deg); }
          78% { transform: rotate(0deg); }
        }
        @keyframes coach-hip-lift {
          0%, 18%, 100% { transform: rotate(0deg); }
          38%, 58% { transform: rotate(-82deg); }
          78% { transform: rotate(0deg); }
        }
        @keyframes coach-hip-knee-counterbend {
          0%, 18%, 100% { transform: rotate(0deg); }
          38%, 58% { transform: rotate(74deg); }
          78% { transform: rotate(0deg); }
        }
        @keyframes coach-neck-turn {
          0%, 12%, 100% { transform: translateX(0) rotate(0deg) scaleX(1); }
          22%, 32% { transform: translateX(-9px) rotate(-5deg) scaleX(.58); }
          42%, 52% { transform: translateX(0) rotate(0deg) scaleX(1); }
          64%, 74% { transform: translateX(9px) rotate(5deg) scaleX(.58); }
          84%, 94% { transform: translateX(0) rotate(0deg) scaleX(1); }
        }
        @keyframes coach-joint-pulse {
          0%, 100% { transform: scale(.85); opacity: .95; }
          50% { transform: scale(1.3); opacity: .5; }
        }
        .coach-reference-limb {
          transform-box: view-box;
          animation-duration: 3.6s;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        .coach-reference-flexion { transform-origin: 180px 110px; animation-name: coach-raise-forward; }
        .coach-reference-abduction-right { transform-origin: 215px 110px; animation-name: coach-abduct-right; }
        .coach-reference-abduction-left { transform-origin: 145px 110px; animation-name: coach-abduct-left; }
        .coach-reference-elbow { transform-origin: 195px 148px; animation-name: coach-elbow-bend; }
        .coach-reference-knee { transform-origin: 195px 246px; animation-name: coach-knee-bend; }
        .coach-reference-hip { transform-origin: 190px 184px; animation-name: coach-hip-lift; }
        .coach-reference-hip-knee { transform-origin: 190px 244px; animation-name: coach-hip-knee-counterbend; }
        .coach-reference-head {
          transform-box: view-box;
          transform-origin: 180px 90px;
          animation: coach-neck-turn 4.8s ease-in-out infinite;
        }
        .coach-reference-target {
          transform-box: fill-box;
          transform-origin: center;
          animation: coach-joint-pulse 1.1s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .coach-reference-limb, .coach-reference-head, .coach-reference-target { animation-duration: 10s; }
        }
      `}</style>

      <text x="180" y="28" textAnchor="middle" fill="#cbd5e1" fontSize="12" fontWeight="700" letterSpacing="2">
        START  →  MOVE  →  RETURN
      </text>
      <line x1="54" y1="322" x2="306" y2="322" stroke="#334155" strokeWidth="2" strokeDasharray="5 6" />

      {/* Stable reference body */}
      {jointId !== 'NR001' && (
        <circle cx="180" cy="55" r="21" fill="#1e293b" stroke="#cbd5e1" strokeWidth="5" />
      )}
      {jointId === 'SA001' ? (
        <>
          <line x1="171" y1="53" x2="171" y2="54" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
          <line x1="189" y1="53" x2="189" y2="54" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
          <path d="M 180 56 L 180 65 M 173 70 Q 180 74 187 70" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : jointId !== 'NR001' ? (
        <path d="M 199 52 L 207 56 L 199 61" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinejoin="round" />
      ) : null}
      <path d="M 180 76 L 180 181" stroke="#94a3b8" strokeWidth="9" strokeLinecap="round" />
      <line x1={isFrontView ? 144 : 169} y1="110" x2={isFrontView ? 216 : 191} y2="110" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />

      {/* Arms: only the assessed arm moves for the selected protocol */}
      {jointId === 'SF001' && (
        <>
          <g className="coach-reference-limb coach-reference-flexion">
            <path d="M 180 110 L 191 155 L 195 204" fill="none" stroke="#00b4d8" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="195" cy="204" r="5" fill="#00b4d8" />
          </g>
          <circle className="coach-reference-target" cx="180" cy="110" r="8" fill="#00b4d8" />
        </>
      )}
      {jointId === 'SA001' && (
        <>
          <g className={`coach-reference-limb ${lockedSide === 'LEFT' ? 'coach-reference-abduction-left' : 'coach-reference-abduction-right'}`}>
            <path d={lockedSide === 'LEFT' ? 'M 145 110 L 134 155 L 130 204' : 'M 215 110 L 226 155 L 230 204'} fill="none" stroke="#00b4d8" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={lockedSide === 'LEFT' ? 130 : 230} cy="204" r="5" fill="#00b4d8" />
          </g>
          {lockedSide === 'LEFT' ? (
            <path d="M 215 110 L 226 155 L 230 204" fill="none" stroke="#64748b" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <path d="M 145 110 L 134 155 L 130 204" fill="none" stroke="#64748b" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          )}
          <circle className="coach-reference-target" cx={lockedSide === 'LEFT' ? 145 : 215} cy="110" r="8" fill="#00b4d8" />
        </>
      )}
      {jointId === 'EF001' && (
        <>
          <line x1="180" y1="110" x2="195" y2="148" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
          <g className="coach-reference-limb coach-reference-elbow">
            <path d="M 195 148 L 198 204" fill="none" stroke="#00b4d8" strokeWidth="9" strokeLinecap="round" />
            <circle cx="198" cy="204" r="5" fill="#00b4d8" />
          </g>
          <circle className="coach-reference-target" cx="195" cy="148" r="8" fill="#00b4d8" />
        </>
      )}
      {(jointId === 'KF001' || jointId === 'HF001') && (
        <path d="M 180 110 L 168 151 L 166 203" fill="none" stroke="#64748b" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {jointId === 'NR001' && (
        <>
          <path d="M 144 110 L 128 151 L 124 203" fill="none" stroke="#64748b" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 216 110 L 232 151 L 236 203" fill="none" stroke="#64748b" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}

      {/* Hips and legs: support leg stays still while the target joint moves */}
      <line x1="180" y1="181" x2="160" y2="246" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
      <line x1="160" y1="246" x2="158" y2="312" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
      {jointId === 'KF001' && (
        <>
          <line x1="180" y1="181" x2="195" y2="246" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
          <g className="coach-reference-limb coach-reference-knee">
            <line x1="195" y1="246" x2="199" y2="312" stroke="#00b4d8" strokeWidth="9" strokeLinecap="round" />
            <circle cx="199" cy="312" r="5" fill="#00b4d8" />
          </g>
          <circle className="coach-reference-target" cx="195" cy="246" r="8" fill="#00b4d8" />
        </>
      )}
      {jointId === 'HF001' && (
        <>
          <g className="coach-reference-limb coach-reference-hip">
            <line x1="190" y1="184" x2="190" y2="244" stroke="#00b4d8" strokeWidth="9" strokeLinecap="round" />
            <g className="coach-reference-limb coach-reference-hip-knee">
              <line x1="190" y1="244" x2="194" y2="310" stroke="#00b4d8" strokeWidth="8" strokeLinecap="round" />
              <circle cx="194" cy="310" r="5" fill="#00b4d8" />
            </g>
          </g>
          <circle className="coach-reference-target" cx="190" cy="184" r="8" fill="#00b4d8" />
        </>
      )}
      {jointId !== 'KF001' && jointId !== 'HF001' && (
        <line x1="180" y1="181" x2="195" y2="246" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
      )}
      {jointId !== 'KF001' && jointId !== 'HF001' && (
        <line x1="195" y1="246" x2="199" y2="312" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
      )}

      {/* Neck rotation: the head itself cycles left, center, right, center */}
      {jointId === 'NR001' && (
        <>
          <g className="coach-reference-head">
            <circle cx="180" cy="55" r="21" fill="#1e293b" stroke="#00b4d8" strokeWidth="5" />
            <circle cx="171" cy="53" r="2.5" fill="#00b4d8" />
            <circle cx="189" cy="53" r="2.5" fill="#00b4d8" />
            <path d="M 180 56 L 180 65 M 173 70 Q 180 74 187 70" fill="none" stroke="#00b4d8" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          <circle className="coach-reference-target" cx="180" cy="82" r="8" fill="#00b4d8" />
          <text x="90" y="125" textAnchor="middle" fill="#00b4d8" fontSize="12" fontWeight="700">TURN LEFT</text>
          <text x="270" y="125" textAnchor="middle" fill="#00b4d8" fontSize="12" fontWeight="700">TURN RIGHT</text>
        </>
      )}

      <text x="180" y="346" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="600">
        {jointId === 'SF001' && 'Raise forward and up, then lower'}
        {jointId === 'SA001' && 'Raise out to the side, then lower'}
        {jointId === 'EF001' && 'Bend toward shoulder, then straighten'}
        {jointId === 'KF001' && 'Bend backward, then straighten'}
        {jointId === 'HF001' && 'Lift knee forward, then lower'}
        {jointId === 'NR001' && 'Turn left, center, right, center'}
      </text>
    </svg>
  );
};

export const MovementVisualGuide: React.FC<MovementVisualGuideProps> = ({
  jointId,
  sideMode,
  cameraDistance,
  lockedSide,
  movementInstruction,
  coachMode = false,
  className = '',
  compact = false,
}) => {
  const isSideView = ['SF001', 'EF001', 'KF001', 'HF001'].includes(jointId);

  return (
    <div className={`${coachMode ? 'bg-[#0d0f12]/85 shadow-2xl' : 'bg-[#0d0f12]'} border border-[#1e293b] rounded-2xl overflow-hidden flex flex-col ${className}`}>
      {/* Header Badge */}
      <div className={`${coachMode ? 'bg-[#141820] px-5 py-4' : 'bg-[#141820] px-4 py-2.5'} border-b border-[#1e293b] flex flex-col gap-2 text-xs`}>
        {coachMode ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-[#00b4d8] font-bold uppercase tracking-wider text-sm">
                <Camera className="h-4 w-4" />
                FOLLOW THIS MOVEMENT
              </span>
              <div className="flex items-center gap-2 shrink-0">
                {sideMode === 'inferred' && lockedSide && (
                  <span className="text-[10px] bg-[#1e293b] text-[#cbd5e1] px-2.5 py-1 rounded-full font-bold">
                    {lockedSide} side
                  </span>
                )}
                <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider font-bold">Looping</span>
              </div>
            </div>
            {movementInstruction && (
              <p className="text-xs leading-snug text-white line-clamp-3">{movementInstruction}</p>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#00b4d8] font-bold uppercase tracking-wider text-[11px]">
              <Camera className="h-3.5 w-3.5" />
              {isSideView ? 'Side View (Sagittal)' : 'Front View (Frontal)'}
            </span>
            {sideMode === 'inferred' && (
              <span className="text-[10px] bg-[#1e293b] text-[#94a3b8] px-2.5 py-0.5 rounded-full font-mono">
                {lockedSide ? `${lockedSide} side is being tested` : 'Side shown after calibration'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* START → MOVEMENT pose demonstration */}
      <div className={`relative w-full ${coachMode ? 'aspect-[4/3] min-h-[340px] p-4 sm:p-5' : 'aspect-[4/3] p-3'} flex items-center justify-center bg-gradient-to-b from-[#141820]/50 to-[#0d0f12]/70`}>
        {coachMode ? (
          <AnimatedReferenceFigure jointId={jointId} lockedSide={lockedSide} />
        ) : (
          <>
        {/* Camera Position Marker (Shows where camera is relative to user) */}
        {isSideView ? (
          <div className="absolute left-3 top-3 bg-[#1e293b]/90 text-[10px] text-[#94a3b8] px-2.5 py-1 rounded-lg border border-[#334155] flex items-center gap-1.5 shadow">
            <span>📷 Camera is to your side ({cameraDistance})</span>
          </div>
        ) : (
          <div className="absolute left-3 top-3 bg-[#1e293b]/90 text-[10px] text-[#94a3b8] px-2.5 py-1 rounded-lg border border-[#334155] flex items-center gap-1.5 shadow">
            <span>📷 Camera is directly in front ({cameraDistance})</span>
          </div>
        )}

        {/* 1. SHOULDER FLEXION (SF001 - Side View) */}
        {jointId === 'SF001' && (
          <svg viewBox="0 0 320 230" className="w-full h-full max-h-56" role="img" aria-label="Shoulder flexion: start with the arm down, then raise it forward and up overhead">
            <defs>
              <marker id="arrow-sf" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#00b4d8" />
              </marker>
            </defs>
            <text x="76" y="53" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">START</text>
            <text x="244" y="53" textAnchor="middle" fill="#00b4d8" fontSize="11" fontWeight="bold">MOVEMENT</text>
            <line x1="25" y1="205" x2="295" y2="205" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
            {/* Start pose: arm down at side */}
            <circle cx="76" cy="78" r="11" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
            <path d="M 76,90 L 76,151 M 76,151 L 69,203 M 76,151 L 84,203" fill="none" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
            <line x1="76" y1="105" x2="82" y2="158" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            <circle cx="76" cy="105" r="6" fill="#00b4d8" />
            <circle cx="76" cy="105" r="10" fill="none" stroke="#00b4d8" strokeWidth="1.5" opacity="0.7" />
            <text x="76" y="190" textAnchor="middle" fill="#94a3b8" fontSize="9">Arm down</text>
            {/* Forward and upward path */}
            <path d="M 132,166 Q 146,104 187,72" fill="none" stroke="#00b4d8" strokeWidth="3" strokeDasharray="5 3" markerEnd="url(#arrow-sf)" />
            {/* Movement pose: arm raised forward/up */}
            <circle cx="244" cy="78" r="11" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
            <path d="M 244,90 L 244,151 M 244,151 L 237,203 M 244,151 L 252,203" fill="none" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
            <line x1="244" y1="105" x2="281" y2="64" stroke="#00b4d8" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="244" cy="105" r="6" fill="#00b4d8" />
            <circle cx="244" cy="105" r="10" fill="none" stroke="#00b4d8" strokeWidth="1.5" opacity="0.7" />
            <text x="262" y="190" textAnchor="middle" fill="#00b4d8" fontSize="9">Raise forward/up</text>
          </svg>
        )}

        {/* 2. SHOULDER ABDUCTION (SA001 - Front View) */}
        {jointId === 'SA001' && (
          <svg viewBox="0 0 320 230" className="w-full h-full max-h-56" role="img" aria-label="Shoulder abduction: start with the arm down, then raise it out to the side and up">
            <defs>
              <marker id="arrow-sa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#00b4d8" />
              </marker>
            </defs>
            <text x="76" y="53" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">START</text>
            <text x="244" y="53" textAnchor="middle" fill="#00b4d8" fontSize="11" fontWeight="bold">MOVEMENT</text>
            <line x1="25" y1="205" x2="295" y2="205" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
            {/* Start pose */}
            <circle cx="76" cy="78" r="11" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
            <path d="M 76,90 L 76,151 M 76,151 L 69,203 M 76,151 L 84,203" fill="none" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
            <line x1="64" y1="105" x2="48" y2="157" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
            <line x1="88" y1="105" x2="94" y2="158" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            <circle cx="88" cy="105" r="6" fill="#00b4d8" />
            <circle cx="88" cy="105" r="10" fill="none" stroke="#00b4d8" strokeWidth="1.5" opacity="0.7" />
            <text x="76" y="190" textAnchor="middle" fill="#94a3b8" fontSize="9">Arm down</text>
            {/* Out and up path */}
            <path d="M 135,164 Q 151,111 188,70" fill="none" stroke="#00b4d8" strokeWidth="3" strokeDasharray="5 3" markerEnd="url(#arrow-sa)" />
            {/* Movement pose: arm lifted out to the side */}
            <circle cx="244" cy="78" r="11" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
            <path d="M 244,90 L 244,151 M 244,151 L 237,203 M 244,151 L 252,203" fill="none" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
            <line x1="232" y1="105" x2="216" y2="157" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
            <line x1="256" y1="105" x2="290" y2="67" stroke="#00b4d8" strokeWidth="4.5" strokeLinecap="round" />
            <circle cx="256" cy="105" r="6" fill="#00b4d8" />
            <circle cx="256" cy="105" r="10" fill="none" stroke="#00b4d8" strokeWidth="1.5" opacity="0.7" />
            <text x="262" y="190" textAnchor="middle" fill="#00b4d8" fontSize="9">Raise out/up</text>
          </svg>
        )}

        {/* 3. ELBOW FLEXION (EF001 - Side View) */}
        {jointId === 'EF001' && (
          <svg viewBox="0 0 320 230" className="w-full h-full max-h-56" role="img" aria-label="Elbow flexion: start with the arm straight, then bend the elbow and bring the hand toward the shoulder">
            <defs>
              <marker id="arrow-ef" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#00b4d8" />
              </marker>
            </defs>
            <text x="76" y="53" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">START</text>
            <text x="244" y="53" textAnchor="middle" fill="#00b4d8" fontSize="11" fontWeight="bold">MOVEMENT</text>
            <line x1="25" y1="205" x2="295" y2="205" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
            {/* Start pose: straight arm */}
            <circle cx="76" cy="78" r="11" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
            <path d="M 76,90 L 76,151 M 76,151 L 69,203 M 76,151 L 84,203" fill="none" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
            <line x1="86" y1="107" x2="96" y2="139" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            <line x1="96" y1="139" x2="99" y2="177" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            <circle cx="96" cy="139" r="6" fill="#00b4d8" />
            <circle cx="96" cy="139" r="10" fill="none" stroke="#00b4d8" strokeWidth="1.5" opacity="0.7" />
            <text x="76" y="195" textAnchor="middle" fill="#94a3b8" fontSize="9">Arm straight</text>
            {/* Progression arrow */}
            <path d="M 138,145 Q 157,116 183,108" fill="none" stroke="#00b4d8" strokeWidth="3" strokeDasharray="5 3" markerEnd="url(#arrow-ef)" />
            {/* Movement pose: bend forearm toward shoulder */}
            <circle cx="244" cy="78" r="11" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
            <path d="M 244,90 L 244,151 M 244,151 L 237,203 M 244,151 L 252,203" fill="none" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
            <line x1="254" y1="107" x2="264" y2="139" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            <line x1="264" y1="139" x2="247" y2="111" stroke="#00b4d8" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 274,153 Q 281,128 262,115" fill="none" stroke="#00b4d8" strokeWidth="2.5" markerEnd="url(#arrow-ef)" />
            <circle cx="264" cy="139" r="6" fill="#00b4d8" />
            <circle cx="264" cy="139" r="10" fill="none" stroke="#00b4d8" strokeWidth="1.5" opacity="0.7" />
            <text x="258" y="195" textAnchor="middle" fill="#00b4d8" fontSize="9">Hand to shoulder</text>
          </svg>
        )}

        {/* 4. KNEE FLEXION (KF001 - Side View) */}
        {jointId === 'KF001' && (
          <svg viewBox="0 0 320 230" className="w-full h-full max-h-56" role="img" aria-label="Knee flexion: start with the leg straight, then bend the knee backward">
            <defs>
              <marker id="arrow-kf" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#00b4d8" />
              </marker>
            </defs>
            <text x="76" y="53" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">START</text>
            <text x="244" y="53" textAnchor="middle" fill="#00b4d8" fontSize="11" fontWeight="bold">MOVEMENT</text>
            <line x1="25" y1="205" x2="295" y2="205" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
            {/* Start pose: straight leg with other leg supporting */}
            <circle cx="76" cy="78" r="11" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
            <path d="M 76,90 L 76,137 M 76,137 L 68,203" fill="none" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
            <line x1="70" y1="137" x2="82" y2="160" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            <line x1="82" y1="160" x2="84" y2="203" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            <circle cx="82" cy="160" r="6" fill="#00b4d8" />
            <circle cx="82" cy="160" r="10" fill="none" stroke="#00b4d8" strokeWidth="1.5" opacity="0.7" />
            <text x="76" y="195" textAnchor="middle" fill="#94a3b8" fontSize="9">Leg straight</text>
            {/* Progression arrow */}
            <path d="M 137,151 Q 158,125 185,135" fill="none" stroke="#00b4d8" strokeWidth="3" strokeDasharray="5 3" markerEnd="url(#arrow-kf)" />
            {/* Movement pose: lower leg bends backward */}
            <circle cx="244" cy="78" r="11" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
            <path d="M 244,90 L 244,137 M 244,137 L 236,203" fill="none" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
            <line x1="238" y1="137" x2="250" y2="160" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            <line x1="250" y1="160" x2="219" y2="139" stroke="#00b4d8" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 246,190 Q 218,180 217,151" fill="none" stroke="#00b4d8" strokeWidth="2.5" markerEnd="url(#arrow-kf)" />
            <circle cx="250" cy="160" r="6" fill="#00b4d8" />
            <circle cx="250" cy="160" r="10" fill="none" stroke="#00b4d8" strokeWidth="1.5" opacity="0.7" />
            <text x="258" y="195" textAnchor="middle" fill="#00b4d8" fontSize="9">Bend backward</text>
          </svg>
        )}

        {/* 5. HIP FLEXION (HF001 - Side View) */}
        {jointId === 'HF001' && (
          <svg viewBox="0 0 320 230" className="w-full h-full max-h-56" role="img" aria-label="Hip flexion: start with the leg down, then raise the knee and thigh forward">
            <defs>
              <marker id="arrow-hf" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#00b4d8" />
              </marker>
            </defs>
            <text x="76" y="53" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">START</text>
            <text x="244" y="53" textAnchor="middle" fill="#00b4d8" fontSize="11" fontWeight="bold">MOVEMENT</text>
            <line x1="25" y1="205" x2="295" y2="205" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
            {/* Start pose: leg down */}
            <circle cx="76" cy="78" r="11" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
            <path d="M 76,90 L 76,137 M 76,137 L 68,203" fill="none" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
            <line x1="70" y1="137" x2="83" y2="203" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
            <circle cx="70" cy="137" r="6" fill="#00b4d8" />
            <circle cx="70" cy="137" r="10" fill="none" stroke="#00b4d8" strokeWidth="1.5" opacity="0.7" />
            <text x="76" y="195" textAnchor="middle" fill="#94a3b8" fontSize="9">Leg down</text>
            {/* Forward and upward path */}
            <path d="M 135,182 Q 155,124 189,120" fill="none" stroke="#00b4d8" strokeWidth="3" strokeDasharray="5 3" markerEnd="url(#arrow-hf)" />
            {/* Movement pose: thigh forward and knee raised */}
            <circle cx="244" cy="78" r="11" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
            <path d="M 244,90 L 244,137 M 244,137 L 236,203" fill="none" stroke="#475569" strokeWidth="5" strokeLinecap="round" />
            <line x1="238" y1="137" x2="283" y2="124" stroke="#00b4d8" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="283" y1="124" x2="286" y2="169" stroke="#00b4d8" strokeWidth="4" strokeLinecap="round" />
            <circle cx="244" cy="137" r="6" fill="#00b4d8" />
            <circle cx="244" cy="137" r="10" fill="none" stroke="#00b4d8" strokeWidth="1.5" opacity="0.7" />
            <text x="263" y="195" textAnchor="middle" fill="#00b4d8" fontSize="9">Raise knee forward</text>
          </svg>
        )}

        {/* 6. NECK ROTATION (NR001 - Front View) */}
        {jointId === 'NR001' && (
          <svg viewBox="0 0 320 230" className="w-full h-full max-h-56" role="img" aria-label="Neck rotation: start facing forward, then turn the head left or right while keeping shoulders still">
            <defs>
              <marker id="arrow-nr-r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#00b4d8" />
              </marker>
              <marker id="arrow-nr-l" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#00b4d8" />
              </marker>
            </defs>
            <text x="76" y="53" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">START</text>
            <text x="244" y="53" textAnchor="middle" fill="#00b4d8" fontSize="11" fontWeight="bold">MOVEMENT</text>
            {/* Start pose: head facing forward */}
            <line x1="43" y1="159" x2="109" y2="159" stroke="#475569" strokeWidth="7" strokeLinecap="round" />
            <path d="M 76,158 L 76,139 L 70,129 M 76,139 L 82,129" fill="none" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
            <circle cx="76" cy="105" r="22" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
            <circle cx="69" cy="100" r="2" fill="#94a3b8" />
            <circle cx="83" cy="100" r="2" fill="#94a3b8" />
            <path d="M 76,102 L 76,113 M 69,120 Q 76,124 83,120" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
            <circle cx="76" cy="137" r="6" fill="#00b4d8" />
            <circle cx="76" cy="137" r="10" fill="none" stroke="#00b4d8" strokeWidth="1.5" opacity="0.7" />
            <text x="76" y="195" textAnchor="middle" fill="#94a3b8" fontSize="9">Facing forward</text>
            {/* Turn path branches toward either side */}
            <path d="M 126,126 Q 151,91 182,111" fill="none" stroke="#00b4d8" strokeWidth="2.5" strokeDasharray="5 3" markerEnd="url(#arrow-nr-l)" />
            <path d="M 128,145 Q 156,169 183,149" fill="none" stroke="#00b4d8" strokeWidth="2.5" strokeDasharray="5 3" markerEnd="url(#arrow-nr-r)" />
            {/* Movement pose: two turned head directions, shoulders stay still */}
            <line x1="204" y1="159" x2="284" y2="159" stroke="#475569" strokeWidth="7" strokeLinecap="round" />
            <path d="M 244,158 L 244,139 L 238,129 M 244,139 L 250,129" fill="none" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
            <circle cx="223" cy="103" r="17" fill="#1e293b" stroke="#00b4d8" strokeWidth="2" />
            <path d="M 207,101 L 201,106 L 207,110" fill="none" stroke="#00b4d8" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="218" cy="99" r="2" fill="#00b4d8" />
            <circle cx="265" cy="103" r="17" fill="#1e293b" stroke="#00b4d8" strokeWidth="2" />
            <path d="M 281,101 L 287,106 L 281,110" fill="none" stroke="#00b4d8" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="270" cy="99" r="2" fill="#00b4d8" />
            <circle cx="244" cy="137" r="6" fill="#00b4d8" />
            <circle cx="244" cy="137" r="10" fill="none" stroke="#00b4d8" strokeWidth="1.5" opacity="0.7" />
            <text x="223" y="132" textAnchor="middle" fill="#00b4d8" fontSize="8">Turn left</text>
            <text x="265" y="132" textAnchor="middle" fill="#00b4d8" fontSize="8">Turn right</text>
            <text x="244" y="195" textAnchor="middle" fill="#94a3b8" fontSize="9">Keep shoulders still</text>
          </svg>
        )}
          </>
        )}
      </div>

      {/* Quick Step Indicators */}
      {!compact && (
        <div className="bg-[#141820] border-t border-[#1e293b] p-3 grid grid-cols-2 gap-2 text-[11px]">
          <div className="bg-[#0d0f12] p-2 rounded-lg border border-[#1e293b]">
            <span className="text-[#94a3b8] block text-[9px] uppercase font-bold tracking-wider">Starting Posture</span>
            <span className="text-white font-medium">
              {jointId === 'SF001' && 'Arm straight down at side'}
              {jointId === 'SA001' && 'Arm resting beside body'}
              {jointId === 'EF001' && 'Arm straight, palm forward'}
              {jointId === 'KF001' && 'Standing straight on both legs'}
              {jointId === 'HF001' && 'Standing straight and upright'}
              {jointId === 'NR001' && 'Head level, looking forward'}
            </span>
          </div>
          <div className="bg-[#0d0f12] p-2 rounded-lg border border-[#1e293b]">
            <span className="text-[#00b4d8] block text-[9px] uppercase font-bold tracking-wider">Required Movement</span>
            <span className="text-white font-medium">
              {jointId === 'SF001' && 'Raise arm forward overhead'}
              {jointId === 'SA001' && 'Raise arm sideways overhead'}
              {jointId === 'EF001' && 'Bend hand up to shoulder'}
              {jointId === 'KF001' && 'Bend knee backward and up'}
              {jointId === 'HF001' && 'Lift knee up toward chest'}
              {jointId === 'NR001' && 'Rotate chin left & right'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovementVisualGuide;
