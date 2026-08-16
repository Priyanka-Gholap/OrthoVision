# Feature Roadmap

## Project

Flexion AI – Remote Musculoskeletal Screening and Real-Time Pose Estimation for Telehealth

---

# Purpose

This roadmap defines all planned features of Flexion AI.

Features are divided into:

- Semester 7 (Minimum Viable Product - MVP)
- Semester 8 (Advanced Features)

The objective is to complete approximately 70% of the project during Semester 7 and the remaining 30% during Semester 8.

---

# Semester 7 (Target: 70%)

## Milestone 1 – Project Foundation

Priority: High

Features

- Project Structure
- Next.js Frontend Setup
- Express Backend Setup
- FastAPI AI Service Setup
- MongoDB Connection
- Environment Variables
- Git Repository
- Documentation Setup

Status

✅ Completed

---

## Milestone 2 – Authentication

Priority: High

Features

- Patient Registration
- Patient Login
- Doctor Registration
- Doctor Login
- JWT Authentication
- Protected Routes
- Role-Based Access

Status

✅ Completed

---

## Milestone 3 – Patient Portal

Priority: High

Features

- Dashboard
- Profile Management
- Assessment History
- Start Assessment
- View Reports

Status

✅ Completed

---

## Milestone 4 – Doctor Portal

Priority: High

Features

- Doctor Dashboard
- Patient List
- View Assessments
- View Reports
- Patient Search

Status

✅ Completed

---

## Milestone 5 – AI Pose Detection (Client-Side)

Priority: Critical

Features

- Webcam Access & Canvas Render
- Camera Validation & Calibration Overlays
- Browser-based MediaPipe Tasks Vision Integration
- Client-Side Skeleton Rendering
- Client-Side Landmark Coordinate Extraction

Status

✅ Completed

---

## Milestone 6 – Joint Angle Calculation (Client-Side)

Priority: Critical

Features

- Client-Side Shoulder Angle Calculation
- Client-Side Elbow Angle Calculation
- Client-Side Hip Angle Calculation
- Client-Side Knee Angle Calculation
- Client-Side Neck Angle Calculation

Status

✅ Completed

---

## Milestone 7 – Range of Motion Analysis (Server-Side FastAPI)

Priority: Critical

Features

- Server-Side ROM Calculation from Landmark Sequences
- Left vs Right Symmetry Calculation
- Assessment Classification Logic
- Server-Side Movement Stability Analysis

Status

⬜ Not Started

---

## Milestone 8 – Backend Integration

Priority: High

Features

- Connect Frontend Landmarks payload to FastAPI Analyze API
- Internal API Key Authentication (X-AI-SERVICE-KEY) for service interactions
- Save Assessment Results in Express Backend
- Fetch Assessment History
- MongoDB Integration

Status

⬜ Not Started

---

## Milestone 9 – Clinical Reports

Priority: High

Features

- Local PDF Report Generation inside backend reports folder
- Store Report Metadata and Local Paths in MongoDB
- Doctor Remarks Integration
- Patient Report History Viewer

Status

⬜ Not Started

---

## Milestone 10 – Testing & UI Improvements

Priority: Medium

Features

- Responsive Design
- Error Handling (Webcam failure, connection loss)
- Input Validation
- Loading States
- Basic GSAP Animations (for Calibration instructions)
- Integration Testing

Status

⬜ Not Started

---

# Semester 7 MVP Deliverables

By the end of Semester 7 the application should support:

✅ Patient Login (JWT)

✅ Doctor Login (JWT)

✅ Webcam Assessment & Placement Calibration (Client-Side)

✅ Pose Detection & Skeleton Rendering (Client-Side)

✅ Joint Angle Calculation (Client-Side)

✅ Range of Motion Analysis & Classification (FastAPI Server-Side)

✅ Secure Internal REST Communication (X-AI-SERVICE-KEY)

✅ Patient History

✅ Doctor Dashboard

✅ Clinical Reports (Locally Stored PDFs)

✅ MongoDB Storage (Metadata & local paths)

---

# Semester 8 (Target: Remaining 30%)

## Milestone 11 – Telehealth

Priority: High

Features

- WebRTC Video Consultation
- Live Camera Sharing
- Real-Time Session

Status

⬜ Not Started

---

## Milestone 12 – Advanced AI

Priority: High

Features

- Exercise Recognition
- Repetition Counter
- Movement Quality Score
- Symmetry Analysis
- AI Clinical Summary

Status

⬜ Not Started

---

## Milestone 13 – Rehabilitation Module

Priority: Medium

Features

- Exercise Library
- Home Exercise Plan
- Recovery Timeline
- Progress Tracking

Status

⬜ Not Started

---

## Milestone 14 – Analytics Dashboard

Priority: Medium

Features

- Progress Graphs
- ROM Trends
- Recovery Analytics
- Historical Comparison

Status

⬜ Not Started

---

## Milestone 15 – Notifications

Priority: Low

Features

- Appointment Reminder
- Assessment Reminder
- Email Notifications

Status

⬜ Not Started

---

## Milestone 16 – Deployment

Priority: Medium

Features

- Docker
- Docker Compose
- Production Build
- Cloud Deployment
- Environment Configuration

Status

⬜ Not Started

---

## Milestone 17 – Finalization

Priority: High

Features

- Performance Optimization
- Security Improvements
- Final Testing
- Bug Fixes
- Documentation Updates

Status

⬜ Not Started

---

# Future Scope (Beyond Major Project)

- Mobile Application
- AI Rehabilitation Recommendation System
- Explainable AI (XAI)
- Multi-Language Support
- Wearable Sensor Integration
- Hospital Management System Integration
- Electronic Health Record (EHR) Integration
- AI-Based Injury Risk Prediction
- Multi-Camera Motion Capture
- Cloud-Based Telehealth Platform

---

# Overall Development Timeline

Planning

↓

Project Foundation

↓

Authentication

↓

Patient Portal

↓

Doctor Portal

↓

AI Pose Detection

↓

Joint Angles

↓

ROM Analysis

↓

Backend Integration

↓

Clinical Reports

↓

Semester 7 MVP Complete

↓

Telehealth Features

↓

Advanced AI

↓

Analytics

↓

Deployment

↓

Final Major Project

---

# Success Criteria

Semester 7

- Working AI-powered MVP
- Functional Web Application
- Complete End-to-End Assessment Workflow
- Ready for Mid-Project Evaluation

Semester 8

- Complete Healthcare Platform
- Advanced AI Features
- Deployment Ready
- Final Report
- IEEE Paper
- Project Competition Ready

---

# Notes

- Every milestone must be completed and tested before starting the next milestone.
- Git commits should be created after each completed milestone.
- Any new feature must first be added to this roadmap before implementation.
- This roadmap serves as the primary development plan for the Flexion AI project.