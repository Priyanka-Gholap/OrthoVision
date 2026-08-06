# AI Processing Pipeline (Hybrid Architecture)

This document defines the complete AI processing pipeline for Flexion AI, outlining the division of labor between client-side processing (in the browser) and server-side processing (on the FastAPI service) to ensure real-time performance, low latency, and zero server network bottlenecks.

---

## 1. Overview of Hybrid AI Architecture

Flexion AI adopts a **Hybrid AI Architecture** to eliminate the need for uploading raw, high-bandwidth video frames to the server. 

```
+-------------------------------------------------------------------------+
|                          CLIENT BROWSER (NEXT.JS)                       |
|                                                                         |
|  [Webcam Stream]                                                        |
|         │                                                               |
|         ▼                                                               |
|  [MediaPipe Tasks Vision] ──► Extracts 33 Landmark Coordinates (x,y,z) |
|         │                                                               |
|         ▼                                                               |
|  [Vector Mathematics] ─────► Calculates Live Joint Angles (Degrees)    |
|         │                                                               |
|         ▼                                                               |
|  [UI Canvas overlay] ──────► Renders Skeleton & Live Angle on Screen    |
+------------------------------------+------------------------------------+
                                     │
                                     │ POST /ai/analyze (JSON coordinates + metadata)
                                     │ Header: X-AI-SERVICE-KEY
                                     ▼
+-------------------------------------------------------------------------+
|                        FASTAPI SERVICE (PYTHON)                         |
|                                                                         |
|  [Security Validation] ────► Validates API Key custom header            |
|         │                                                               |
|         ▼                                                               |
|  [ROM Analysis] ───────────► Finds dynamic Peak Angles (Max ROM)         |
|         │                                                               |
|         ▼                                                               |
|  [Movement Analysis] ──────► Evaluates Symmetry, Stability & Jitter     |
|         │                                                               |
|         ▼                                                               |
|  [Classification Logic] ───► Maps ROM against reference clinical ranges  |
|         │                                                               |
|         ▼                                                               |
|  [JSON Generator] ─────────► Outputs structured results response        |
+------------------------------------+------------------------------------+
                                     │
                                     ▼
                      Saved via Express to MongoDB
```

---

## 2. Pipeline Phase Details

### Phase 1: Client-Side Capture & Placement Calibration
1. **Webcam Initialization**: Next.js frontend requests user camera permissions at $720p$ and minimum $30\text{ FPS}$.
2. **Camera Guidelines Display**: Before the webcam starts, the UI shows visual placement guidelines (distance: 2–3 meters, plain background, bright lighting) and specific plane instructions:
   *   **Front View (Frontal Plane)**: Shoulder Abduction (SA001), Neck Rotation (NR001).
   *   **Side View (Sagittal Plane)**: Shoulder Flexion (SF001), Elbow Flexion (EF001), Hip Flexion (HF001), Knee Flexion (KF001).
3. **Sensor Alignment**: The canvas renders a static body outline overlay. Once the system detects that landmarks are stable and fully visible in the target configuration, the assessment begins.

### Phase 2: Client-Side Landmark Extraction
1. **MediaPipe Processing**: The frontend uses Google MediaPipe **Tasks Vision SDK (Pose Landmarker)** locally in WebAssembly.
2. **Coordinate Extraction**: Every camera frame yields 33 landmarks containing relative $x$, $y$, $z$, and a confidence score ($v$).
3. **Coordinate Filtering**: Frames where key landmarks have low visibility ($v < 0.65$) are discarded to prevent coordinate jitter.

### Phase 3: Client-Side Live Kinematics
1. **Angle Calculation**: For a target joint, the browser calculates the angle using the coordinates of three points (Origin joint $\mathbf{A}$, Vertex $\mathbf{B}$, End Terminal $\mathbf{C}$).
2. **Euclidean Vector Formulation**:
   *   Vector $\mathbf{u} = \mathbf{A} - \mathbf{B}$
   *   Vector $\mathbf{v} = \mathbf{C} - \mathbf{B}$
3. **Live Angle Formula**:
   $$\theta = \arccos\left(\frac{u_x v_x + u_y v_y}{\sqrt{u_x^2 + u_y^2} \sqrt{v_x^2 + v_y^2}}\right) \times \left(\frac{180}{\pi}\right)$$
4. **Overlay Render**: Renders the skeleton lines and the real-time angle degree number on top of the webcam feed.

### Phase 4: Transmission Payload Generation
Upon the user holding the final position and clicking "Complete Assessment", the client stops tracking, serializes the landmark coordinates sequence, and posts the structured payload to the FastAPI service.

*   **API Path**: `POST /ai/analyze`
*   **Security Header**: `X-AI-SERVICE-KEY: <internal_env_key>`

### Phase 5: Server-Side Kinematics & Movement Quality
The FastAPI service executes python-based analysis scripts:
1. **Peak ROM Extraction**: Filters out noise and finds the peak angle achieved.
2. **Symmetry Indexing**: Computes Left vs. Right ROM differences if bilateral measurements are provided.
3. **Stability & Jitter Review**: Calculates the derivative of the angle over time to detect high-frequency jitter (tremor or movement instability):
   $$\text{Jitter Score} = \frac{1}{N-1} \sum_{t=1}^{N-1} |\theta_{t+1} - \theta_t|$$
4. **Clinical Range Classification**: Compares the peak ROM against the AAOS clinical tables to classify the range of motion as:
   *   `Normal`
   *   `Mild Limitation`
   *   `Moderate Limitation`
   *   `Severe Limitation`

### Phase 6: Results Serialization
FastAPI returns a JSON response containing the final kinematics metadata. The frontend passes this to the Express backend (`POST /api/assessment/save`) for Mongo database persistence.

---

## 3. Data Contracts

### Request Payload (`POST /ai/analyze`)
```json
{
  "assessmentId": "SF001",
  "patientId": "60d5ec49f83c5123456789ab",
  "joint": "left_shoulder",
  "metadata": {
    "fps": 30,
    "duration": 5.2
  },
  "landmarksSequence": [
    {
      "timestamp": 1691321010000,
      "landmarks": [
        {"id": 11, "x": 0.52, "y": 0.35, "z": -0.15, "visibility": 0.98},
        {"id": 13, "x": 0.58, "y": 0.55, "z": -0.18, "visibility": 0.96},
        {"id": 15, "x": 0.61, "y": 0.72, "z": -0.22, "visibility": 0.92}
      ]
    }
  ]
}
```

### Response Payload (`POST /ai/analyze`)
```json
{
  "assessmentId": "SF001",
  "joint": "left_shoulder",
  "peakRom": 165.4,
  "referenceMin": 160.0,
  "referenceMax": 180.0,
  "classification": "Normal",
  "movementAnalysis": {
    "jitterScore": 0.85,
    "stability": "High",
    "asymmetryPercent": 0.0
  },
  "confidenceScore": 0.95,
  "analyzedAt": "2026-08-06T19:45:00Z"
}
```

---

## 4. Pipeline Security Controls

1. **REST Authentication**: The header `X-AI-SERVICE-KEY` is required for every request. FastAPI checks the header against the `AI_SERVICE_KEY` environment variable.
2. **Stateless Operations**: No patient data or pose frames are saved on the disk or memory database of the AI service, conforming with HIPAA data storage guidelines for transit states.

---

## 5. Landmark Confidence Validation

Every landmark extracted by the MediaPipe client-side library includes an associated visibility/confidence score ranging from $0.0$ to $1.0$. To avoid inaccurate readings, joint angle calculations must comply with the following validation criteria:

1. **Required Landmarks Check**: The client-side controller looks up the required landmarks list for the active assessment ID (e.g. landmarks 11, 13, 15 for shoulder flexion).
2. **Threshold Verification**:
   *   **Default Threshold**: `0.5`
   *   Before calculating any vector dot-product or rendering coordinates, each required landmark must have a confidence score $v \ge \text{threshold}$.
3. **Low Confidence Frame Handling**:
   *   If any required landmark falls below the threshold, the system ignores the frame and pauses kinematics tracking.
   *   The pipeline waits for a valid frame containing high-confidence landmarks before resuming calculations.
4. **User Guidance Messages**:
   *   If landmark confidence remains below threshold for more than `150 consecutive frames` (approx. 5 seconds at 30 FPS), the UI must display a user instruction card: *"Low visibility. Ensure your full body is in frame, lighting is bright, and no objects block the camera."*
5. **Configurability**: In future versions, this threshold must be configurable via an environment variable (`NEXT_PUBLIC_LANDMARK_CONFIDENCE_THRESHOLD`), allowing fine-tuning without code changes.

---

## 6. Assessment State Machine

Every assessment session follows a rigid frontend state lifecycle. The application must proceed sequentially and is **strictly prohibited from skipping validation states** before starting calculations.

```
[Idle] ──► [Assessment Selected] ──► [Instruction Screen] ──► [Camera Permission]
                                                                     │
[Assessment Running] ◄── [Pose Validation] ◄── [Camera Position] ◄────┘
        │
        ▼
[Movement Complete] ──► [Assessment Review] ──► [Save Assessment]
```

### State Behaviors and Transition Rules

| State | Purpose | Expected Behavior / Transitions |
| :--- | :--- | :--- |
| **Idle** | Default starting state. | System waits for patient interaction on the portal. |
| **Assessment Selected** | Active assessment type loaded. | The UI loads specific assessment parameters (e.g., SA001 - Shoulder Abduction). |
| **Instruction Screen** | Guides patient on exercise execution. | Renders instructions, plane guides (Front/Side), and calibration target shapes. Transition is manual (patient clicks "Ready"). |
| **Camera Permission** | Check webcam device access. | Prompts browser camera permission dialog. On accept: transition to camera check. On decline: return to Idle with error notification. |
| **Camera Position Validation** | Verify distance guidelines. | Analyzes the frame size and scales. Validates that patient stands at the target distance of 2-3 meters. |
| **Pose Validation** | Verify marker visibility. | Verifies all required landmarks for the exercise have a confidence level $\ge 0.5$. Once stable for 60 consecutive frames, transition to running. |
| **Assessment Running** | Kinematics tracking active. | Triggers live client-side joint angle calculations, records valid frames sequence array, and renders the skeleton overlay. |
| **Movement Complete** | Exercise execution finished. | Triggered after patient completes the range of motion and holds peak angle for 2 seconds (verified via stationary angle check over 60 frames). |
| **Assessment Review** | Patient local review. | Displays calculated peak range of motion (ROM) and classification. Prompt patient to re-record or submit. |
| **Save Assessment** | Persistence of logs. | Posts landmark coordinates sequence to `/ai/analyze`, receives analysis metadata, and saves JSON fields via Express backend to MongoDB. |
| **Doctor Dashboard** | Clinician assessment review. | Doctor accesses records via patient portal, views assessment curves, and adds clinical remarks. |
| **Clinical Report** | Clinical PDF generation. | Triggers PDF compiling, writes report document locally, and saves file paths details in MongoDB. |
