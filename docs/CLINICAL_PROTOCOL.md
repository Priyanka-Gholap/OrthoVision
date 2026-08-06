# Clinical Protocol

## Project

Flexion AI – Remote Musculoskeletal Screening and Real-Time Pose Estimation for Telehealth

---

# Purpose

This document defines the clinical assessment protocol used by Flexion AI.

The AI system does not diagnose diseases.

Instead, it performs biomechanical measurements by:

- Detecting body landmarks
- Calculating joint angles
- Measuring Range of Motion (ROM)
- Comparing measurements against reference ranges
- Providing movement analysis for doctors

The generated results are intended to assist healthcare professionals and should not replace clinical judgment.

---

# Assessment Workflow (State Machine Lifecycle)

Idle (Waiting for selection)

↓

Assessment Selected (Type parameters loaded)

↓

Instruction Screen (Display plane guide, instructions, calibration templates)

↓

Camera Permission (Prompt browser request, verify webcam connect)

↓

Camera Position Validation (Analyze frame, verify user is 2-3 meters away)

↓

Pose Validation (Verify required landmarks confidence >= 0.5 for 60 frames)

↓

Assessment Running (Track motion, render canvas overlay, calculate angles)

↓

Movement Complete (Peak angle held for 2 seconds)

↓

Assessment Review (Present ROM metrics locally for patient confirmation)

↓

Save Assessment (Post logs to FastAPI, persist response via Express to DB)

↓

Doctor Dashboard (Clinician assessment history review)

↓

Clinical Report (Generate clinical report PDF with doctor remarks)

---

# Assessment Protocol

Initially, Flexion AI will support the following assessments. Before starting any assessment, the frontend must display dynamic camera placement instructions indicating the required view and distance to calibrate the sensor feed.

---

## 1. Shoulder Flexion

Purpose

Measure the ability to raise the arm forward.

Camera Orientation

Side View (Sagittal Plane)

Patient Instruction

"Stand sideways to the camera. Raise your arm straight in front of you as high as possible."

MediaPipe Landmarks

- Shoulder
- Elbow
- Wrist

Joint Angle

Shoulder Angle

Reference ROM

160° – 180°

Classification

Normal

160° – 180°

Mild Limitation

140° – 159°

Moderate Limitation

120° – 139°

Severe Limitation

Below 120°

---

## 2. Shoulder Abduction

Purpose

Measure the ability to raise the arm sideways.

Camera Orientation

Front View (Frontal Plane)

Patient Instruction

"Stand facing the camera. Raise your arm sideways until comfortable."

Landmarks

- Shoulder
- Elbow
- Wrist

Reference ROM

160° – 180°

Classification

Normal

160° – 180°

Mild

140° – 159°

Moderate

120° – 139°

Severe

Below 120°

---

## 3. Elbow Flexion

Purpose

Measure elbow bending.

Camera Orientation

Side View (Sagittal Plane)

Patient Instruction

"Stand sideways to the camera. Bend your elbow completely."

Landmarks

- Shoulder
- Elbow
- Wrist

Reference ROM

145° – 150°

Classification

Normal

145° – 150°

Mild

130° – 144°

Moderate

110° – 129°

Severe

Below 110°

---

## 4. Knee Flexion

Purpose

Measure knee bending.

Camera Orientation

Side View (Sagittal Plane)

Patient Instruction

"Stand sideways to the camera. Bend your knee as much as possible."

Landmarks

- Hip
- Knee
- Ankle

Reference ROM

130° – 135°

Classification

Normal

130° – 135°

Mild

115° – 129°

Moderate

90° – 114°

Severe

Below 90°

---

## 5. Hip Flexion

Purpose

Measure hip movement.

Camera Orientation

Side View (Sagittal Plane)

Patient Instruction

"Stand sideways to the camera. Lift your knee toward your chest."

Landmarks

- Shoulder
- Hip
- Knee

Reference ROM

110° – 120°

Classification

Normal

110° – 120°

Mild

95° – 109°

Moderate

80° – 94°

Severe

Below 80°

---

## 6. Neck Rotation

Purpose

Measure neck mobility.

Camera Orientation

Front View (Frontal Plane)

Patient Instruction

"Stand facing the camera. Turn your head to the left and then to the right."

Landmarks

- Nose
- Left Shoulder
- Right Shoulder

Reference ROM

70° – 80°

Classification

Normal

70° – 80°

Mild

60° – 69°

Moderate

45° – 59°

Severe

Below 45°

---

# Joint Angle Calculation

The AI calculates joint angles using three landmarks.

Example

Shoulder

Shoulder

↓

Elbow

↓

Wrist

The angle is calculated using vector mathematics.

MediaPipe provides the landmark coordinates.

Flexion AI calculates the angle.

---

# Range of Motion (ROM)

ROM is calculated as the maximum joint angle achieved during an assessment.

Example

Maximum Shoulder Angle

172°

Reference

180°

ROM Percentage

95.5%

---

# Movement Quality Analysis

Movement quality is determined using multiple factors.

Current Parameters

- ROM
- Left vs Right Symmetry
- Movement Stability
- Landmark Confidence

Future Parameters

- Movement Smoothness
- Speed
- Tremor Detection
- Balance Analysis

---

# Assessment Result Levels

Normal

Movement is within expected reference range.

Mild Limitation

Slight reduction in movement.

Moderate Limitation

Noticeable reduction in movement.

Severe Limitation

Significant restriction of movement.

---

# AI Output Format

The AI service should return structured JSON.

Example

{
    "assessment": "Shoulder Flexion",
    "jointAngle": 167.4,
    "rom": 167.4,
    "referenceMin": 160,
    "referenceMax": 180,
    "classification": "Normal",
    "confidence": 0.97,
    "timestamp": "2026-08-06T10:30:00Z"
}

---

# Semester 7 Scope

The AI module will support:

- Pose Detection
- Skeleton Rendering
- Joint Angle Calculation
- ROM Analysis
- Assessment Classification
- JSON Output
- Report Generation

---

# Semester 8 Enhancements

Future improvements include:

- Exercise Recognition
- Repetition Counter
- Real-Time Exercise Feedback
- Progress Tracking
- AI Movement Quality Score
- Rehabilitation Recommendations
- Explainable AI
- Multi-Joint Analysis

---

# Medical Disclaimer

Flexion AI is an educational and research-oriented project developed for remote musculoskeletal assessment.

The system provides biomechanical measurements and movement analysis to assist healthcare professionals.

It is **not** intended to diagnose diseases or replace professional medical judgment.

All clinical decisions remain the responsibility of qualified healthcare professionals.

---

# References

Reference ranges should be verified using trusted orthopedic and physiotherapy sources before final submission.

Examples include:

- American Academy of Orthopaedic Surgeons (AAOS)
- American Physical Therapy Association (APTA)
- Clinical Goniometry Guidelines
- Musculoskeletal Assessment Textbooks