# Flexion AI – Remote Musculoskeletal Screening and Real-Time Pose Estimation

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Tasks%20Vision-blueviolet.svg)](https://google.github.io/mediapipe/)

Flexion AI is a HIPAA-compliant, AI-powered healthcare web platform designed to facilitate remote musculoskeletal (MSK) screening and assessment. By utilizing a standard webcam and markerless human pose estimation, the platform enables physiotherapists and doctors to measure patient joint Range of Motion (ROM), track posture stability, and generate clinical reports without requiring specialized diagnostic hardware.

---

## 🏥 The Healthcare Problem

Musculoskeletal (MSK) conditions affect over 1.71 billion people globally. Standard clinical evaluations require in-person visits where physiotherapists use physical goniometers to measure joint angles. 

This workflow suffers from several critical barriers:
*   **Accessibility Constraints**: Patients with mobility limitations, rural residents, and elderly individuals face high transport costs and discomfort during travel.
*   **Subjective Loggings**: Goniometric measurements can vary significantly between clinicians.
*   **Continuity Obstacles**: Clinicians lack objective data regarding home exercise compliance and recovery progress between appointments.

Flexion AI addresses these problems by providing an accessible, objective, and remote biomechanics screening suite that works on standard consumer laptops.

---

## 🎯 Project Objectives

*   **Objective Biomechanics**: Calculate joint kinematics and Range of Motion (ROM) dynamically.
*   **Hybrid AI Execution**: Minimize server workload and network overhead by performing pose landmark extraction client-side.
*   **Stateless Computations**: Build a stateless FastAPI engine that processes sequence arrays without caching raw video files, protecting patient privacy.
*   **Actionable Clinical Reporting**: Compile diagnostic metrics and doctor notes into PDF reports stored securely.

---

## ✨ Features

*   **Markerless Pose Tracking**: Uses client-side WebAssembly Google MediaPipe Pose to extract 33 skeletal coordinates at 30 FPS.
*   **Live Kinematics Goniometry**: Runs vector dot-product calculations on screen, rendering real-time skeleton overlays and angle trackers.
*   **Structured Calibration States**: Features a 12-state frontend execution machine ensuring camera distance (2-3m) and landmark confidence ($\ge 0.5$) before starting assessments.
*   **Clinician Dashboards**: Provides medical specialists with history views, dynamic ROM curves, and diagnostic comment fields.
*   **Automated PDF Reporting**: Generates localized PDF clinical summaries mapped directly to database records.

---

## ⚡ Current Development Status

*   **Milestone 1 (Project Foundation) [COMPLETED]**: Root monorepo structure, Node/Express backend, FastAPI python service, Next.js client layout, shared TypeScript type contracts, and health endpoints verification completed and validated.
*   **Milestone 2 (Authentication) [PENDING]**: JWT security and patient/doctor registrations.

---

## 🛠️ Technology Stack

### Frontend Client
*   **Framework**: Next.js 14 (App Router) & React 18
*   **Styling & UI**: Tailwind CSS (Medical dark mode theme)
*   **Animations**: GSAP (Micro-interactions and calibration guidelines)
*   **Computer Vision**: Google MediaPipe Tasks Vision (Pose Landmarker WebAssembly)
*   **Type Safety**: TypeScript 5.5

### Backend Services
*   **Server Engine**: Node.js & Express.js
*   **AI Analytics Engine**: Python 3.13 & FastAPI
*   **Scientific Libraries**: NumPy (Euclidean kinematics calculations)
*   **Database layer**: MongoDB & Mongoose ODM

---

## 📐 System Architecture

Flexion AI operates as a decoupled microservices architecture coordinated via REST APIs:

```
[Webcam Stream]
       │
       ▼
[Next.js Client] ──(MediaPipe WASM)──► Landmark Coordinates (x,y,z)
       │                                     │
       │ (REST POST /ai/analyze)             │ (REST POST /api/v1/assessment/save)
       │ Header: X-AI-SERVICE-KEY            │ Header: Authorization (JWT)
       ▼                                     ▼
[FastAPI AI Service] ──────────► [Express Backend Server]
 (ROM, Jitter calculations)            (Authentication, MVC handlers)
                                             │
                                             ▼
                                     [MongoDB Atlas]
```

---

## 🔄 Assessment State Workflow

The frontend validation and execution cycle runs through a sequential state machine:

```
[Idle]
  │
  ▼
[Assessment Selected]
  │
  ▼
[Instruction Screen] (Dynamic Side/Front view camera guide display)
  │
  ▼
[Camera Permission] (Verify device webcam connections)
  │
  ▼
[Camera Position Validation] (Verify patient is standing 2-3 meters back)
  │
  ▼
[Pose Validation] (Ensure key joints have landmark visibility confidence >= 0.5)
  │
  ▼
[Assessment Running] (Accumulate valid frames coordinates and track live angles)
  │
  ▼
[Movement Complete] (Detect peak angle hold for 2 seconds)
  │
  ▼
[Assessment Review] (Display ROM metrics locally for patient approval)
  │
  ▼
[Save Assessment] (Send coordinates to FastAPI, persist response via Express)
```

---

## 📂 Folder Structure

```
flexion-ai/
├── shared/                         # Shared packages
│   └── types/                      # Common TypeScript interfaces
├── frontend/                       # Next.js App Router client
│   ├── app/                        # Route group directories (public, auth, patient, doctor)
│   ├── components/                 # UI components (Navbar, Footer)
│   ├── services/                   # API request configurations
│   └── styles/                     # Tailwind globals.css styles
├── backend/                        # Node.js/Express MVC API
│   ├── src/
│   │   ├── config/                 # DB connectors & env loaders
│   │   ├── middleware/             # Audit logging, security, errors
│   │   ├── routes/                 # Express versioned routers
│   │   └── utils/                  # Decoupled utility packages (jwt, pdf)
└── ai-service/                     # FastAPI processing engine
    ├── main.py                     # App instance entrypoint
    └── app/
        ├── api/                    # Versioned health routers
        ├── core/                   # Mathematical geometry modules
        └── config/                 # Pydantic settings configuration
```

---

## 🖼️ Project Screenshots

*(Placeholders for future UI screenshots)*

| Screening Suite Layout | Clinician Dashboard |
| :--- | :--- |
| ![Screening Placeholder](https://via.placeholder.com/600x400/141820/ffffff?text=Screening+Calibration+Overlay) | ![Dashboard Placeholder](https://via.placeholder.com/600x400/141820/ffffff?text=Clinician+Patient+ROM+Charts) |

---

## 🚀 Installation & Running Guide

### 1. Setup Environments
Copy environmental configuration templates in each project directory:
```bash
# Root
cp .env.example .env

# Services
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp ai-service/.env.example ai-service/.env
```

### 2. Install Packages
Run dependencies installations from the root folder:
```bash
# Root and Node packages
npm install
npm run install:all

# Python virtual environment (from ai-service folder)
cd ai-service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd ..
```

### 3. Launch Development Servers
```bash
# Starts Next.js (3000), Express (5000), and FastAPI (8000) concurrently
npm run dev:all
```

---

## 🗺️ Roadmaps

### Semester 7 (MVP 70% Scope)
- [x] **Milestone 1**: Project Foundation (decisions, monorepos, security, health endpoints).
- [ ] **Milestone 2**: Authentication (JWT credentials validation, signup/login portal roles).
- [ ] **Milestone 3**: Patient Portal (dashboards, screening selects).
- [ ] **Milestone 4**: Doctor Portal (diagnostics comments, lists views).
- [ ] **Milestone 5**: AI Pose Detection client overlays.
- [ ] **Milestone 6**: Client-side Joint angle algorithms.
- [ ] **Milestone 7**: FastAPI ROM and limitation classifications.
- [ ] **Milestone 8**: Save and retrieve history records sync.
- [ ] **Milestone 9**: Backend PDF report printing.

### Semester 8 (Advanced Features 30% Scope)
- [ ] **Milestone 10**: WebRTC live telehealth camera sharing consults.
- [ ] **Milestone 11**: Real-time exercise repetition counting and advanced scorecards.
- [ ] **Milestone 12**: Cloud PDF Storage mapping.
- [ ] **Milestone 13**: Docker container setups and production cloud deployments.

---

## 🔮 Future Scope
*   **Injury Risk Prediction**: Integrate deep learning layers on landmark histories to forecast injury tendencies.
*   **Mobile Companion App**: Port goniometry capabilities to iOS/Android using React Native and MediaPipe mobile libraries.
*   **Electronic Health Record (EHR) Sync**: Integrate with standard clinical databases using HL7 FHIR protocols.

---

## 👨‍💻 Contributors

*   **Lead Full Stack & AI Engineer**: Priyanka Durvesh ([GitHub Profile](https://github.com/))
*   **Project Advisor**: [Advisor Name] (Department of Computer Engineering)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💖 Acknowledgements

*   Google MediaPipe team for the web Pose Landmarker library.
*   American Academy of Orthopaedic Surgeons (AAOS) for joint kinematic range indexes.
