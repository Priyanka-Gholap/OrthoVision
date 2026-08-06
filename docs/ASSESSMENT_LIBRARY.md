# Assessment Library

## Project

Flexion AI – Remote Musculoskeletal Screening and Real-Time Pose Estimation for Telehealth

---

# Purpose

This document defines all musculoskeletal assessments supported by Flexion AI.

Each assessment includes:

- Assessment Name
- Clinical Purpose
- Body Position
- Patient Instructions
- MediaPipe Landmarks
- Joint Angle Calculation
- Reference ROM
- Classification
- Expected Output

---

# Assessment 1

## Shoulder Flexion

### Assessment ID

SF001

### Category

Upper Limb

### Clinical Purpose

Measure the patient's ability to raise the arm forward.

### Body Position

Standing upright, side view relative to camera (sagittal plane)

### Patient Instructions

1. Stand straight, sideways to the camera.
2. Keep your elbow extended.
3. Slowly raise your arm in front of your body.
4. Raise as high as comfortably possible.
5. Hold the final position for 2 seconds.

### Required Landmarks

- Left Shoulder
- Left Elbow
- Left Wrist

or

- Right Shoulder
- Right Elbow
- Right Wrist

### Joint Angle

Shoulder Angle

### Normal ROM

160°–180°

### Classification

Normal

160°–180°

Mild Limitation

140°–159°

Moderate Limitation

120°–139°

Severe Limitation

Below 120°

### AI Output

- Joint Angle
- ROM
- Classification
- Confidence Score

---

# Assessment 2

## Shoulder Abduction

Assessment ID

SA001

Category

Upper Limb

Clinical Purpose

Measure side arm elevation.

Body Position

Standing, facing the camera (frontal plane)

Patient Instructions

1. Stand straight, facing the camera.
2. Raise your arm sideways until comfortable.

Required Landmarks

Shoulder

Elbow

Wrist

Reference ROM

160°–180°

Output

- Angle
- ROM
- Classification

---

# Assessment 3

## Elbow Flexion

Assessment ID

EF001

Category

Upper Limb

Clinical Purpose

Measure elbow bending.

Body Position

Standing or Sitting, side view relative to camera (sagittal plane)

Instructions

1. Stand sideways to the camera.
2. Bend your elbow completely.

Landmarks

Shoulder

Elbow

Wrist

Reference ROM

145°–150°

Output

- Angle
- ROM
- Classification

---

# Assessment 4

## Knee Flexion

Assessment ID

KF001

Category

Lower Limb

Clinical Purpose

Measure knee bending.

Body Position

Standing, side view relative to camera (sagittal plane)

Instructions

1. Stand sideways to the camera.
2. Bend your knee as much as possible.

Landmarks

Hip

Knee

Ankle

Reference ROM

130°–135°

Output

- Angle
- ROM
- Classification

---

# Assessment 5

## Hip Flexion

Assessment ID

HF001

Category

Lower Limb

Clinical Purpose

Measure hip mobility.

Body Position

Standing, side view relative to camera (sagittal plane)

Instructions

1. Stand sideways to the camera.
2. Lift one knee towards your chest.

Landmarks

Shoulder

Hip

Knee

Reference ROM

110°–120°

Output

- Angle
- ROM
- Classification

---

# Assessment 6

## Neck Rotation

Assessment ID

NR001

Category

Cervical Spine

Clinical Purpose

Measure neck mobility.

Body Position

Standing, facing the camera (frontal plane)

Instructions

1. Stand facing the camera.
2. Rotate your head to the left and then to the right.

Landmarks

Nose

Left Shoulder

Right Shoulder

Reference ROM

70°–80°

Output

- Rotation Angle
- Classification

---

# Common AI Processing Pipeline (State Machine Lifecycle)

Idle (Waiting for selection)

↓

Assessment Selected (Parameters loaded)

↓

Instruction Screen (Display plane guide, calibration guidelines)

↓

Camera Permission (Prompt user, verify webcam)

↓

Camera Position Validation (Ensure user stands 2-3 meters away)

↓

Pose Validation (Verify required landmarks confidence >= 0.5)

↓

Assessment Running (Track joints, render skeleton, compute angles)

↓

Movement Complete (Hold peak angle for 2 seconds)

↓

Assessment Review (Display ROM and classification locally)

↓

Save Assessment (Serialize coordinates payload, send to FastAPI, save DB)

↓

Doctor Dashboard (Clinician view of logs and curves)

↓

Clinical Report (PDF generation with clinician comments)

---

# Camera Guidelines

Camera Position

Front View

Distance

2–3 meters

Lighting

Bright

Background

Plain

Entire body visible

Minimum FPS

30 FPS

Resolution

720p or above

---

# Assessment Rules

- Only one assessment can run at a time.
- Patient must remain fully visible.
- The system must verify landmark confidence before calculating angles.
- Ignore frames with poor landmark confidence (visibility score < 0.5 for required landmarks).
- Wait for a high-confidence frame to resume calculation.
- Display a warning overlay to the user if required landmark confidence remains below 0.5 for 150 consecutive frames.
- Bounding Box and plane-of-motion validations must not be skipped.
- Capture the maximum ROM achieved during the assessment.

---

# Future Assessments (Semester 8)

- Squat Assessment
- Lunge Assessment
- Sit-to-Stand Test
- Balance Test
- Gait Analysis
- Shoulder Internal Rotation
- Shoulder External Rotation
- Wrist Flexion
- Wrist Extension
- Ankle Dorsiflexion
- Ankle Plantarflexion

---

# Assessment Naming Convention

SF = Shoulder Flexion

SA = Shoulder Abduction

EF = Elbow Flexion

KF = Knee Flexion

HF = Hip Flexion

NR = Neck Rotation

---

# Notes

The assessment library defines the complete list of movements supported by Flexion AI.

Any new assessment must be added to this document before implementation to maintain consistency across the frontend, AI service, backend, reports, and documentation.