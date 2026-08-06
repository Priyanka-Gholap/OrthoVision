# Development Rules

## Architecture

- Follow Clean Architecture.
- Follow MVC Architecture for the backend.
- Follow a Hybrid AI Architecture:
  - Frontend (Client-side): Captures webcam, loads MediaPipe Tasks Vision, computes skeletal landmarks, and calculates live joint angles.
  - AI Service (Server-side): Asynchronously receives landmarks and metadata via REST, computes Range of Motion (ROM), analyses movements, and outputs classification logs.
- Keep FastAPI completely independent from Express.
- Never mix AI logic with backend business logic.

---

## Coding Rules

- Use TypeScript for frontend and backend.
- Use Python for AI modules.
- Never place business logic inside routes.
- Use controllers and services.
- Create reusable utility functions.
- Avoid duplicate code.
- Follow SOLID principles.

---

## Folder Rules

Frontend

- app/
- components/
- hooks/
- services/
- lib/
- types/

Backend

- routes/
- controllers/
- services/
- middleware/
- models/
- config/
- utils/

AI Service

- pose/
- rom/
- posture/
- report/
- utils/

---

## Security

- JWT Authentication for patient and doctor access.
- Password Hashing (bcrypt).
- Input Validation.
- Environment Variables.
- Internal Service Security (Semester 7): Secure all inter-service REST endpoints between FastAPI and Express backend using the internal API key header (`X-AI-SERVICE-KEY`).
- Service Security (Semester 8): Upgrade to secure machine-to-machine service authentication.

---

## Database

- MongoDB
- Mongoose ODM
- Proper Schema Validation

---

## UI Rules

- Responsive
- Healthcare Theme
- Minimal Design
- Accessible
- Professional
- GSAP Animations where appropriate
- Bounding Box and Calibration overlays before starting assessments
- The frontend must enforce a sequential assessment state machine; skipping validation states is strictly prohibited.
- Display clear on-screen warnings if required landmark confidence remains low for 150 consecutive frames.

---

## AI Rules

- Return JSON responses.
- Never capture, stream, or store raw webcam video on the server.
- Web-browser must extract landmarks using client-side MediaPipe Tasks Vision.
- The system must verify landmark confidence scores (default threshold: 0.5, configurable in future versions) before calculating joint angles.
- Ignore frames with required landmark confidence below the threshold and wait for high-confidence input before resuming.
- Continuous webcam frame uploads to FastAPI are strictly forbidden. Only structured landmark coordinates and metadata should be POSTed.
- Keep the FastAPI service completely stateless.
- Separate AI calculations into independent modules.

---

## Deployment

Deployment is NOT required during Semester 7.

Design the project so Docker can be added later without changing the architecture.

---

## General Rules

- Production-quality code only.
- Explain architectural decisions.
- Never use mock data unless requested.
- Keep the code modular and scalable.