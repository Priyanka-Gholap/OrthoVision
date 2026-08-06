# Database Design

Database

MongoDB

ODM

Mongoose

---

# Collections

## Users

Purpose

Store authentication information.

Fields

- _id
- fullName
- email
- password
- role
- createdAt
- updatedAt

Roles

- Patient
- Doctor

---

## Patients

Purpose

Store patient profile information.

Fields

- patientId
- doctorId
- age
- gender
- height
- weight
- medicalHistory
- createdAt

---

## Doctors

Purpose

Store doctor profile.

Fields

- doctorId
- specialization
- hospital
- experience
- createdAt

---

## Assessments

Purpose

Store every AI assessment.

Fields

- assessmentId
- patientId
- doctorId
- jointAngles
- rom
- postureScore
- movementAnalysis
- assessmentDate

---

## Reports

Purpose

Store generated reports.

Fields

- reportId
- assessmentId
- remarks
- reportURL
- generatedAt

---

# Future Collections

Appointments

Exercises

Notifications

ProgressHistory

AuditLogs

---

# Relationships

Doctor

↓

Patients

↓

Assessments

↓

Reports

One Doctor

↓

Many Patients

One Patient

↓

Many Assessments

One Assessment

↓

One Report