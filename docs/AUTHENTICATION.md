# Authentication & User Management Security

This document outlines the authentication mechanics, JWT structure, cookie handling, and Role-Based Access Control (RBAC) boundaries implemented in the Flexion AI platform.

---

## 1. Security Architecture Summary

Flexion AI uses stateless JSON Web Token (JWT) credentials mapping. The backend Node/Express application acts as the authoritative security boundary.

```
Next.js Client (Context state, Forms validation)
  │
  ▼  (Secure HttpOnly Cookie)
Next.js Edge Middleware (User redirection UX guard)
  │
  ▼  (REST Request to Port 5000)
Express Backend Server (Authoritative signature & role authorization verification)
  │
  ▼
MongoDB Database Queries
```

---

## 2. JWT Configuration & Token Structure

Tokens are signed using a pre-shared secret key `JWT_SECRET` loaded from environment parameters on the server side:

*   **Signature Algorithm**: HMAC SHA256 (default jsonwebtoken configuration).
*   **Token Expiration**: Signed tokens expire in exactly `24h`.
*   **Payload Format**:
    ```json
    {
      "id": "60d5ec49f83c5123456789ab",
      "role": "Patient",
      "iat": 1723100000,
      "exp": 1723186400
    }
    ```

---

## 3. Cookie Transmission Rules

To mitigate Cross-Site Scripting (XSS) and Session Hijacking vectors:
*   **Transmission Mode**: Tokens are sent to browsers inside an `HttpOnly` header cookie. Client-side javascript `document.cookie` queries cannot access this cookie.
*   **Semester 7 Development parameters (Localhost)**:
    *   `httpOnly`: `true`
    *   `secure`: `false` (required for local HTTP endpoints)
    *   `sameSite`: `'lax'` (permits cross-port sharing from port `3000` to port `5000`)
*   **Production Configuration**:
    *   `httpOnly`: `true`
    *   `secure`: `true` (enforces HTTPS delivery only)
    *   `sameSite`: `'lax'` or `'strict'`

---

## 4. Role-Based Access Control (RBAC)

Authentication checks are structured across two layers:
1.  **Client-Side Navigation (UX Redirects)**: Next.js edge middleware parses the base64-encoded cookie role payload. If invalid or missing, it redirects clients immediately to `/login` to preserve smooth navigations.
2.  **Server-Side Security Enforcement (Authoritative)**: Express `requireAuth` and `authorizeRoles` middlewares intercept endpoints:
    ```typescript
    // Secures endpoint to clinicians only
    router.get('/patients', requireAuth, authorizeRoles('Doctor'), getPatients);
    ```

---

## 5. Security Safeguards

*   **Public Registration Limitation**: The register endpoint rejects any registration request attempting to sign up as an `Admin`. Admin accounts are seeded manually.
*   **Decoupled Clinical Information**: Account credentials (User collection) contain zero clinical datasets. Clinical profiles (`Patient` and `Doctor` collections) are generated as reference documents, preventing unauthorized health information (PHI) leakages during authentication events.
*   **Brute-Force Attack Protection**: Rate-limiting constraints restrict client request pools on `/register` and `/login` routes to 100 requests per 15-minute window.
