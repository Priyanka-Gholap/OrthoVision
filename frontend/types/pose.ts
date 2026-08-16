export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
  presence?: number;
}

export type JointConnections = [number, number][];
