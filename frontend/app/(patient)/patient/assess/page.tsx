'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { saveAssessmentApi } from '../../../../services/assessment';
import { CalibrationOverlay } from '../../../../components/patient/CalibrationOverlay';
import { Camera, Check, ShieldAlert, ArrowLeft, Loader2, Play, Eye, RotateCw } from 'lucide-react';

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

type AssessState = 'INSTRUCTIONS' | 'CAMERA_REQUEST' | 'CALIBRATION' | 'RUNNING' | 'REVIEW' | 'SAVING';

function AssessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jointId = searchParams.get('joint') || '';
  
  const jointInfo = JOINT_DETAILS[jointId];
  const { user } = useAuth();
  
  const [currentState, setCurrentState] = useState<AssessState>('INSTRUCTIONS');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [simulatedRom, setSimulatedRom] = useState<number>(0);
  const [isCounting, setIsCounting] = useState<boolean>(false);
  const [timerCount, setTimerCount] = useState<number>(3);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Validate URL Parameter
  useEffect(() => {
    if (!jointId || !jointInfo) {
      router.push('/patient');
    }
  }, [jointId, jointInfo, router]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [stream]);

  if (!jointInfo) {
    return (
      <div className="flex-grow bg-[#0d0f12] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00b4d8]" />
      </div>
    );
  }

  // Trigger camera access
  const handleRequestCamera = async () => {
    setCurrentState('CAMERA_REQUEST');
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
      });
      setStream(mediaStream);
      setCurrentState('CALIBRATION');
      
      // Bind video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err: any) {
      console.error('[ERROR] Camera access failed:', err);
      setCameraError('Webcam access was denied or is unavailable. Please check your browser permission settings.');
      setCurrentState('INSTRUCTIONS');
    }
  };

  // Start Screening simulation countdown
  const startSimulation = () => {
    setCurrentState('RUNNING');
    setIsCounting(true);
    setTimerCount(3);
    setSimulatedRom(0);

    countdownIntervalRef.current = setInterval(() => {
      setTimerCount((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current!);
          setIsCounting(false);
          // Simulate movement peak ROM generation
          simulatePeakRom();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const simulatePeakRom = () => {
    // Generate a random mock angle close to the joint's normal range for presentation
    const rangeDiff = jointInfo.refMaxNormal - jointInfo.refMinNormal;
    const mockPeak = Math.round(jointInfo.refMinNormal - 20 + Math.random() * (rangeDiff + 25));
    setSimulatedRom(mockPeak);
    setCurrentState('REVIEW');
  };

  // Save assessment metadata
  const handleSaveResult = async () => {
    setCurrentState('SAVING');
    setSaveError(null);

    // Compute classification limits
    let classification: 'Normal' | 'Mild Limitation' | 'Moderate Limitation' | 'Severe Limitation' = 'Normal';
    const limit = jointInfo.refMinNormal;
    if (simulatedRom >= limit) {
      classification = 'Normal';
    } else if (simulatedRom >= limit - 20) {
      classification = 'Mild Limitation';
    } else if (simulatedRom >= limit - 40) {
      classification = 'Moderate Limitation';
    } else {
      classification = 'Severe Limitation';
    }

    const response = await saveAssessmentApi({
      joint: jointInfo.id,
      peakRom: simulatedRom,
      classification,
      confidenceScore: 0.95,
    });

    if (response.success) {
      // Release camera feed
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      router.push('/patient');
    } else {
      setSaveError(response.error?.message || 'Failed to save screening results.');
      setCurrentState('REVIEW');
    }
  };

  return (
    <div className="flex-grow bg-[#0d0f12] text-white flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        
        {/* Upper Nav Back */}
        <div className="flex items-center justify-between">
          <Link 
            href="/patient" 
            className="inline-flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Cancel and Return</span>
          </Link>
          <span className="text-[11px] bg-[#1e293b] text-[#94a3b8] px-3 py-1 rounded-full font-mono uppercase">
            Protocol: {jointInfo.id} ({jointInfo.view})
          </span>
        </div>

        {/* Display camera request error */}
        {cameraError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-4 rounded-xl flex gap-3 items-start">
            <ShieldAlert className="h-5 w-5 text-[#ef4444] shrink-0" />
            <div>
              <p className="font-semibold">Webcam Permisson Required</p>
              <p className="mt-0.5 leading-relaxed">{cameraError}</p>
            </div>
          </div>
        )}

        {/* Dynamic States Layout */}
        
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

        {/* 3. STATE: CALIBRATION (webcam preview + outlines overlay) */}
        {currentState === 'CALIBRATION' && (
          <div className="flex flex-col gap-6">
            <div className="relative aspect-video w-full bg-black rounded-3xl overflow-hidden border border-[#1e293b]">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover scale-x-[-1]" // mirror effect for preview
              />
              <CalibrationOverlay joint={jointInfo.id} />
              
              <div className="absolute bottom-4 left-4 right-4 bg-black/75 backdrop-blur-sm border border-[#1e293b] px-4 py-3 rounded-xl flex items-center justify-between text-xs">
                <span className="text-yellow-500 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  Align body to the guide lines. Stand 2-3 meters away.
                </span>
                <button
                  onClick={startSimulation}
                  className="bg-[#00b4d8] hover:bg-[#0077b6] text-white px-4 py-2 rounded-lg font-bold"
                >
                  Start Assessment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. STATE: RUNNING */}
        {currentState === 'RUNNING' && (
          <div className="flex flex-col gap-6">
            <div className="relative aspect-video w-full bg-black rounded-3xl overflow-hidden border border-[#1e293b]">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover scale-x-[-1]"
              />

              {/* Countdown or active simulation banner */}
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center">
                {isCounting ? (
                  <div className="flex flex-col items-center gap-4">
                    <span className="text-[12px] text-[#00b4d8] font-bold tracking-widest uppercase">Get Ready</span>
                    <span className="text-6xl font-extrabold text-white animate-ping">{timerCount}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-xs text-[#10b981] font-bold tracking-widest uppercase flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping" />
                      Assessing ROM...
                    </span>
                    <p className="text-xs text-[#94a3b8] max-w-xs leading-relaxed">Please perform the movement protocol fully and hold peak extension for 2 seconds.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5. STATE: REVIEW */}
        {currentState === 'REVIEW' && (
          <div className="bg-[#141820] border border-[#1e293b] p-8 rounded-3xl flex flex-col gap-6">
            
            {/* Save Error display */}
            {saveError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-4 rounded-xl flex gap-3 items-start">
                <ShieldAlert className="h-5 w-5 text-[#ef4444] shrink-0" />
                <div>
                  <p className="font-semibold">Persistence Error</p>
                  <p className="mt-0.5 leading-relaxed">{saveError}</p>
                </div>
              </div>
            )}

            <div>
              <span className="text-[10px] text-[#10b981] font-bold tracking-wider uppercase">Screening Completed</span>
              <h2 className="text-xl md:text-2xl font-bold text-white mt-1">Review ROM assessment</h2>
              <p className="text-xs text-[#94a3b8] mt-1">Movement screening limits achieved during simulated calibration</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 bg-[#0d0f12] p-6 rounded-2xl border border-[#1e293b] text-center">
              <div>
                <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider">Joint Tested</span>
                <p className="text-base font-bold text-white mt-1.5">{jointInfo.name}</p>
              </div>
              <div className="border-y md:border-y-0 md:border-x border-[#1e293b] py-4 md:py-0">
                <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider">Peak ROM Angle</span>
                <p className="text-2xl font-black text-[#00b4d8] mt-1">{simulatedRom}°</p>
              </div>
              <div>
                <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider">ROM Status</span>
                <p className={`text-base font-bold mt-1.5 ${
                  simulatedRom >= jointInfo.refMinNormal ? 'text-[#10b981]' : 'text-yellow-500'
                }`}>
                  {simulatedRom >= jointInfo.refMinNormal ? 'Normal ROM' : 'Limited ROM'}
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <button
                onClick={handleSaveResult}
                className="inline-flex items-center justify-center gap-2 bg-[#00b4d8] hover:bg-[#0077b6] text-white py-3.5 px-6 rounded-xl text-xs font-bold transition-all"
              >
                <Check className="h-4 w-4" />
                <span>Save Screening Result</span>
              </button>
              <button
                onClick={handleRequestCamera}
                className="inline-flex items-center justify-center gap-2 bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-white py-3.5 px-6 rounded-xl text-xs font-semibold transition-all"
              >
                <RotateCw className="h-4 w-4" />
                <span>Retry screening</span>
              </button>
            </div>
          </div>
        )}

        {/* 6. STATE: SAVING */}
        {currentState === 'SAVING' && (
          <div className="bg-[#141820] border border-[#1e293b] rounded-3xl p-16 flex flex-col items-center justify-center text-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#00b4d8]" />
            <h3 className="font-bold text-lg">Persisting screening results</h3>
            <p className="text-xs text-[#94a3b8] max-w-sm">Saving metadata results in MongoDB record. Please do not close the window...</p>
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
