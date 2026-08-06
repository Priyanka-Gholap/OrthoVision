# Flexion AI – Error Handling Strategy

This document defines the complete error handling, logging, and recovery strategy for the Flexion AI project. It ensures that the system handles anomalies gracefully, protects Patient Health Information (PHI), and maintains system availability.

---

## 1. Purpose

In clinical and telehealth applications, robust error handling is critical for:
*   **Patient Safety**: Ensuring incorrect or corrupted kinematic readings are never used for clinical evaluations.
*   **Data Integrity**: Protecting sensitive electronic health records and reports from corruption during network dropouts or server failures.
*   **Regulatory Compliance (HIPAA/GDPR)**: Ensuring error logs do not expose Protected Health Information (PHI) to unauthorized viewers.
*   **User Confidence**: Providing patients and doctors with clear, actionable guidance instead of raw technical stacks (e.g., "Webcam permission denied" instead of `TypeError: Cannot read properties of null`).

---

## 2. Error Categories

The system classifies errors into seven architectural categories:

1.  **Frontend Errors**: Webcam issues, browser capabilities, network interruptions, and patient pose validations.
2.  **AI Service Errors**: MediaPipe initialization failures, coordinate processing errors, and geometry logic failures.
3.  **Backend Errors**: API request validation failures, MVC controller issues, and authentication states.
4.  **Database Errors**: Mongoose validation failures, connection dropouts, and unique constraint conflicts.
5.  **Network Errors**: Inter-service request timeouts and cross-origin resource sharing (CORS) blocks.
6.  **Authentication & Security Errors**: Expired JWT tokens, spoofed API keys, and role privilege violations.
7.  **Report Generation Errors**: Local filesystem constraints, write failures, and PDF template compile errors.

---

## 3. Frontend Errors

The Next.js client handles local hardware and validation errors directly to guide the patient through calibration.

| Error Case | Cause | Detection Method | User Message | Recovery Action |
| :--- | :--- | :--- | :--- | :--- |
| **Camera Permission Denied** | User blocked camera prompt or device is in use by another app. | Catch promise rejection from `navigator.mediaDevices.getUserMedia()`. | "Camera access is blocked. Please enable camera permissions in your browser settings to perform assessments." | Prompt permission retry button or redirect to browser instructions page. |
| **Webcam Unavailable** | Hardware disconnect or camera not plugged in. | `navigator.mediaDevices.enumerateDevices()` returns no video input sources. | "No webcam detected. Please plug in a webcam and try again." | Check connections, refresh device list. |
| **Browser Not Supported** | Legacy browser missing WASM or MediaDevices support. | Check for `WebAssembly` object and `navigator.mediaDevices` support. | "Your browser is not supported. Please upgrade to a modern browser like Google Chrome or Microsoft Edge." | Provide download links for compatible browsers. |
| **Multiple People Detected** | Two or more people in webcam frame. | Client MediaPipe model returns multiple coordinate tracking frames. | "Multiple people detected. Please ensure only the patient is in the camera frame." | Pause execution; resume once count returns to exactly one. |
| **No Person Detected** | Empty camera frame or patient out of bounds. | MediaPipe landmarks array is empty. | "No person detected. Please step into the camera view." | Pause session timer; highlight alignment silhouette guide. |
| **Poor Lighting** | Extremely low light causing coordinates to jitter. | Landmarks visibility scores ($v$) for required nodes stay below `0.5` continuously. | "Lighting is too dark. Please turn on more lights or adjust your position." | Show warning after 150 low-confidence frames. |
| **Body Partially Visible** | Target joints for current assessment are cut off by screen edge. | Selected coordinates (e.g. wrist/ankle) fall out of normalized $[0.0, 1.0]$ bounds. | "Your full arm/leg is not visible. Adjust your camera angle so your target joints are in view." | Pause frame accumulation until all key points return to frame. |
| **Internet Disconnected** | Drop in client network connectivity mid-session. | Listen to window `offline` event. | "Your internet connection was lost. Please check your network." | Pause assessment; attempt automatic reconnection cache. |

---

## 4. AI Service Errors

The FastAPI service runs calculations as a stateless worker. It handles inputs carefully to protect the REST endpoint.

### 1. MediaPipe Initialization Failed
*   **Cause**: WebAssembly library files failed to fetch or CPU memory was exhausted.
*   **API Response**: HTTP `500 Internal Server Error`
    ```json
    {"error": "AI_INITIALIZATION_FAILED", "message": "Failed to load pose tracking library."}
    ```
*   **Recovery Strategy**: Frontend drops back to client-side math fallback or prompts the patient to restart the assessment module.

### 2. Landmark Confidence Too Low
*   **Cause**: Sequence payload contains coordinates with average visibility score below threshold (`0.5`).
*   **API Response**: HTTP `422 Unprocessable Entity`
    ```json
    {"error": "INVALID_LANDMARK_CONFIDENCE", "message": "Extracted landmark confidence is below acceptable threshold."}
    ```
*   **Recovery Strategy**: Prompt patient to perform calibration checks and re-record the movement.

### 3. Invalid Landmark Data
*   **Cause**: Malformed array sequence or missing key coordinate nodes (e.g. missing shoulder index in a shoulder flexion check).
*   **API Response**: HTTP `400 Bad Request`
    ```json
    {"error": "MALFORMED_LANDMARKS_ARRAY", "message": "Required joint landmarks missing from data sequence."}
    ```
*   **Recovery Strategy**: Client resets local tracking cache and restarts state machine from Pose Validation.

### 4. ROM Calculation Failed
*   **Cause**: Sequence array is too short or division by zero in vector normals.
*   **API Response**: HTTP `422 Unprocessable Entity`
    ```json
    {"error": "CALCULATION_ERROR", "message": "Unable to calculate range of motion angles from coordinates sequence."}
    ```
*   **Recovery Strategy**: Reset sequence arrays, restart movement state.

### 5. Assessment Timeout
*   **Cause**: No valid high-confidence landmarks received within the active session window (60 seconds).
*   **API Response**: HTTP `408 Request Timeout`
    ```json
    {"error": "ASSESSMENT_TIMEOUT", "message": "Session timed out waiting for valid coordinates data."}
    ```
*   **Recovery Strategy**: Stop webcam feed, return user to Instruction Screen.

---

## 5. Backend Errors

The Express.js backend handles authentication and database controllers. All error responses share a standard layout.

### Standard Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "User-friendly context message.",
    "details": []
  }
}
```

### HTTP Status Codes Mapping

| Status Code | Express Scenario | System Reason |
| :--- | :--- | :--- |
| **400 Bad Request** | Missing fields in registration/login, malformed assessment schemas. | Express validation handler catches schema violations. |
| **401 Unauthorized** | Missing JWT in Bearer header, expired token, signature verification failure. | JWT validation middleware intercepts request. |
| **403 Forbidden** | Patient attempting to view doctor dashboards or update other patient profile fields. | Role-based check middleware intercept. |
| **404 Not Found** | Querying `/api/patients/:id` with non-existent ObjectId database records. | Mongoose find returns `null`. |
| **500 Server Error** | Unexpected unhandled exceptions, filesystem errors during local storage calls. | Main error handler middleware catches and logs stack trace. |

---

## 6. Database Errors

Database errors occur within the Mongo Mongoose ODM layer and must be resolved before responding to client endpoints.

*   **MongoDB Connection Failed**:
    *   *Cause*: Database container down, incorrect password string in `.env`, or connection pool exhaustion.
    *   *Strategy*: Implement auto-reconnection parameters in Mongoose (retry every 5 seconds up to 5 times before failing). Return HTTP 503 Service Unavailable.
*   **Duplicate User Email**:
    *   *Cause*: Registering a user email that already exists.
    *   *Strategy*: Mongoose schema catches unique index violation (`code: 11000`). Return HTTP 409 Conflict with message `"This email address is already registered."`
*   **Assessment Save Failed**:
    *   *Cause*: Validation constraints validation error (e.g. negative angles).
    *   *Strategy*: Validate values on client side before sending. If save fails, cache assessment locally in client session state to enable retry.
*   **Report Metadata Save Failed**:
    *   *Cause*: Mongoose validation constraints violation.
    *   *Strategy*: Rollback the saved PDF file from the local storage folder to avoid orphaned files, and log database write failure.

---

## 7. PDF Generation Errors

PDF reports are compiled locally inside the backend reports folder (`/backend/reports`) during Semester 7.

*   **PDF Template Compilation Failed**:
    *   *Cause*: Syntax mismatch in layouts or template engines.
    *   *Recovery*: Drop back to plain text HTML template generation, write error log, and attempt secondary compilation.
*   **Report Storage Folder Missing**:
    *   *Cause*: `/backend/reports` folder was deleted or write permission was restricted by OS.
    *   *Recovery*: Express controller runs a check (`fs.existsSync()`) and creates the directory dynamically using `fs.mkdirSync()` before saving.
*   **File Write Exception**:
    *   *Cause*: Server disk full or write block.
    *   *Recovery*: Return HTTP 500. Queue the report generation task in memory, and alert system administrators.

---

## 8. Security Errors

Security failures must return minimal information to the caller to prevent system penetration testing.

*   **Missing or Invalid X-AI-SERVICE-KEY**:
    *   *Scenario*: Unauthorized direct request to FastAPI endpoint or spoofed backend routes.
    *   *Response*: HTTP `401 Unauthorized`. Response details: `{"error": "UNAUTHORIZED_SERVICE_CALL"}`
*   **Expired or Malformed JWT**:
    *   *Scenario*: Client cookie or header contains expired session token.
    *   *Response*: HTTP `401 Unauthorized`. Details: `{"error": "SESSION_EXPIRED"}`
    *   *Action*: Next.js auth client deletes expired cookies and redirects user to login screen.

---

## 9. User-Friendly Error Messages

To maintain a professional healthcare tone, technical errors must be mapped to clear UI alerts:

| Raw Technical Exception | UI Display Message |
| :--- | :--- |
| `MongoServerError: E11000 duplicate key error...` | "This email address is already in use. Please try logging in or use another email." |
| `jwt expired` | "Your session has expired for security reasons. Please log in again." |
| `TypeError: Failed to fetch (FastAPI)` | "Unable to reach the analysis service. Please check your connection and try again." |
| `ENOENT: no such file or directory` | "The requested clinical report is temporarily unavailable. Please contact your administrator." |
| `MediaPipe landmark confidence < 0.5` | "We are having trouble tracking your movement. Make sure you are in a well-lit area." |

---

## 10. Logging Strategy

Flexion AI logs system events selectively to simplify debugging while preserving HIPAA compliance. **Protected Health Information (PHI) like names, emails, and medical history must never be printed to raw console logs.**

### Logging Levels

1.  **INFO**: Non-critical events (e.g. Assessment selected, state transitions, authentication logins).
2.  **WARN**: Non-blocking anomalies (e.g. Landmark confidence drop warnings, failed login attempts).
3.  **ERROR**: Blocking system failures (e.g. Database connection lost, PDF write failed, invalid API keys).

### Console Log Separation

*   **Developer Logs (Stdout/Stderr)**:
    ```
    [2026-08-06T19:50:00Z] ERROR (DB): Mongoose validation failed on model "Assessment" for ID: 60d5ec49f. Reason: Invalid Joint Angle value.
    ```
*   **Auditing Logs (Express Security)**: Trace user login requests and reports access logs.
    ```
    [2026-08-06T19:50:05Z] INFO (AUTH): Login success for user role: Patient. User ID: 60d5ec49f83c5123456789ab.
    ```

---

## 11. Recovery Actions

For every exception state, the system provides one of five fallback controls:

```
                  +--------------------------------+
                  |         Anomalous Event        |
                  +---------------+----------------+
                                  |
            +---------------------+---------------------+
            |                                           |
            v                                           v
  [Critical Infrastructure]                     [Assessment/User Action]
            │                                           │
   ┌────────┴────────┐                         ┌────────┴────────┐
   │  - Auto-Retry   │                         │  - Restart      │
   │  - Contact      │                         │  - Refresh      │
   │    Support      │                         │  - Cancel       │
   └─────────────────┘                         └─────────────────┘
```

1.  **Retry**: Used for temporary network disconnects or database queries. The frontend will retry the operation automatically up to three times.
2.  **Cancel**: Patient aborts the current operation and returns to the previous safe UI panel (`Idle` dashboard state).
3.  **Restart Assessment**: Resets the state machine back to the `Instruction Screen` state. Used when pose calibration fails or the assessment times out.
4.  **Contact Support**: Used for persistent system failures (e.g. PDF retrieval fails, database is unavailable). The UI shows contact details and logs an reference hash.
5.  **Refresh Session**: Logs out the current user, deletes invalid JWT cookies, and directs them to the login screen.

---

## 12. Future Improvements (Semester 8)

For the next development phase, the error handling framework will be expanded to include production monitoring:

*   **Error Analytics**: Track common assessment failure points (e.g., which joints fail pose validation most frequently).
*   **Monitoring Dashboard**: Integrate visualization tools (e.g. Winston logger with Grafana dashboards).
*   **Centralized Logging**: Export server files logs into a secure cloud storage location.
*   **Automated Alerts**: Email notifications to administrators if database connections drop or unauthorized access attempt counts spike.
