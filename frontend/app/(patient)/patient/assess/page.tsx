'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { CalibrationOverlay } from '../../../../components/patient/CalibrationOverlay';
import { MovementVisualGuide } from '../../../../components/patient/MovementVisualGuide';
import { getPoseLandmarker, destroyPoseLandmarker } from '../../../../services/poseDetection';
import { PoseLandmarker } from '@mediapipe/tasks-vision';
import { calculateJointAngle, getRequiredLandmarksForFrame, EMAFilter, PoseLandmark } from '../../../../utils/kinematics';
import { calculateAssessmentMetrics, AssessmentMetrics, AngleSample, isValidAngle } from '../../../../utils/romAnalysis';
import { Camera, ShieldAlert, ArrowLeft, Loader2, RotateCw, RefreshCw, Play, Square, Check, AlertTriangle, CheckCircle2, Info, Compass, Eye } from 'lucide-react';

interface JointDetail {
  id: string;
  name: string;
  view: 'Side View' | 'Front View';
  sideMode: 'inferred' | 'both';
  cameraDistance: string;
  purpose: string;
  normalRange: string;
  refMinNormal: number;
  refMaxNormal: number;
  targetJoint: string;
  testingSideInstruction: string;
  standingDistance: string;
  startingPosition: string;
  movementInstruction: string;
  instructions: string[];
}

const JOINT_DETAILS: Record<string, JointDetail> = {
  SF001: {
    id: 'SF001',
    name: 'Shoulder Flexion',
    view: 'Side View',
    sideMode: 'inferred',
    cameraDistance: '2–3 m',
    purpose: 'Measure forward arm elevation (raising the arm forward and up overhead).',
    normalRange: '160° – 180°',
    refMinNormal: 160,
    refMaxNormal: 180,
    targetJoint: 'Shoulder (Glenohumeral Joint)',
    testingSideInstruction: 'Present the side you want assessed to the camera. Calibration will identify it as LEFT or RIGHT.',
    standingDistance: 'keep your entire body from head to feet in frame',
    startingPosition: 'Stand upright with the arm on the side identified during calibration hanging comfortably at your side',
    movementInstruction: 'Slowly raise the arm on the side identified during calibration forward and upward as high as comfortably possible. Hold at the top for 2 seconds, then lower.',
    instructions: [
      'Stand sideways to the camera.',
      'Present the side you want assessed; calibration will identify it as LEFT or RIGHT.',
      'Keep the arm on the side identified during calibration comfortably straight at your side.',
      'Slowly raise the arm on the identified side forward and upward as high as comfortably possible.',
      'Hold the peak position for 2 seconds, then slowly lower.',
    ],
  },
  SA001: {
    id: 'SA001',
    name: 'Shoulder Abduction',
    view: 'Front View',
    sideMode: 'inferred',
    cameraDistance: '2–3 m',
    purpose: 'Measure sideways arm elevation (raising the arm out to the side and up).',
    normalRange: '160° – 180°',
    refMinNormal: 160,
    refMaxNormal: 180,
    targetJoint: 'Shoulder (Glenohumeral Joint)',
    testingSideInstruction: 'Face the camera directly. The LEFT or RIGHT arm identified during calibration is the arm measured.',
    standingDistance: 'keep your full body in frame',
    startingPosition: 'Stand upright with arms resting comfortably straight at your sides',
    movementInstruction: 'Slowly raise the arm on the side identified during calibration sideways and up overhead through your full range. Hold for 2 seconds, then lower.',
    instructions: [
      'Face the camera directly.',
      'Keep your body upright with both arms resting beside your body.',
      'Slowly raise the arm on the side identified during calibration sideways and up overhead.',
      'Hold the peak position for 2 seconds, then slowly lower.',
    ],
  },
  EF001: {
    id: 'EF001',
    name: 'Elbow Flexion',
    view: 'Side View',
    sideMode: 'inferred',
    cameraDistance: '2–3 m',
    purpose: 'Measure elbow bending (bringing your forearm up toward your shoulder).',
    normalRange: '145° – 150°',
    refMinNormal: 145,
    refMaxNormal: 150,
    targetJoint: 'Elbow (Humeroulnar Joint)',
    testingSideInstruction: 'Present the side you want assessed. Calibration will identify whether the LEFT or RIGHT arm is measured.',
    standingDistance: 'keep your shoulder, elbow, and wrist clearly in frame',
    startingPosition: 'Keep the arm on the side identified during calibration comfortably straight and pointing downward with your palm facing forward',
    movementInstruction: 'Slowly bend the elbow on the side identified during calibration, bringing your hand up toward your shoulder. Hold for 2 seconds, then lower.',
    instructions: [
      'Stand sideways to the camera and present the side you want assessed.',
      'Keep the upper arm on the side identified during calibration still and comfortably straight, pointing down.',
      'Slowly bend the elbow on the identified side, bringing your hand up toward your shoulder.',
      'Move through your comfortable available range and hold for 2 seconds.',
      'Slowly lower back down.',
    ],
  },
  KF001: {
    id: 'KF001',
    name: 'Knee Flexion',
    view: 'Side View',
    sideMode: 'inferred',
    cameraDistance: '2–3 m',
    purpose: 'Measure knee bending (bringing your heel toward your buttocks).',
    normalRange: '130° – 135°',
    refMinNormal: 130,
    refMaxNormal: 135,
    targetJoint: 'Knee (Tibiofemoral Joint)',
    testingSideInstruction: 'Present the side you want assessed. Calibration will identify whether the LEFT or RIGHT leg is measured.',
    standingDistance: 'keep your hip, knee, and ankle/foot visible',
    startingPosition: 'Stand straight on both legs (lightly touch a wall or chair for balance if needed)',
    movementInstruction: 'Slowly bend the knee on the side identified during calibration backward and upward as far as comfortably possible. Hold for 2 seconds, then lower.',
    instructions: [
      'Stand sideways to the camera and present the side you want assessed.',
      'Keep your body upright (you may lightly touch a wall or chair for balance).',
      'Start with the leg on the side identified during calibration comfortably straight.',
      'Slowly bend your knee backward as much as possible and hold for 2 seconds.',
      'Slowly return foot to ground.',
    ],
  },
  HF001: {
    id: 'HF001',
    name: 'Hip Flexion',
    view: 'Side View',
    sideMode: 'inferred',
    cameraDistance: '2–3 m',
    purpose: 'Measure hip mobility (lifting your knee up toward your chest).',
    normalRange: '110° – 120°',
    refMinNormal: 110,
    refMaxNormal: 120,
    targetJoint: 'Hip (Acetabulofemoral Joint)',
    testingSideInstruction: 'Present the side you want assessed. Calibration will identify whether the LEFT or RIGHT leg is measured.',
    standingDistance: 'keep your torso, hips, and legs in frame',
    startingPosition: 'Stand straight and upright with both legs resting naturally on the ground',
    movementInstruction: 'Slowly raise the thigh and knee on the side identified during calibration forward and up toward your chest. Hold for 2 seconds, then lower.',
    instructions: [
      'Stand sideways to the camera and present the side you want assessed.',
      'Stand upright with your leg comfortably down.',
      'Slowly raise the thigh and knee on the side identified during calibration forward toward your chest.',
      'Hold the peak position for 2 seconds, then slowly lower.',
    ],
  },
  NR001: {
    id: 'NR001',
    name: 'Neck Rotation',
    view: 'Front View',
    sideMode: 'both',
    cameraDistance: '1.5–2 m',
    purpose: 'Measure neck mobility (rotating your head to look left and right).',
    normalRange: '70° – 80°',
    refMinNormal: 70,
    refMaxNormal: 80,
    targetJoint: 'Cervical Spine / Neck',
    testingSideInstruction: 'Face the camera directly (both shoulders level); both left and right rotation are assessed',
    standingDistance: 'keep your head and shoulders clearly visible',
    startingPosition: 'Head upright and level, looking directly forward at the camera, shoulders still',
    movementInstruction: 'Slowly rotate your head to the left, return to center, then rotate to the right. Hold each side for 2 seconds.',
    instructions: [
      'Face the camera directly.',
      'Keep your shoulders and body relatively still facing forward.',
      'Start with head level, looking directly at the camera.',
      'Slowly rotate your head to the left and hold for 2 seconds.',
      'Return to center, then slowly rotate to the right and hold for 2 seconds.',
    ],
  },
};

function getTestingSideGuidance(jointInfo: JointDetail, lockedSide: 'LEFT' | 'RIGHT' | null): string {
  if (jointInfo.sideMode === 'inferred' && lockedSide) {
    return `The ${lockedSide} side is being tested.`;
  }
  return jointInfo.testingSideInstruction;
}

type AssessState =
  | 'INSTRUCTIONS'
  | 'CAMERA_REQUEST'
  | 'CAMERA_READY'
  | 'AI_INITIALIZING'
  | 'AI_INITIALIZATION_ERROR'
  | 'POSE_DETECTION'
  | 'CALIBRATION'
  | 'READY'
  | 'RECORDING'
  | 'RESULTS';

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
  const currentStateRef = useRef<AssessState>('INSTRUCTIONS');

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [aiErrorMsg, setAiErrorMsg] = useState<string | null>(null);

  // Locked Side Selection
  const [lockedSide, setLockedSide] = useState<'LEFT' | 'RIGHT' | null>(null);

  // Occupancy errors
  const [noPersonDetected, setNoPersonDetected] = useState<boolean>(false);
  const [multiplePeopleDetected, setMultiplePeopleDetected] = useState<boolean>(false);
  const [lowConfidenceWarning, setLowConfidenceWarning] = useState<boolean>(false);

  // Live Positioning & Readiness Feedback
  const [isPersonDetected, setIsPersonDetected] = useState<boolean>(false);
  const [areJointsVisible, setAreJointsVisible] = useState<boolean>(false);
  const [isOrientationAligned, setIsOrientationAligned] = useState<boolean>(false);
  const [liveCoachMessage, setLiveCoachMessage] = useState<string>('Searching for body landmarks...');

  // Assessment results and active recording states
  const [assessmentMetrics, setAssessmentMetrics] = useState<AssessmentMetrics | null>(null);
  const [recordingDurationSec, setRecordingDurationSec] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const angleDisplayRef = useRef<HTMLSpanElement>(null);

  // Filters, side detection, and recording refs
  const emaFilterRef = useRef<EMAFilter>(new EMAFilter(0.25));
  const lockedSideRef = useRef<'LEFT' | 'RIGHT' | null>(null);
  const lowConfidenceStartRef = useRef<number | null>(null);
  const calibrationStartRef = useRef<number | null>(null);

  // Measurement sample collection buffer
  const recordedSamplesRef = useRef<AngleSample[]>([]);
  const recordingStartTimeRef = useRef<number | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastDetectedDirectionRef = useRef<'Left' | 'Right' | undefined>(undefined);

  // Visibility accumulator for locked presenting-side selection
  const accumLeftVisRef = useRef<number>(0);
  const accumRightVisRef = useRef<number>(0);
  const accumFramesRef = useRef<number>(0);

  // Synchronize state ref
  useEffect(() => {
    currentStateRef.current = currentState;
  }, [currentState]);

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
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    // Reset calculators and buffers
    lowConfidenceStartRef.current = null;
    calibrationStartRef.current = null;
    lockedSideRef.current = null;
    setLockedSide(null);
    emaFilterRef.current.reset();
    accumLeftVisRef.current = 0;
    accumRightVisRef.current = 0;
    accumFramesRef.current = 0;
    recordedSamplesRef.current = [];
    recordingStartTimeRef.current = null;
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

      startPoseTrackingLoop();
    } catch (err: any) {
      console.error('[ERROR] AI initialization failed:', err);
      setAiErrorMsg('Failed to download MediaPipe WASM libraries or task models. Verify your internet connection.');
      setCurrentState('AI_INITIALIZATION_ERROR');
    }
  };

  // Step 3: Run recursive frame loop with live positioning feedback
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

      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const timestamp = performance.now();
        const results = landmarker.detectForVideo(video, timestamp);

        let formattedAngle = '--';

        if (results && results.landmarks && results.landmarks.length > 0) {
          const posesCount = results.landmarks.length;
          if (posesCount > 1) {
            setMultiplePeopleDetected(true);
            setNoPersonDetected(false);
            setIsPersonDetected(false);
            setLiveCoachMessage('Multiple people detected. Ensure only one person is in front of the camera.');
          } else {
            setMultiplePeopleDetected(false);
            setNoPersonDetected(false);
            setIsPersonDetected(true);
          }

          const landmarks = results.landmarks[0] as PoseLandmark[];
          const requiredLandmarks = getRequiredLandmarksForFrame(jointInfo.id, landmarks);

          // Check required joints confidence
          const hasLowConfidenceJoints = requiredLandmarks.some((id) => {
            const node = landmarks[id];
            return !node || node.visibility < 0.5;
          });

          setAreJointsVisible(!hasLowConfidenceJoints);

          // Live Orientation Check using existing shoulder coordinates
          const leftShoulder = landmarks[11];
          const rightShoulder = landmarks[12];
          const shoulderDistance = Math.abs((leftShoulder?.x || 0) - (rightShoulder?.x || 0));

          let orientationOk = false;
          if (jointInfo.view === 'Side View') {
            // Turned sideways: shoulders overlap or one shoulder dominates visibility
            const visDiff = Math.abs((leftShoulder?.visibility || 0) - (rightShoulder?.visibility || 0));
            orientationOk = shoulderDistance <= 0.28 || visDiff > 0.25;
            setIsOrientationAligned(orientationOk);
          } else {
            // Facing forward: shoulders are horizontally separated
            orientationOk = shoulderDistance >= 0.12;
            setIsOrientationAligned(orientationOk);
          }

          // Dynamic coach guidance prompt
          if (posesCount > 1) {
            setLiveCoachMessage('Ensure only one person is visible to calibrate correctly.');
          } else if (!orientationOk) {
            if (jointInfo.view === 'Side View') {
              setLiveCoachMessage('Turn sideways so your chosen testing side faces the camera.');
            } else {
              setLiveCoachMessage('Turn and face the camera directly.');
            }
          } else if (hasLowConfidenceJoints) {
            setLiveCoachMessage(`Adjust position: ensure your ${jointInfo.targetJoint.toLowerCase()} is clearly visible.`);
          } else if (currentStateRef.current === 'CALIBRATION') {
            setLiveCoachMessage('Position detected! Hold steady for 2 seconds while calibrating...');
          } else if (currentStateRef.current === 'READY') {
            setLiveCoachMessage('Camera & position are ready. Follow the START pose shown in the guide, then click Start Assessment.');
          } else if (currentStateRef.current === 'RECORDING') {
            setLiveCoachMessage('Recording in progress — perform the movement through your full range.');
          }

          // Elapsed time warnings logic (continuous 5s check)
          const now = performance.now();
          if (hasLowConfidenceJoints) {
            if (lowConfidenceStartRef.current === null) {
              lowConfidenceStartRef.current = now;
            } else if (now - lowConfidenceStartRef.current > 5000) {
              setLowConfidenceWarning(true);
            }
            calibrationStartRef.current = null;

            if (currentStateRef.current === 'CALIBRATION') {
              setCurrentState('POSE_DETECTION');
            }
          } else {
            lowConfidenceStartRef.current = null;
            setLowConfidenceWarning(false);

            // Side-locking calibration
            if (currentStateRef.current === 'POSE_DETECTION' && orientationOk) {
              setCurrentState('CALIBRATION');
              calibrationStartRef.current = now;

              accumLeftVisRef.current = 0;
              accumRightVisRef.current = 0;
              accumFramesRef.current = 0;
            } else if (currentStateRef.current === 'CALIBRATION') {
              const lVis = (landmarks[11]?.visibility || 0) + (landmarks[13]?.visibility || 0) + (landmarks[15]?.visibility || 0) + (landmarks[23]?.visibility || 0) + (landmarks[25]?.visibility || 0) + (landmarks[27]?.visibility || 0);
              const rVis = (landmarks[12]?.visibility || 0) + (landmarks[14]?.visibility || 0) + (landmarks[16]?.visibility || 0) + (landmarks[24]?.visibility || 0) + (landmarks[26]?.visibility || 0) + (landmarks[28]?.visibility || 0);
              accumLeftVisRef.current += lVis;
              accumRightVisRef.current += rVis;
              accumFramesRef.current += 1;

              if (calibrationStartRef.current !== null && now - calibrationStartRef.current > 2000) {
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
            if (angleRes.isValid && isValidAngle(angleRes.angle)) {
              const smoothed = emaFilterRef.current.filter(angleRes.angle);
              if (isValidAngle(smoothed)) {
                if (jointInfo.id === 'NR001' && angleRes.direction) {
                  formattedAngle = `${Math.round(smoothed)}° (${angleRes.direction})`;
                } else {
                  formattedAngle = `${Math.round(smoothed)}°`;
                }

                if (currentStateRef.current === 'RECORDING') {
                  recordedSamplesRef.current.push({
                    timestamp: now,
                    angle: smoothed,
                  });
                  if (angleRes.direction) {
                    lastDetectedDirectionRef.current = angleRes.direction;
                  }
                }
              }
            }
          }

          // Skeleton drawing
          POSE_CONNECTIONS.forEach(([iA, iB]) => {
            const ptA = landmarks[iA];
            const ptB = landmarks[iB];

            if (ptA && ptB) {
              ctx.beginPath();
              ctx.moveTo(ptA.x * canvas.width, ptA.y * canvas.height);
              ctx.lineTo(ptB.x * canvas.width, ptB.y * canvas.height);

              if (ptA.visibility >= 0.5 && ptB.visibility >= 0.5) {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3;
                ctx.setLineDash([]);
              } else {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = 1;
                ctx.setLineDash([4, 4]);
              }
              ctx.stroke();
            }
          });

          landmarks.forEach((lm, idx) => {
            if (idx > 10 && idx < 29) {
              ctx.beginPath();
              ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 5, 0, 2 * Math.PI);

              if (lm.visibility >= 0.5) {
                ctx.fillStyle = '#00b4d8';
                ctx.fill();
              } else {
                ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
                ctx.setLineDash([2, 2]);
                ctx.stroke();
              }
            }
          });

        } else {
          setNoPersonDetected(true);
          setMultiplePeopleDetected(false);
          setIsPersonDetected(false);
          setAreJointsVisible(false);
          setIsOrientationAligned(false);
          setLiveCoachMessage(`Searching for person — stand ${jointInfo.cameraDistance} away and ${jointInfo.standingDistance}.`);

          lowConfidenceStartRef.current = null;
          calibrationStartRef.current = null;
          emaFilterRef.current.reset();
          if (currentStateRef.current !== 'POSE_DETECTION' && currentStateRef.current !== 'CAMERA_READY') {
            setCurrentState('POSE_DETECTION');
          }
        }

        if (angleDisplayRef.current) {
          angleDisplayRef.current.innerText = formattedAngle;
        }
      }

      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    animationFrameRef.current = requestAnimationFrame(processFrame);
  };

  // Start Recording
  const handleStartRecording = () => {
    recordedSamplesRef.current = [];
    lastDetectedDirectionRef.current = undefined;
    recordingStartTimeRef.current = performance.now();
    setRecordingDurationSec(0);
    setCurrentState('RECORDING');

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    recordingTimerRef.current = setInterval(() => {
      if (recordingStartTimeRef.current) {
        const elapsed = Math.floor((performance.now() - recordingStartTimeRef.current) / 1000);
        setRecordingDurationSec(elapsed);
      }
    }, 500);
  };

  // Stop Recording & Analyze Metrics
  const handleStopRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    const endTime = performance.now();
    const startTime = recordingStartTimeRef.current || (endTime - 1000);

    const metrics = calculateAssessmentMetrics(
      jointInfo.id,
      jointInfo.name,
      recordedSamplesRef.current,
      startTime,
      endTime,
      lockedSideRef.current || undefined,
      lastDetectedDirectionRef.current,
      15
    );

    setAssessmentMetrics(metrics);
    setCurrentState('RESULTS');
  };

  // Restart assessment from READY state
  const handleRestartAssessment = () => {
    recordedSamplesRef.current = [];
    setAssessmentMetrics(null);
    setRecordingDurationSec(0);
    setCurrentState('READY');
  };

  return (
    <div className="flex-grow bg-[#0d0f12] text-white flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-6xl flex flex-col gap-6">

        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              stopPosePipeline();
              router.push('/patient');
            }}
            className="inline-flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Cancel and Return to Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-[#1e293b] text-[#00b4d8] px-3 py-1 rounded-full font-mono font-bold uppercase">
              {jointInfo.name} ({jointInfo.id})
            </span>
            <span className="text-[11px] bg-[#141820] text-[#94a3b8] border border-[#1e293b] px-3 py-1 rounded-full font-mono">
              {jointInfo.view}
            </span>
          </div>
        </div>

        {/* Camera Permission Error */}
        {cameraError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-4 rounded-xl flex gap-3 items-start">
            <ShieldAlert className="h-5 w-5 text-[#ef4444] shrink-0" />
            <div>
              <p className="font-semibold">Webcam Access Denied</p>
              <p className="mt-0.5 leading-relaxed">{cameraError}</p>
            </div>
          </div>
        )}

        {/* MediaPipe Error */}
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

        {/* 1. STATE: INSTRUCTIONS (With Visual Reference Guide) */}
        {currentState === 'INSTRUCTIONS' && (
          <div className="grid md:grid-cols-12 gap-8 bg-[#141820] border border-[#1e293b] p-8 rounded-3xl">
            {/* Left Column: Instructions Guide */}
            <div className="md:col-span-7 flex flex-col gap-6">
              <div>
                <span className="text-[10px] text-[#00b4d8] font-bold tracking-wider uppercase">Clinical Movement Guide</span>
                <h2 className="text-2xl md:text-3xl font-bold text-white mt-1">{jointInfo.name} Screening</h2>
                <p className="text-sm text-[#94a3b8] mt-1.5 leading-relaxed">{jointInfo.purpose}</p>
              </div>

              {/* Protocol Highlights Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#0d0f12] p-3 rounded-xl border border-[#1e293b]">
                  <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider block font-bold">1. Camera View</span>
                  <span className="text-[#00b4d8] font-semibold mt-0.5 block">{jointInfo.view}</span>
                </div>
                <div className="bg-[#0d0f12] p-3 rounded-xl border border-[#1e293b]">
                  <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider block font-bold">2. Target Joint</span>
                  <span className="text-white font-semibold mt-0.5 block">{jointInfo.targetJoint}</span>
                </div>
                <div className="bg-[#0d0f12] p-3 rounded-xl border border-[#1e293b]">
                  <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider block font-bold">3. Where to Stand</span>
                  <span className="text-white font-medium mt-0.5 block">Stand {jointInfo.cameraDistance} away and {jointInfo.standingDistance}.</span>
                </div>
                <div className="bg-[#0d0f12] p-3 rounded-xl border border-[#1e293b]">
                  <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider block font-bold">4. Testing Side</span>
                  <span className="text-white font-medium mt-0.5 block">{getTestingSideGuidance(jointInfo, lockedSide)}</span>
                </div>
              </div>

              {/* Detailed Step-by-Step Instructions */}
              <div className="flex flex-col gap-2.5">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">How to Perform the Assessment:</h4>
                <ol className="list-decimal pl-5 text-xs text-[#94a3b8] flex flex-col gap-2 leading-relaxed">
                  {jointInfo.instructions.map((step, idx) => (
                    <li key={idx} className="pl-1">{step}</li>
                  ))}
                </ol>
              </div>

              {jointInfo.id === 'NR001' && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-3.5 rounded-xl text-xs text-yellow-400 leading-relaxed">
                  <span className="font-bold block mb-0.5">⚠️ Medical Disclaimer:</span>
                  This neck rotation measurement is a 2D planar angular-deviation proxy on the camera plane and not a direct 3D goniometric cervical measurement.
                </div>
              )}

              <button
                onClick={handleRequestCamera}
                className="inline-flex items-center justify-center gap-2 bg-[#00b4d8] hover:bg-[#0077b6] text-white py-3.5 px-7 rounded-xl text-xs font-bold transition-all w-fit shadow-lg shadow-[#00b4d8]/20 mt-2"
              >
                <Camera className="h-4 w-4" />
                <span>Initialize Webcam & Positioning Preview</span>
              </button>
            </div>

            {/* Right Column: Visual Movement Illustration */}
            <div className="md:col-span-5 flex flex-col gap-4">
              <div>
                <span className="text-[10px] text-[#94a3b8] font-bold tracking-wider uppercase">Visual Movement Guide</span>
                <p className="text-xs text-[#64748b] mt-0.5">Reference starting pose and movement direction</p>
              </div>
              <MovementVisualGuide
                jointId={jointInfo.id}
                sideMode={jointInfo.sideMode}
                cameraDistance={jointInfo.cameraDistance}
              />

              <div className="bg-[#0d0f12] p-4 rounded-xl border border-[#1e293b] text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#94a3b8]">Normal Benchmark:</span>
                  <span className="text-emerald-400 font-bold">≥ {jointInfo.refMinNormal}°</span>
                </div>
                <div className="flex items-center justify-between text-[#64748b]">
                  <span>Typical Population Range:</span>
                  <span>{jointInfo.normalRange}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. STATE: CAMERA_REQUEST */}
        {currentState === 'CAMERA_REQUEST' && (
          <div className="bg-[#141820] border border-[#1e293b] rounded-3xl p-16 flex flex-col items-center justify-center text-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#00b4d8]" />
            <h3 className="font-bold text-lg">Requesting Camera Permissions</h3>
            <p className="text-xs text-[#94a3b8] max-w-sm">Please allow webcam access in your browser to activate the live positioning preview.</p>
          </div>
        )}

        {/* 3. ACTIVE TRACKING & POSITIONING FEED (Layout with Camera + Positioning Panel) */}
        {['CAMERA_READY', 'AI_INITIALIZING', 'AI_INITIALIZATION_ERROR', 'POSE_DETECTION', 'CALIBRATION', 'READY', 'RECORDING'].includes(currentState) && (
          <div className={`grid ${currentState === 'RECORDING' ? 'md:grid-cols-2' : 'lg:grid-cols-12'} gap-6 items-start`}>

            {/* Live Video Feed & Real-time Tracking */}
            <div className={`${currentState === 'RECORDING' ? 'md:col-span-1' : 'lg:col-span-8'} flex flex-col gap-4`}>

              {/* Camera Container */}
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


                {/* Anatomical Calibration Overlay */}
                <CalibrationOverlay joint={jointInfo.id} />

                {/* AI Initialization Overlay */}
                {currentState === 'AI_INITIALIZING' && (
                  <div className="absolute inset-0 bg-[#0d0f12]/90 flex flex-col items-center justify-center text-center gap-4 z-20">
                    <Loader2 className="h-10 w-10 animate-spin text-[#9d4edd]" />
                    <h3 className="font-bold text-base text-white">Initializing Browser-Side AI Model</h3>
                    <p className="text-xs text-[#94a3b8] max-w-sm px-4">Loading MediaPipe Pose Landmarker client-side...</p>
                  </div>
                )}

                {/* Occupancy Warnings */}
                {multiplePeopleDetected && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center gap-2.5 p-6 z-20">
                    <ShieldAlert className="h-10 w-10 text-red-500" />
                    <h4 className="font-bold text-sm text-white">Multiple People Detected</h4>
                    <p className="text-xs text-[#94a3b8] max-w-xs leading-relaxed">Ensure only one person is visible in front of the camera.</p>
                  </div>
                )}

                {noPersonDetected && !['CAMERA_READY', 'AI_INITIALIZING', 'AI_INITIALIZATION_ERROR'].includes(currentState) && (
                  <div className="absolute top-4 right-4 bg-red-500/90 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 z-10 shadow">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Searching for person: stand {jointInfo.cameraDistance} away</span>
                  </div>
                )}

                {lowConfidenceWarning && !noPersonDetected && !multiplePeopleDetected && (
                  <div className="absolute bottom-16 left-4 right-4 bg-yellow-500 border border-yellow-600 text-black p-4 rounded-xl flex gap-3 items-start shadow-lg z-10">
                    <ShieldAlert className="h-5 w-5 shrink-0" />
                    <div className="text-xs">
                      <p className="font-bold">Required joints obscured</p>
                      <p className="mt-0.5 font-medium">Please adjust your position so your required body joints are clearly visible.</p>
                    </div>
                  </div>
                )}

                {/* Bottom Status / Control Bar */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/85 backdrop-blur-sm border border-[#1e293b] px-4 py-3 rounded-xl flex items-center justify-between text-xs z-10">
                  {(currentState === 'CAMERA_READY' || currentState === 'AI_INITIALIZING') && (
                    <span className="text-[#94a3b8] flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#00b4d8]" />
                      Setting up AI pipeline...
                    </span>
                  )}

                  {currentState === 'POSE_DETECTION' && (
                    <span className="text-yellow-400 font-semibold flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
                      Aligning position... {jointInfo.view === 'Side View' ? 'Turn sideways' : 'Face forward'}
                    </span>
                  )}

                  {currentState === 'CALIBRATION' && (
                    <span className="text-[#00b4d8] font-semibold flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00b4d8] animate-ping" />
                      Keypoints locked. Calibrating presenting side (2s)...
                    </span>
                  )}

                  {/* READY State: Start Assessment button is unlocked */}
                  {currentState === 'READY' && (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[#10b981] font-semibold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                        Camera & position ready — follow the START pose shown beside the video.
                      </span>
                      <button
                        onClick={handleStartRecording}
                        className="inline-flex items-center gap-2 bg-[#00b4d8] hover:bg-[#0077b6] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#00b4d8]/20"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Start Assessment</span>
                      </button>
                    </div>
                  )}

                  {/* RECORDING State: Active assessment recording in progress */}
                  {currentState === 'RECORDING' && (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <span className="text-rose-400 font-bold flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                          RECORDING MOVEMENT
                        </span>
                        <span className="text-xs font-mono text-[#94a3b8] bg-[#1e293b] px-2.5 py-1 rounded-md">
                          {`00:${recordingDurationSec < 10 ? '0' : ''}${recordingDurationSec}`}
                        </span>
                      </div>
                      <button
                        onClick={handleStopRecording}
                        className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-600/20"
                      >
                        <Square className="h-3.5 w-3.5 fill-current" />
                        <span>Stop Assessment</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Angle Display Card */}
              <div className="grid grid-cols-2 gap-4 bg-[#141820] border border-[#1e293b] p-5 rounded-2xl">
                <div>
                  <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider font-bold">Tested Protocol</span>
                  <p className="text-base font-bold text-white mt-0.5">{jointInfo.name}</p>
                  {lockedSide && (
                    <span className="text-xs text-[#00b4d8] font-semibold mt-0.5 block">Presenting Side: {lockedSide}</span>
                  )}
                </div>
                <div className="text-right border-l border-[#1e293b] pl-4">
                  <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider font-bold">Live Joint Angle</span>
                  <p className="mt-0.5">
                    <span ref={angleDisplayRef} className="text-3xl font-black text-[#00b4d8]">--</span>
                  </p>
                </div>
              </div>

              {/* Live Readiness Checklist */}
              <div className="bg-[#141820] border border-[#1e293b] p-5 rounded-2xl flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#1e293b] pb-2.5">
                  <span className="text-[11px] text-[#94a3b8] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="h-3.5 w-3.5 text-[#00b4d8]" />
                    Live Positioning & Readiness Checklist
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    currentState === 'READY' || currentState === 'RECORDING'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {currentState === 'RECORDING'
                      ? 'Recording'
                      : currentState === 'READY'
                      ? 'Camera & Position Ready'
                      : 'Calibrating Position'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {/* Check 1: Body Detected */}
                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    isPersonDetected ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' : 'bg-[#0d0f12] border-[#1e293b] text-[#64748b]'
                  }`}>
                    <CheckCircle2 className={`h-4 w-4 shrink-0 ${isPersonDetected ? 'text-emerald-400' : 'text-[#475569]'}`} />
                    <span className="text-[11px] font-medium leading-tight">Body Detected</span>
                  </div>

                  {/* Check 2: Joints Visible */}
                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    areJointsVisible ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' : 'bg-[#0d0f12] border-[#1e293b] text-[#64748b]'
                  }`}>
                    <CheckCircle2 className={`h-4 w-4 shrink-0 ${areJointsVisible ? 'text-emerald-400' : 'text-[#475569]'}`} />
                    <span className="text-[11px] font-medium leading-tight">Joints Visible</span>
                  </div>

                  {/* Check 3: Orientation Aligned */}
                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    isOrientationAligned ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' : 'bg-[#0d0f12] border-[#1e293b] text-[#64748b]'
                  }`}>
                    <CheckCircle2 className={`h-4 w-4 shrink-0 ${isOrientationAligned ? 'text-emerald-400' : 'text-[#475569]'}`} />
                    <span className="text-[11px] font-medium leading-tight">{jointInfo.view} Aligned</span>
                  </div>

                  {/* Check 4: Position Ready */}
                  <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    currentState === 'READY' || currentState === 'RECORDING' ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' : 'bg-[#0d0f12] border-[#1e293b] text-[#64748b]'
                  }`}>
                    <CheckCircle2 className={`h-4 w-4 shrink-0 ${currentState === 'READY' || currentState === 'RECORDING' ? 'text-emerald-400' : 'text-[#475569]'}`} />
                    <span className="text-[11px] font-medium leading-tight">
                      {jointInfo.sideMode === 'inferred' && lockedSide
                        ? `${lockedSide} side is being tested`
                        : currentState === 'READY' || currentState === 'RECORDING'
                        ? 'Camera & Position Ready'
                        : 'Awaiting Calibration'}
                    </span>
                  </div>
                </div>

                {/* Real-time Actionable Coach Prompt */}
                <div className="bg-[#0d0f12] border border-[#1e293b] px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 text-xs">
                  <Info className="h-4 w-4 text-[#00b4d8] shrink-0" />
                  <span className="text-white font-medium">{liveCoachMessage}</span>
                </div>
              </div>

            </div>

            {/* Movement Guidance Panel */}
            <div className={`${currentState === 'RECORDING' ? 'md:col-span-1' : 'lg:col-span-4'} flex flex-col gap-4`}>

              {/* Use a large animated reference alongside the live feed while recording. */}
              {currentState === 'RECORDING' ? (
                <MovementVisualGuide
                  jointId={jointInfo.id}
                  lockedSide={lockedSide}
                  sideMode={jointInfo.sideMode}
                  cameraDistance={jointInfo.cameraDistance}
                  movementInstruction={jointInfo.movementInstruction}
                  compact
                  coachMode
                />
              ) : (
                <MovementVisualGuide
                  jointId={jointInfo.id}
                  lockedSide={lockedSide}
                  sideMode={jointInfo.sideMode}
                  cameraDistance={jointInfo.cameraDistance}
                />
              )}

              {/* Protocol Step-by-Step Guidance Card */}
              <div className="bg-[#141820] border border-[#1e293b] p-5 rounded-2xl flex flex-col gap-3 text-xs">
                <span className="text-[10px] text-[#00b4d8] uppercase tracking-wider font-bold">Positioning Protocol</span>

                <div className="space-y-3">
                  <div className="bg-[#0d0f12] p-3 rounded-xl border border-[#1e293b]">
                    <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider block font-bold">1. Camera View</span>
                    <span className="text-white font-semibold mt-0.5 block">{jointInfo.view}</span>
                  </div>

                  <div className="bg-[#0d0f12] p-3 rounded-xl border border-[#1e293b]">
                    <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider block font-bold">2. Where & How to Stand</span>
                    <span className="text-white font-medium mt-0.5 block leading-relaxed">Stand {jointInfo.cameraDistance} away and {jointInfo.standingDistance}.</span>
                  </div>

                  <div className="bg-[#0d0f12] p-3 rounded-xl border border-[#1e293b]">
                    <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider block font-bold">3. Testing Side</span>
                    <span className="text-white font-medium mt-0.5 block leading-relaxed">{getTestingSideGuidance(jointInfo, lockedSide)}</span>
                  </div>

                  <div className="bg-[#0d0f12] p-3 rounded-xl border border-[#1e293b]">
                    <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider block font-bold">4. Starting Posture</span>
                    <span className="text-white font-medium mt-0.5 block leading-relaxed">{jointInfo.startingPosition}</span>
                  </div>

                  <div className="bg-[#0d0f12] p-3 rounded-xl border border-[#1e293b]">
                    <span className="text-[10px] text-[#00b4d8] uppercase tracking-wider block font-bold">5. Movement to Perform</span>
                    <span className="text-white font-medium mt-0.5 block leading-relaxed">{jointInfo.movementInstruction}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 4. STATE: RESULTS (Milestone 7: ROM Analysis & Movement Metrics) */}
        {currentState === 'RESULTS' && (
          <div>
            {assessmentMetrics === null ? (
              // Empty / Insufficient Data State
              <div className="bg-[#141820] border border-amber-500/30 p-8 rounded-3xl flex flex-col gap-6">
                <div className="flex items-center gap-3 text-amber-400">
                  <AlertTriangle className="h-7 w-7 shrink-0" />
                  <div>
                    <h2 className="text-xl font-bold">Assessment Incomplete</h2>
                    <p className="text-xs text-amber-300/80 mt-0.5">Could not produce a reliable Range of Motion (ROM) measurement.</p>
                  </div>
                </div>

                <p className="text-sm text-[#94a3b8] leading-relaxed">
                  Insufficient valid movement data was collected during the recording session (minimum 15 valid frames required). This occurs when required joints are obscured, lighting is insufficient, or the session was stopped too quickly.
                </p>

                <div className="bg-[#0d0f12] border border-[#1e293b] p-5 rounded-2xl text-xs text-[#94a3b8] space-y-2">
                  <p className="font-semibold text-white">Recommendations for a reliable measurement:</p>
                  <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
                    <li>Stand {jointInfo.cameraDistance} away and {jointInfo.standingDistance}.</li>
                    <li>Ensure room lighting is bright and evenly distributed.</li>
                    <li>Perform the movement smoothly through your full range and hold for 1–2 seconds.</li>
                  </ul>
                </div>

                <div className="flex flex-wrap gap-4 mt-2">
                  <button
                    onClick={handleRestartAssessment}
                    className="inline-flex items-center justify-center gap-2 bg-[#00b4d8] hover:bg-[#0077b6] text-white py-3.5 px-6 rounded-xl text-xs font-bold transition-all"
                  >
                    <RotateCw className="h-4 w-4" />
                    <span>Try Assessment Again</span>
                  </button>
                  <button
                    onClick={() => {
                      stopPosePipeline();
                      router.push('/patient');
                    }}
                    className="inline-flex items-center justify-center gap-2 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-white py-3.5 px-6 rounded-xl text-xs font-semibold transition-all"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Return to Dashboard</span>
                  </button>
                </div>
              </div>
            ) : (
              // Complete Assessment Result Card
              <div className="bg-[#141820] border border-[#1e293b] p-8 rounded-3xl flex flex-col gap-6">

                {/* Result Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-6">
                  <div>
                    <span className="text-[10px] text-[#00b4d8] font-bold tracking-wider uppercase">Movement Screening Results</span>
                    <h2 className="text-2xl font-bold text-white mt-1">
                      {assessmentMetrics.jointName} {assessmentMetrics.side ? `(${assessmentMetrics.side} Side)` : ''}
                    </h2>
                    {/* Updated Clinical Benchmark Wording (Resolves closed-interval ambiguity) */}
                    <p className="text-xs text-[#94a3b8] mt-1">
                      Normal Benchmark: <strong className="text-white">≥ {jointInfo.refMinNormal}°</strong>{' '}
                      <span className="text-[#64748b]">(Typical: {jointInfo.normalRange})</span>
                    </p>
                  </div>
                  <div>
                    {/* Clinical Classification Badge */}
                    <span className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${
                      assessmentMetrics.classification === 'Normal'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : assessmentMetrics.classification === 'Mild Limitation'
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : assessmentMetrics.classification === 'Moderate Limitation'
                        ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                        : assessmentMetrics.classification === 'Severe Limitation'
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-current" />
                      {assessmentMetrics.classification}
                    </span>
                  </div>
                </div>

                {/* Primary Metric: Peak ROM Banner */}
                <div className="bg-gradient-to-r from-[#00b4d8]/15 via-[#0077b6]/10 to-transparent border border-[#00b4d8]/30 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] text-[#00b4d8] font-bold uppercase tracking-wider">Peak Range of Motion (ROM)</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-5xl font-black text-white">{Math.round(assessmentMetrics.peakRom)}°</span>
                      {assessmentMetrics.direction && (
                        <span className="text-sm font-semibold text-[#94a3b8]">({assessmentMetrics.direction})</span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-[#94a3b8] max-w-xs leading-relaxed sm:text-right">
                    Calculated from actual joint kinematics during this assessment.
                  </div>
                </div>

                {/* Secondary Metrics 4-Column Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#0d0f12] border border-[#1e293b] p-4 rounded-xl text-center">
                    <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider block">Starting Angle</span>
                    <span className="text-xl font-bold text-white mt-1 block">{Math.round(assessmentMetrics.startingAngle)}°</span>
                  </div>
                  <div className="bg-[#0d0f12] border border-[#1e293b] p-4 rounded-xl text-center">
                    <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider block">Ending Angle</span>
                    <span className="text-xl font-bold text-white mt-1 block">{Math.round(assessmentMetrics.endingAngle)}°</span>
                  </div>
                  <div className="bg-[#0d0f12] border border-[#1e293b] p-4 rounded-xl text-center">
                    <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider block">Minimum Angle</span>
                    <span className="text-xl font-bold text-white mt-1 block">{Math.round(assessmentMetrics.minimumAngle)}°</span>
                  </div>
                  <div className="bg-[#0d0f12] border border-[#1e293b] p-4 rounded-xl text-center">
                    <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider block">Maximum Angle</span>
                    <span className="text-xl font-bold text-white mt-1 block">{Math.round(assessmentMetrics.maximumAngle)}°</span>
                  </div>
                  <div className="bg-[#0d0f12] border border-[#1e293b] p-4 rounded-xl text-center">
                    <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider block">Movement Range</span>
                    <span className="text-xl font-bold text-[#00b4d8] mt-1 block">{Math.round(assessmentMetrics.movementRange)}°</span>
                  </div>
                  <div className="bg-[#0d0f12] border border-[#1e293b] p-4 rounded-xl text-center">
                    <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider block">Duration</span>
                    <span className="text-xl font-bold text-white mt-1 block">{assessmentMetrics.assessmentDuration.toFixed(1)}s</span>
                  </div>
                </div>

                {/* Assessment Quality & Sample Metadata */}
                <div className="bg-[#0d0f12] border border-[#1e293b] px-5 py-3.5 rounded-xl flex flex-wrap items-center justify-between text-xs text-[#94a3b8] gap-2">
                  <span>Measurement Stream: <strong className="text-white">Valid</strong></span>
                  <span>Valid Frames Captured: <strong className="text-white">{assessmentMetrics.validFrameCount} frames</strong></span>
                </div>

                {/* Neck Rotation Disclaimer if NR001 */}
                {jointInfo.id === 'NR001' && (
                  <div className="bg-[#1e293b]/40 border border-[#334155] p-3.5 rounded-xl text-xs text-yellow-500 leading-relaxed">
                    <strong>Medical Disclaimer:</strong> This neck rotation measurement represents a 2D planar angular-deviation proxy on the camera plane and is not a direct 3D goniometric cervical measurement.
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-4 mt-2">
                  <button
                    onClick={handleRestartAssessment}
                    className="inline-flex items-center justify-center gap-2 bg-[#00b4d8] hover:bg-[#0077b6] text-white py-3.5 px-6 rounded-xl text-xs font-bold transition-all"
                  >
                    <RotateCw className="h-4 w-4" />
                    <span>Perform Assessment Again</span>
                  </button>
                  <button
                    onClick={() => {
                      stopPosePipeline();
                      router.push('/patient');
                    }}
                    className="inline-flex items-center justify-center gap-2 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-white py-3.5 px-6 rounded-xl text-xs font-semibold transition-all"
                  >
                    <Check className="h-4 w-4" />
                    <span>Done & Return to Dashboard</span>
                  </button>
                </div>
              </div>
            )}
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
