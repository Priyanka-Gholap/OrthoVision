'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { CalibrationOverlay } from '../../../../components/patient/CalibrationOverlay';
import { getPoseLandmarker, destroyPoseLandmarker } from '../../../../services/poseDetection';
import { PoseLandmarker } from '@mediapipe/tasks-vision';
import { calculateJointAngle, getRequiredLandmarksForFrame, EMAFilter, PoseLandmark } from '../../../../utils/kinematics';
import { Camera, ShieldAlert, ArrowLeft, Loader2, RotateCw, RefreshCw, Cpu } from 'lucide-react';

interface JointDetail {
  id: string;
  name: string;
  view: 'Side View' | 'Front View';
  purpose: string;
  normalRange: string;
  instructions: string[];
  refMinNormal: number;
  refMaxNormal: number;
}

const JOINT_DETAILS: Record<string, JointDetail> = {
  SF001: {
    id: 'SF001',
    name: 'Shoulder Flexion',
    view: 'Side View',
    purpose: 'Measure the patient\'s ability to raise the arm forward.',
    normalRange: '160° – 180°',
    instructions: [
      'Stand straight, sideways to the camera.',
      'Keep your elbow extended.',
      'Slowly raise your arm in front of your body.',
      'Raise as high as comfortably possible.',
      'Hold the final position for 2 seconds.',
    ],
    refMinNormal: 160,
    refMaxNormal: 180,
  },
  SA001: {
    id: 'SA001',
    name: 'Shoulder Abduction',
    view: 'Front View',
    purpose: 'Measure side arm elevation.',
    normalRange: '160° – 180°',
    instructions: [
      'Stand straight, facing the camera.',
      'Raise your arm sideways until comfortable.',
      'Hold the final position for 2 seconds.',
    ],
    refMinNormal: 160,
    refMaxNormal: 180,
  },
  EF001: {
    id: 'EF001',
    name: 'Elbow Flexion',
    view: 'Side View',
    purpose: 'Measure elbow bending.',
    normalRange: '145° – 150°',
    instructions: [
      'Stand sideways to the camera.',
      'Bend your elbow completely.',
      'Hold the final position for 2 seconds.',
    ],
    refMinNormal: 145,
    refMaxNormal: 150,
  },
  KF001: {
    id: 'KF001',
    name: 'Knee Flexion',
    view: 'Side View',
    purpose: 'Measure knee bending.',
    normalRange: '130° – 135°',
    instructions: [
      'Stand sideways to the camera.',
      'Bend your knee as much as possible.',
      'Hold the final position for 2 seconds.',
    ],
    refMinNormal: 130,
    refMaxNormal: 135,
  },
  HF001: {
    id: 'HF001',
    name: 'Hip Flexion',
    view: 'Side View',
    purpose: 'Measure hip mobility.',
    normalRange: '110° – 120°',
    instructions: [
      'Stand sideways to the camera.',
      'Lift one knee towards your chest.',
      'Hold the final position for 2 seconds.',
    ],
    refMinNormal: 110,
    refMaxNormal: 120,
  },
  NR001: {
    id: 'NR001',
    name: 'Neck Rotation',
    view: 'Front View',
    purpose: 'Measure neck mobility.',
    normalRange: '70° – 80°',
    instructions: [
      'Stand facing the camera.',
      'Rotate your head to the left and then to the right.',
      'Hold the peak rotation position for 2 seconds.',
    ],
    refMinNormal: 70,
    refMaxNormal: 80,
  },
};

type AssessState = 
  | 'INSTRUCTIONS' 
  | 'CAMERA_REQUEST' 
  | 'CAMERA_READY' 
  | 'AI_INITIALIZING' 
  | 'AI_INITIALIZATION_ERROR'
  | 'POSE_DETECTION' 
  | 'CALIBRATION' 
  | 'READY'
  | 'DEV_TEST_REVIEW';

const POSE_CONNECTIONS: [number, number][] = [
  [11, 12], // Shoulders
  [11, 13], [13, 15], // Left Arm
  [12, 14], [14, 16], // Right Arm
  [11, 23], [12, 24], // Torso sides
  [23, 24], // Pelvis
  [23, 25], [25, 27], // Left Leg
  [24, 26], [26, 28]  // Right Leg
];

function AssessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jointId = searchParams.get('joint') || '';
  
  const jointInfo = JOINT_DETAILS[jointId];
  const { user } = useAuth();
  
  const [currentState, setCurrentState] = useState<AssessState>('INSTRUCTIONS');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [aiErrorMsg, setAiErrorMsg] = useState<string | null>(null);
  
  // Locked Side Selection
  const [lockedSide, setLockedSide] = useState<'LEFT' | 'RIGHT' | null>(null);

  // Occupancy errors
  const [noPersonDetected, setNoPersonDetected] = useState<boolean>(false);
  const [multiplePeopleDetected, setMultiplePeopleDetected] = useState<boolean>(false);
  const [lowConfidenceWarning, setLowConfidenceWarning] = useState<boolean>(false);

  // Dev Test States only
  const [devTestRom, setDevTestRom] = useState<number>(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const angleDisplayRef = useRef<HTMLSpanElement>(null);
  
  // Filters and side detection refs
  const emaFilterRef = useRef<EMAFilter>(new EMAFilter(0.25));
  const lockedSideRef = useRef<'LEFT' | 'RIGHT' | null>(null);
  const lowConfidenceStartRef = useRef<number | null>(null);
  const calibrationStartRef = useRef<number | null>(null);

  // Visibility accumulator for locked presenting-side selection
  const accumLeftVisRef = useRef<number>(0);
  const accumRightVisRef = useRef<number>(0);
  const accumFramesRef = useRef<number>(0);

  // Validate URL Parameter
  useEffect(() => {
    if (!jointId || !jointInfo) {
      router.push('/patient');
    }
  }, [jointId, jointInfo, router]);

  // Cleanup loop and cameras on unmount
  useEffect(() => {
    return () => {
      stopPosePipeline();
      destroyPoseLandmarker();
    };
  }, []);

  const stopPosePipeline = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    // Reset calculators
    lowConfidenceStartRef.current = null;
    calibrationStartRef.current = null;
    lockedSideRef.current = null;
    setLockedSide(null);
    emaFilterRef.current.reset();
    accumLeftVisRef.current = 0;
    accumRightVisRef.current = 0;
    accumFramesRef.current = 0;
  };

  if (!jointInfo) {
    return (
      <div className="flex-grow bg-[#0d0f12] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00b4d8]" />
      </div>
    );
  }

  // Step 1: Request camera permission
  const handleRequestCamera = async () => {
    setCurrentState('CAMERA_REQUEST');
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
      });
      setStream(mediaStream);
      setCurrentState('CAMERA_READY');
      
      // Bind webcam to video stream and initialize AI loader
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          handleInitializeAI();
        }
      }, 100);
    } catch (err: any) {
      console.error('[ERROR] Camera access failed:', err);
      setCameraError('Webcam access was denied or is unavailable. Please check your browser permission settings.');
      setCurrentState('INSTRUCTIONS');
    }
  };

  // Step 2: Initialize WebAssembly PoseLandmarker with fallbacks
  const handleInitializeAI = async () => {
    setCurrentState('AI_INITIALIZING');
    setAiErrorMsg(null);
    try {
      const landmarker = await getPoseLandmarker();
      landmarkerRef.current = landmarker;
      setCurrentState('POSE_DETECTION');
      
      // Start the requestAnimationFrame frame tracking loop
      startPoseTrackingLoop();
    } catch (err: any) {
      console.error('[ERROR] AI initialization failed:', err);
      setAiErrorMsg('Failed to download MediaPipe WASM libraries or task models. Verify your internet connection.');
      setCurrentState('AI_INITIALIZATION_ERROR');
    }
  };

  // Step 3: Run recursive frame loop
  const startPoseTrackingLoop = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const processFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const landmarker = landmarkerRef.current;

      if (!video || !canvas || !landmarker || video.readyState < 2) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
        return;
      }

      // Configure canvas matching video dimensions
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Perform local WebAssembly pose estimation
        const timestamp = performance.now();
        const results = landmarker.detectForVideo(video, timestamp);

        let formattedAngle = '--';

        if (results && results.landmarks && results.landmarks.length > 0) {
          // Occupancy Check
          const posesCount = results.landmarks.length;
          if (posesCount > 1) {
            setMultiplePeopleDetected(true);
            setNoPersonDetected(false);
          } else {
            setMultiplePeopleDetected(false);
            setNoPersonDetected(false);
          }

          const landmarks = results.landmarks[0] as PoseLandmark[]; // Single-person configuration (numPoses = 1)
          
          // Side presentation checks helper
          const leftShoulder = landmarks[11];
          const rightShoulder = landmarks[12];
          
          // Determine landmarks required depending on presentation side (fallback to LEFT before lock)
          const activeSide = lockedSideRef.current || (leftShoulder?.visibility > rightShoulder?.visibility ? 'LEFT' : 'RIGHT');
          const requiredLandmarks = getRequiredLandmarksForFrame(jointInfo.id, landmarks);

          // Check required joints confidence
          const hasLowConfidenceJoints = requiredLandmarks.some((id) => {
            const node = landmarks[id];
            return !node || node.visibility < 0.5;
          });

          // Elapsed time warnings logic (performance.now() continuous 5 seconds checks)
          const now = performance.now();
          if (hasLowConfidenceJoints) {
            if (lowConfidenceStartRef.current === null) {
              lowConfidenceStartRef.current = now;
            } else if (now - lowConfidenceStartRef.current > 5000) {
              setLowConfidenceWarning(true);
            }
            // Reset calibration timer if confidence is lost
            calibrationStartRef.current = null;
            
            // Retain POSE_DETECTION state until visible
            if (currentState !== 'CAMERA_READY') {
              setCurrentState('POSE_DETECTION');
            }
          } else {
            // Confidence restored: reset warning timer
            lowConfidenceStartRef.current = null;
            setLowConfidenceWarning(false);

            // Accumulate visibilities to lock side during calibration state
            if (currentState === 'POSE_DETECTION') {
              setCurrentState('CALIBRATION');
              calibrationStartRef.current = now;
              
              accumLeftVisRef.current = 0;
              accumRightVisRef.current = 0;
              accumFramesRef.current = 0;
            } else if (currentState === 'CALIBRATION') {
              // Accumulate frame metrics
              const lVis = (landmarks[11]?.visibility || 0) + (landmarks[13]?.visibility || 0) + (landmarks[15]?.visibility || 0) + (landmarks[23]?.visibility || 0) + (landmarks[25]?.visibility || 0) + (landmarks[27]?.visibility || 0);
              const rVis = (landmarks[12]?.visibility || 0) + (landmarks[14]?.visibility || 0) + (landmarks[16]?.visibility || 0) + (landmarks[24]?.visibility || 0) + (landmarks[26]?.visibility || 0) + (landmarks[28]?.visibility || 0);
              accumLeftVisRef.current += lVis;
              accumRightVisRef.current += rVis;
              accumFramesRef.current += 1;

              if (calibrationStartRef.current !== null && now - calibrationStartRef.current > 2000) {
                // Lock presenting side
                const meanL = accumLeftVisRef.current / (6 * accumFramesRef.current);
                const meanR = accumRightVisRef.current / (6 * accumFramesRef.current);
                const locked = meanL > meanR ? 'LEFT' : 'RIGHT';
                
                lockedSideRef.current = locked;
                setLockedSide(locked);
                console.log(`[Kinematics] Presenting side locked to: ${locked} (L: ${meanL.toFixed(2)} vs R: ${meanR.toFixed(2)})`);

                setCurrentState('READY');
              }
            }
          }

          // Calculate joint angle if visibility is valid
          if (!hasLowConfidenceJoints) {
            const angleRes = calculateJointAngle(jointInfo.id, landmarks, lockedSideRef.current);
            if (angleRes.isValid && angleRes.angle !== null) {
              // Smooth coordinates via EMA Filter
              const smoothed = emaFilterRef.current.filter(angleRes.angle);
              if (smoothed !== null) {
                if (jointInfo.id === 'NR001' && angleRes.direction) {
                  formattedAngle = `${Math.round(smoothed)}° (${angleRes.direction})`;
                } else {
                  formattedAngle = `${Math.round(smoothed)}°`;
                }
              }
            }
          }

          // Render skeleton connections with visibility de-emphasis
          POSE_CONNECTIONS.forEach(([iA, iB]) => {
            const ptA = landmarks[iA];
            const ptB = landmarks[iB];

            if (ptA && ptB) {
              ctx.beginPath();
              ctx.moveTo(ptA.x * canvas.width, ptA.y * canvas.height);
              ctx.lineTo(ptB.x * canvas.width, ptB.y * canvas.height);

              if (ptA.visibility >= 0.5 && ptB.visibility >= 0.5) {
                // High confidence connection: draw solid white
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3;
                ctx.setLineDash([]);
              } else {
                // Low confidence connection: de-emphasize
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = 1;
                ctx.setLineDash([4, 4]);
              }
              ctx.stroke();
            }
          });

          // Draw landmark dots
          landmarks.forEach((lm, idx) => {
            // Only draw standard skeleton points (exclude fingers/toes to keep drawing clean)
            if (idx > 10 && idx < 29) {
              ctx.beginPath();
              ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 5, 0, 2 * Math.PI);

              if (lm.visibility >= 0.5) {
                ctx.fillStyle = '#00b4d8';
                ctx.fill();
              } else {
                // De-emphasize low confidence landmark
                ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
                ctx.setLineDash([2, 2]);
                ctx.stroke();
              }
            }
          });

        } else {
          // No person detected at all
          setNoPersonDetected(true);
          setMultiplePeopleDetected(false);
          // Reset filters
          lowConfidenceStartRef.current = null;
          calibrationStartRef.current = null;
          emaFilterRef.current.reset();
          if (currentState !== 'POSE_DETECTION' && currentState !== 'CAMERA_READY') {
            setCurrentState('POSE_DETECTION');
          }
        }

        // High-performance DOM insertion bypassing React render loops
        if (angleDisplayRef.current) {
          angleDisplayRef.current.innerText = formattedAngle;
        }
      }

      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    animationFrameRef.current = requestAnimationFrame(processFrame);
  };

  // Run development simulation ONLY (Does NOT save records to database)
  const handleTriggerDevTest = () => {
    const rangeDiff = jointInfo.refMaxNormal - jointInfo.refMinNormal;
    const mockPeak = Math.round(jointInfo.refMinNormal - 15 + Math.random() * (rangeDiff + 20));
    setDevTestRom(mockPeak);
    setCurrentState('DEV_TEST_REVIEW');
    stopPosePipeline();
  };

  return (
    <div className="flex-grow bg-[#0d0f12] text-white flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        
        {/* Upper Navigation Header */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => {
              stopPosePipeline();
              router.push('/patient');
            }}
            className="inline-flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Cancel and Return</span>
          </button>
          <span className="text-[11px] bg-[#1e293b] text-[#94a3b8] px-3 py-1 rounded-full font-mono uppercase">
            Protocol: {jointInfo.id} ({jointInfo.view})
          </span>
        </div>

        {/* Browser Permission/Camera Error Card */}
        {cameraError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-4 rounded-xl flex gap-3 items-start">
            <ShieldAlert className="h-5 w-5 text-[#ef4444] shrink-0" />
            <div>
              <p className="font-semibold">Webcam Access Denied</p>
              <p className="mt-0.5 leading-relaxed">{cameraError}</p>
            </div>
          </div>
        )}

        {/* MediaPipe CDN Error Card with Retry */}
        {currentState === 'AI_INITIALIZATION_ERROR' && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-6 rounded-xl flex flex-col gap-4">
            <div className="flex gap-3 items-start">
              <ShieldAlert className="h-5 w-5 text-[#ef4444] shrink-0" />
              <div>
                <p className="font-semibold">MediaPipe Initialization Failure</p>
                <p className="mt-0.5 leading-relaxed">{aiErrorMsg}</p>
              </div>
            </div>
            <button
              onClick={handleInitializeAI}
              className="inline-flex items-center gap-1.5 bg-[#ef4444] hover:bg-[#dc2626] text-white text-xs font-semibold px-4 py-2 rounded-lg w-fit transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry Loading AI System</span>
            </button>
          </div>
        )}

        {/* 1. STATE: INSTRUCTIONS */}
        {currentState === 'INSTRUCTIONS' && (
          <div className="grid md:grid-cols-5 gap-8 bg-[#141820] border border-[#1e293b] p-8 rounded-3xl">
            <div className="md:col-span-3 flex flex-col gap-6">
              <div>
                <span className="text-[10px] text-[#00b4d8] font-bold tracking-wider uppercase">Instructions Guide</span>
                <h2 className="text-xl md:text-2xl font-bold text-white mt-1">{jointInfo.name} screening</h2>
                <p className="text-xs text-[#94a3b8] mt-2 leading-relaxed">{jointInfo.purpose}</p>
              </div>
              
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Required Steps:</h4>
                <ol className="list-decimal pl-5 text-xs text-[#94a3b8] flex flex-col gap-2.5 leading-relaxed">
                  {jointInfo.instructions.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>

              {jointInfo.id === 'NR001' && (
                <div className="bg-[#1e293b]/50 border border-[#334155] p-4 rounded-xl text-xs text-yellow-500 leading-relaxed">
                  <span className="font-bold block mb-1">⚠️ Medical Disclaimer</span>
                  This neck rotation measurement is a 2D planar angular-deviation proxy and not a direct 3D goniometric cervical rotation measurement.
                </div>
              )}

              <button
                onClick={handleRequestCamera}
                className="inline-flex items-center justify-center gap-2 bg-[#00b4d8] hover:bg-[#0077b6] text-white py-3.5 px-6 rounded-xl text-xs font-bold transition-all w-fit mt-4"
              >
                <Camera className="h-4 w-4" />
                <span>Initialize Webcam Preview</span>
              </button>
            </div>

            <div className="md:col-span-2 bg-[#0d0f12] border border-[#1e293b] p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Required Position</h4>
                <div className="bg-[#141820] p-4 rounded-xl text-center border border-[#1e293b] mb-4">
                  <span className="text-sm font-bold text-[#00b4d8]">{jointInfo.view}</span>
                </div>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  Position your camera so your full body is visible. Stand approximately <strong>2 to 3 meters</strong> away from the lens. Ensure the room has bright lighting and a plain background.
                </p>
              </div>
              <div className="text-[10px] text-[#94a3b8] bg-[#141820] p-3 rounded-lg border border-[#1e293b] mt-6">
                <span>Normal ROM threshold: <strong>{jointInfo.normalRange}</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* 2. STATE: CAMERA_REQUEST (Webcam initial setup) */}
        {currentState === 'CAMERA_REQUEST' && (
          <div className="bg-[#141820] border border-[#1e293b] rounded-3xl p-16 flex flex-col items-center justify-center text-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#00b4d8]" />
            <h3 className="font-bold text-lg">Requesting Camera Permissions</h3>
            <p className="text-xs text-[#94a3b8] max-w-sm">Please allow webcam access in the browser permissions dialogue to activate the live feed preview.</p>
          </div>
        )}

        {/* 3. ACTIVE FEED TRACKING CONTROLS (CAMERA_READY, AI_INITIALIZING, POSE_DETECTION, CALIBRATION, READY) */}
        {['CAMERA_READY', 'AI_INITIALIZING', 'AI_INITIALIZATION_ERROR', 'POSE_DETECTION', 'CALIBRATION', 'READY'].includes(currentState) && (
          <div className="flex flex-col gap-6">
            
            {/* Live Camera View with Canvas Skeleton Overlay */}
            <div className="relative aspect-video w-full bg-black rounded-3xl overflow-hidden border border-[#1e293b]">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" 
              />
              <canvas 
                ref={canvasRef} 
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" 
              />
              
              {/* Placement Calibration Overlay (Shows guidelines) */}
              <CalibrationOverlay joint={jointInfo.id} />
              
              {/* Loading overlay during AI initialization */}
              {currentState === 'AI_INITIALIZING' && (
                <div className="absolute inset-0 bg-[#0d0f12]/90 flex flex-col items-center justify-center text-center gap-4 z-20">
                  <Loader2 className="h-10 w-10 animate-spin text-[#9d4edd]" />
                  <h3 className="font-bold text-base text-white">Initializing Browser-Side AI Model</h3>
                  <p className="text-xs text-[#94a3b8] max-w-sm px-4">Downloading WebAssembly compiler components and loading Pose Landmarker module locally (v0.10.14)...</p>
                </div>
              )}

              {/* Multiple people alert overlay */}
              {multiplePeopleDetected && (
                <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center text-center gap-2.5 p-6 z-20">
                  <ShieldAlert className="h-10 w-10 text-red-500" />
                  <h4 className="font-bold text-sm text-white">Multiple People Detected</h4>
                  <p className="text-xs text-[#94a3b8] max-w-xs leading-relaxed">Ensure only one person is visible in front of the camera to calibrate correctly.</p>
                </div>
              )}

              {/* No person alert overlay */}
              {noPersonDetected && !['CAMERA_READY', 'AI_INITIALIZING', 'AI_INITIALIZATION_ERROR'].includes(currentState) && (
                <div className="absolute top-4 right-4 bg-red-500/90 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 z-10">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Positioning: No person detected</span>
                </div>
              )}

              {/* Low visibility/obscured joints warning overlay */}
              {lowConfidenceWarning && !noPersonDetected && !multiplePeopleDetected && (
                <div className="absolute bottom-16 left-4 right-4 bg-yellow-500 border border-yellow-600 text-black p-4 rounded-xl flex gap-3 items-start shadow-lg z-10">
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold">Required joints obscured</p>
                    <p className="mt-0.5 font-medium">Please adjust your position so your required body joints are clearly visible.</p>
                  </div>
                </div>
              )}

              {/* State-specific instruction overlays */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/85 backdrop-blur-sm border border-[#1e293b] px-4 py-3.5 rounded-xl flex items-center justify-between text-xs z-10">
                
                {(currentState === 'CAMERA_READY' || currentState === 'AI_INITIALIZING') && (
                  <span className="text-[#94a3b8] flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#00b4d8]" />
                    Setting up AI tracking pipeline...
                  </span>
                )}

                {currentState === 'POSE_DETECTION' && (
                  <span className="text-yellow-500 font-semibold flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse" />
                    Searching for skeleton keypoints. Stand 2-3 meters away.
                  </span>
                )}

                {currentState === 'CALIBRATION' && (
                  <span className="text-[#00b4d8] font-semibold flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00b4d8] animate-ping" />
                    Keypoints locked. Calibrating presenting side...
                  </span>
                )}

                {currentState === 'READY' && (
                  <span className="text-[#10b981] font-semibold flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                    AI Calibrated & Side Locked ({lockedSide})!
                  </span>
                )}

                {/* Development test simulation ONLY (Ensures NO database write is performed) */}
                {currentState === 'READY' && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleTriggerDevTest}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                    >
                      Dev Test Simulation
                    </button>
                  </div>
                )}

              </div>
            </div>

            {/* Live Kinematics Angle Display Container */}
            {['POSE_DETECTION', 'CALIBRATION', 'READY'].includes(currentState) && (
              <div className="grid grid-cols-2 gap-4 bg-[#141820] border border-[#1e293b] p-6 rounded-2xl">
                <div>
                  <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider">Joint Tested</span>
                  <p className="text-base font-bold text-white mt-1">{jointInfo.name}</p>
                </div>
                <div className="text-right border-l border-[#1e293b] pl-4">
                  <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider">Live Joint Angle</span>
                  <p className="mt-1">
                    <span ref={angleDisplayRef} className="text-2xl font-black text-[#00b4d8]">--</span>
                  </p>
                </div>
              </div>
            )}

            {/* Development-only Warning Indicator details */}
            {currentState === 'READY' && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-xs p-4 rounded-xl flex flex-col gap-2">
                <span className="font-bold flex items-center gap-1">
                  <Cpu className="h-4 w-4" />
                  DEVELOPMENT PORTAL SIMULATION (Test Only)
                </span>
                <p className="leading-relaxed text-[#94a3b8]">
                  Clicking the button above will stop camera feeds and display a simulated review view for interface validation.
                  <strong> Note: Saving is disabled. No clinical assessment records can be saved in MongoDB during this milestone.</strong>
                </p>
              </div>
            )}

          </div>
        )}

        {/* 5. STATE: DEV_TEST_REVIEW (Simulated page view for UI review) */}
        {currentState === 'DEV_TEST_REVIEW' && (
          <div className="bg-[#141820] border border-[#1e293b] p-8 rounded-3xl flex flex-col gap-6">
            
            <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-xs p-4 rounded-xl">
              <p className="font-bold">⚠️ Local Simulation Mode Only</p>
              <p className="mt-1 leading-relaxed text-[#94a3b8]">This is a local interface review page. No clinical records have been, or will be, saved to the database.</p>
            </div>

            <div>
              <span className="text-[10px] text-yellow-500 font-bold tracking-wider uppercase">Local Review Only</span>
              <h2 className="text-xl md:text-2xl font-bold text-white mt-1">Review ROM Simulation Results</h2>
              {jointInfo.id === 'NR001' && (
                <p className="text-xs text-yellow-500 leading-relaxed mt-1.5 font-medium">
                  <strong>Disclaimer</strong>: This neck rotation measurement is a 2D planar angular-deviation proxy and not a direct 3D goniometric cervical rotation measurement.
                </p>
              )}
              <p className="text-xs text-[#94a3b8] mt-1.5">Local calculation framework test (Mock Angle: {devTestRom}°)</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 bg-[#0d0f12] p-6 rounded-2xl border border-[#1e293b] text-center">
              <div>
                <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider">Joint Tested</span>
                <p className="text-base font-bold text-white mt-1.5">{jointInfo.name}</p>
              </div>
              <div className="border-y md:border-y-0 md:border-x border-[#1e293b] py-4 md:py-0">
                <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider">Simulated ROM Angle</span>
                <p className="text-2xl font-black text-[#00b4d8] mt-1">{devTestRom}°</p>
              </div>
              <div>
                <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider">Estimated Classification</span>
                <p className={`text-base font-bold mt-1.5 ${
                  devTestRom >= jointInfo.refMinNormal ? 'text-[#10b981]' : 'text-yellow-500'
                }`}>
                  {devTestRom >= jointInfo.refMinNormal ? 'Normal ROM' : 'Limited ROM'}
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <button
                disabled
                className="inline-flex items-center justify-center gap-2 bg-[#1e293b] text-[#64748b] py-3.5 px-6 rounded-xl text-xs font-bold cursor-not-allowed border border-[#1e293b]"
              >
                <span>Save Disabled (M6 Only)</span>
              </button>
              <button
                onClick={handleRequestCamera}
                className="inline-flex items-center justify-center gap-2 bg-[#7209b7] hover:bg-[#5b008d] text-white py-3.5 px-6 rounded-xl text-xs font-semibold transition-all"
              >
                <RotateCw className="h-4 w-4" />
                <span>Re-calibrate Camera Preview</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function AssessPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow bg-[#0d0f12] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00b4d8]" />
      </div>
    }>
      <AssessPageContent />
    </Suspense>
  );
}
