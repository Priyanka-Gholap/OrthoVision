# API Specification

Base URLs

Backend

/api

AI Service

/ai

---

# Authentication APIs

POST /api/auth/register

Purpose

Register new user.

---

POST /api/auth/login

Purpose

Authenticate user.

---

GET /api/auth/profile

Purpose

Get logged-in user.

---

# Patient APIs

GET /api/patients

Purpose

Get all patients.

---

GET /api/patients/:id

Purpose

Get patient details.

---

PUT /api/patients/:id

Purpose

Update patient profile.

---

# Doctor APIs

GET /api/doctors

Purpose

Get doctor list.

---

GET /api/doctors/:id

Purpose

Doctor profile.

---

# Assessment APIs

POST /api/assessment/start

Purpose

Start assessment.

---

POST /api/assessment/save

Purpose

Save AI results.

---

GET /api/assessment/history

Purpose

Assessment history.

---

GET /api/assessment/:id

Purpose

Assessment details.

---

# Report APIs

POST /api/report/generate

Purpose

Generate PDF report.

---

GET /api/report/:id

Purpose

Download report.

---

# AI APIs

POST /ai/analyze

Purpose

Analyze completed assessment. Receives a sequence of extracted landmarks and assessment metadata from the client, performs Range of Motion (ROM) analysis, posture stability analysis, asymmetry checks, and assigns a classification level (e.g. Normal, Mild/Moderate/Severe Limitation).

Headers

- X-AI-SERVICE-KEY: <Internal API Key> (Required for authorization in Semester 7)

Request Body

JSON containing landmark sequence arrays and metadata.

---

GET /ai/health

Purpose

Health check endpoint.

Headers

- X-AI-SERVICE-KEY: <Internal API Key> (Required for authorization in Semester 7)