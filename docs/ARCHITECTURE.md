# Flexion AI System Architecture

## Architecture Overview

Flexion AI follows a modular, service-oriented architecture where each service has a single responsibility.

The application is divided into three major parts:

1. Frontend
2. Backend
3. AI Service

Each service can be developed, tested, and maintained independently.

---

# High-Level Architecture

Patient

↓

Frontend (Next.js)

↓

REST API

↓

Express Backend

↓

MongoDB

AI Processing

↓

FastAPI

↓

MediaPipe Pose

↓

OpenCV

↓

Joint Angle Calculation

↓

Range of Motion Analysis

↓

JSON Response

↓

Frontend

↓

Doctor Dashboard

---

# Communication Flow

Frontend ↔ Express Backend

Purpose:
- Authentication
- Patient Management
- Doctor Management
- Reports
- History

---

Frontend ↔ FastAPI

Purpose:
- Webcam Frames
- Pose Detection
- Joint Angles
- ROM

---

FastAPI → Express Backend

Purpose:
- Save Assessment Results

---

Express Backend ↔ MongoDB

Purpose:
- Store Application Data

---

# Service Responsibilities

Frontend

Responsible for

- UI
- Authentication
- Dashboard
- Webcam
- Reports

---

Backend

Responsible for

- APIs
- Business Logic
- JWT
- MongoDB
- Report Management

---

AI Service

Responsible for

- Pose Detection
- Landmark Extraction
- Joint Angles
- ROM
- Movement Analysis

---

# Design Principles

- Modular
- Scalable
- Maintainable
- Reusable
- Independent AI Service
- RESTful Communication