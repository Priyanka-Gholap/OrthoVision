import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';

let poseLandmarkerInstance: PoseLandmarker | null = null;
let initializationPromise: Promise<PoseLandmarker> | null = null;

/**
 * Initialize PoseLandmarker with GPU-first loading and CPU fallback.
 */
export async function getPoseLandmarker(): Promise<PoseLandmarker> {
  if (typeof window === 'undefined') {
    throw new Error('[PoseDetection] PoseLandmarker can only be initialized on the client browser.');
  }

  if (poseLandmarkerInstance) {
    return poseLandmarkerInstance;
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      console.log('[PoseDetection] Initializing version-pinned WebAssembly FilesetResolver (v0.10.14)...');
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
      );

      console.log('[PoseDetection] Attempting to load PoseLandmarker with GPU acceleration...');
      try {
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        });
        poseLandmarkerInstance = landmarker;
        console.log('[PoseDetection] PoseLandmarker loaded successfully using GPU.');
        return landmarker;
      } catch (gpuError) {
        console.warn('[PoseDetection] GPU loading failed, attempting CPU fallback...', gpuError);
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        });
        poseLandmarkerInstance = landmarker;
        console.log('[PoseDetection] PoseLandmarker loaded successfully using CPU fallback.');
        return landmarker;
      }
    } catch (error) {
      initializationPromise = null; // Clear promise to allow re-initialization retry
      console.error('[PoseDetection] Failed to initialize PoseLandmarker:', error);
      throw error;
    }
  })();

  return initializationPromise;
}

/**
 * Release PoseLandmarker instance to free memory on destruction
 */
export async function destroyPoseLandmarker(): Promise<void> {
  if (poseLandmarkerInstance) {
    try {
      poseLandmarkerInstance.close();
      console.log('[PoseDetection] PoseLandmarker closed and resources released.');
    } catch (err) {
      console.error('[PoseDetection] Error closing PoseLandmarker instance:', err);
    }
    poseLandmarkerInstance = null;
    initializationPromise = null;
  }
}
