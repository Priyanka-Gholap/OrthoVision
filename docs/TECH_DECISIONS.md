# Technical Decisions

This document records important technical decisions made during the development of Flexion AI.

---

## Why Next.js?

Reason

- Better routing
- Better project organization
- Excellent React ecosystem
- Future scalability

Decision

Approved

---

## Why TypeScript?

Reason

- Better type safety
- Easier debugging
- Cleaner codebase
- Industry standard

Decision

Approved

---

## Why Express.js?

Reason

- Lightweight
- Large ecosystem
- Easy REST API development
- Works well with MongoDB

Decision

Approved

---

## Why FastAPI?

Reason

- High performance
- Excellent Python support
- Easy MediaPipe integration
- Automatic API documentation

Decision

Approved

---

## Why MediaPipe?

Reason

- Real-time pose estimation
- Markerless tracking
- Lightweight
- Highly accurate for webcam-based applications

Decision

Approved

---

## Why OpenCV?

Reason

- Image preprocessing
- Frame manipulation
- Computer vision utilities

Decision

Approved

---

## Why MongoDB?

Reason

- Flexible schema
- Stores nested assessment data easily
- Suitable for healthcare records

Decision

Approved

---

## Why Separate AI Service?

Reason

- Better scalability
- Easier maintenance
- Independent deployment
- Cleaner architecture

Decision

Approved

---

## Why Semester-wise Development?

Semester 7

Focus on

- Working MVP
- Core AI
- Dashboard
- Reports

Semester 8

Focus on

- Advanced AI
- Deployment
- Optimization
- Telehealth Features

Decision

Approved


## AI Processing Strategy (Hybrid AI Architecture)

Reason

- Eliminates server network bottlenecks: Continuous webcam frame uploads to FastAPI are prohibited, avoiding massive network load.
- Real-time client-side feedback: MediaPipe Tasks Vision runs inside the patient's browser, providing zero-latency skeleton rendering and live joint angle calculations.
- Decoupled server operations: FastAPI acts as a stateless analysis engine that receives a structured JSON payload of coordinates and metadata *only* after assessment completion to calculate ROM, movement anomalies, and classification levels.

Decision

Approved

---

## PDF Storage Strategy

Semester 7 (MVP)

- Store generated PDF reports locally inside the backend reports directory (`/backend/reports`).
- MongoDB stores only the document metadata and local file paths (e.g. `reportURL: "/reports/filename.pdf"`).
- Reduces initial cloud infrastructure configuration complexity, allowing focus on core kinematics features.

Semester 8

- Migrate storage to secure cloud object storage (e.g. AWS S3) with JWT-gated access control.

Decision

Approved

---

## Internal Service Security

Semester 7 (MVP)

- Authenticate FastAPI and Express backend HTTP endpoints using an internal static API Key passed via the `X-AI-SERVICE-KEY` custom header.
- The API key is stored securely in backend and AI service environment variables (`.env`).
- Protects compute-heavy endpoints and report database endpoints from external abuse.

Semester 8

- Transition to a secure service-to-service machine authentication scheme (e.g., OAuth2 or mTLS).

Decision

Approved