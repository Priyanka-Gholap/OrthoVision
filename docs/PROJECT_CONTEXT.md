# Flexion AI - Project Context

## Project Name

Flexion AI – Remote Musculoskeletal Screening and Real-Time Pose Estimation for Telehealth

---

# Project Goal

Develop an AI-powered healthcare web application that enables doctors and physiotherapists to remotely assess patients with musculoskeletal (MSK) conditions using only a standard webcam.

The system captures live webcam video, performs markerless human pose estimation using Google MediaPipe Pose, calculates joint angles and Range of Motion (ROM), analyzes posture and movement quality, stores patient assessment history, and generates digital clinical reports.

The project should follow industry-standard software engineering practices while remaining suitable for a final-year engineering major project.

---

# Target Users

- Patient
- Doctor
- Administrator (Future)

---

# Semester 7 Goal (70%)

Build a fully functional MVP including:

- Authentication (JWT)
- Patient Dashboard
- Doctor Dashboard
- Webcam Integration (Client-side)
- Hybrid AI Architecture:
  - Client-side (MediaPipe Tasks Vision, Pose Detection, Live Joint Angle Calculation)
  - Server-side FastAPI (ROM Analysis, Movement Analysis, Classification)
- Assessment History
- Clinical Report Generation (Local PDF storage inside backend reports directory; MongoDB stores metadata and file paths)
- Internal Service Security (API Key: X-AI-SERVICE-KEY)
- MongoDB Integration

The focus is on developing a working healthcare application rather than deployment.

---

# Semester 8 Goal (Remaining 30%)

Enhance the project with:

- WebRTC Video Consultation (WebSockets Telehealth)
- Exercise Recognition
- Repetition Counter
- AI Movement Quality Analysis
- Progress Analytics
- AI Clinical Summary
- Notifications
- Cloud PDF Storage
- Docker & Docker Compose
- Cloud Deployment
- Performance Optimization

---

# Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- GSAP
- Google MediaPipe Tasks Vision (Pose Detection)

## Backend

- Node.js
- Express.js
- Mongoose (MongoDB ODM)

## AI Service

- Python
- FastAPI
- NumPy (Vector calculations)

## Database

- MongoDB

## Development

- Git
- GitHub
- Postman

## Deployment (Semester 8)

- Docker
- Docker Compose
- Cloud Deployment

---

# Architecture

Frontend (MediaPipe Tasks Vision, Pose Detection, Live Joint Angle Calculation)

↓ (Sends extracted landmarks & metadata via REST)

FastAPI AI Service (ROM & Movement Analysis, Classification)

↓ (Internal API Key Authentication: X-AI-SERVICE-KEY)

Express Backend (Auth, Business Logic, Local PDF reports storage)

↓ (Mongoose ODM)

MongoDB (Metadata and local file paths)

Communication

Frontend ↔ Express Backend: Authentication, patient/doctor details, assessment save, report retrieval.

Frontend ↔ FastAPI: Sending landmark coordinates and assessment metadata (no video frame uploads allowed); receiving classification and analysis JSON.

FastAPI ↔ Express Backend: Assessment updates and persistence (authenticated via X-AI-SERVICE-KEY API Key).

Express Backend ↔ MongoDB: Querying/persisting application records.

---

# Development Strategy

During Semester 7, prioritize building working features over deployment.

Complete approximately 70% of the project with all core AI functionality.

Deployment, Docker, cloud infrastructure, and optimization will be implemented during Semester 8.

---

# Software Engineering Standards

- Clean Architecture
- SOLID Principles
- Modular Design
- Reusable Components
- REST APIs
- TypeScript
- Environment Variables
- Validation
- Secure Authentication
- Scalable Code
- Production-quality implementation

---

# AI Processing Strategy

Flexion AI follows a hybrid AI architecture.

Browser Responsibilities

- Webcam Access
- MediaPipe Tasks Vision
- Pose Detection
- Skeleton Rendering
- Landmark Extraction
- Live Joint Angle Calculation

FastAPI Responsibilities

- Range of Motion Analysis
- Movement Analysis
- Assessment Classification
- JSON Generation

Express Responsibilities

- Authentication
- Assessment Storage
- Reports
- MongoDB Operations

This architecture minimizes latency and reduces unnecessary network traffic.

# Final Objective

Build a professional AI healthcare application suitable for:

- Final Year Major Project
- IEEE Research Paper
- GitHub Portfolio
- Technical Interviews
- Project Competitions