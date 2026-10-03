# Flexion AI Development Milestones

## Semester 7 (Target: 70%)

### Milestone 1 – Project Foundation

Status

✅ Completed

Deliverables

- Git Repository
- Next.js Setup
- Express Setup
- FastAPI Setup
- MongoDB Connection
- Environment Variables
- Documentation

---

### Milestone 2 – Authentication

Status

✅ Completed

Deliverables

- Patient Login
- Patient Registration
- Doctor Login
- Doctor Registration
- JWT Authentication

---

### Milestone 3 – Patient Portal

Status

✅ Completed

Deliverables

- Dashboard
- Profile
- Assessment History

---

### Milestone 4 – Doctor Portal

Status

✅ Completed

Deliverables

- Dashboard
- Patient List
- Assessment Viewer

---

### Milestone 5 – AI Pose Detection (Client-Side)

Status

✅ Completed

Deliverables

- Webcam Video Access & Calibration UI
- Client-side MediaPipe Tasks Vision Integration
- Client-side Skeleton Overlays & Coordinate Extraction

---

### Milestone 6 – Joint Angle Calculation (Client-Side)

Status

✅ Completed

Deliverables

- Live client-side joint angle calculations (Elbow, Shoulder, Hip, Knee, Neck)

---

### Milestone 7 – ROM Analysis & Movement Metrics

Status

🔄 In Progress (Assessment Guidance & UX Verification)

Deliverables

- Continuous smoothed joint-angle assessment measurement lifecycle (Start / Stop)
- Clinical Range of Motion (ROM) calculation (Starting, Ending, Min, Max, Peak ROM, Movement Range)
- Valid frame counting & assessment duration metrics
- Clinical classification against reference ranges (Normal, Mild, Moderate, Severe Limitation)
- Assessment positioning and movement guidance for all six movements:
  - camera orientation guidance (Side View vs Front View)
  - starting posture instructions
  - movement instructions
  - testing-side guidance (Left vs Right presenting side)
  - visual reference guidance (silhouettes, movement direction arrows, target joint highlight)
  - live readiness feedback checklist (body detected, joints visible, orientation aligned, position ready)
- Assessment Result UI Card with empty/insufficient movement data error handling and normative benchmark wording

---

### Milestone 8 – Backend Integration & Security

Status

⬜ Not Started

Deliverables

- REST connection from frontend to FastAPI (no video uploads)
- X-AI-SERVICE-KEY API Key authentication setup
- MongoDB storage of Assessment logs
- Patient History retrieval endpoint

---

### Milestone 9 – Clinical Reports

Status

⬜ Not Started

Deliverables

- Local PDF Reports generation on backend server
- Store PDF file paths and metadata in MongoDB
- Assessment Summary & Doctor Remarks insertion

---

### Semester 7 MVP

Status

⬜ Not Started

Goal

Complete approximately 70% of the project with a fully functional AI-powered healthcare application.

---

# Semester 8 (Remaining 30%)

### Milestone 10 – Telehealth Features

- WebRTC Video Consultation
- Live Doctor Session

---

### Milestone 11 – Advanced AI

- Exercise Recognition
- Repetition Counter
- AI Movement Score
- Progress Analytics

---

### Milestone 12 – Deployment

- Docker
- Docker Compose
- Cloud Deployment
- Performance Optimization
- Final Testing