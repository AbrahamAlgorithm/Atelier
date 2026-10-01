# Atelier Mobile API Integration Guide

> Complete reference for mobile developers integrating the Atelier backend

**API Base URL**: `https://atelier-backend-179103012566.us-central1.run.app`  
**Environment Variables**: Supported via Postman — switch `{{base_url}}` to dev/staging/prod

---

## Quick Start

### 1. Import Postman Collection
Download `Atelier-API.postman_collection.json` from the backend repo and import into Postman:
- All endpoints pre-configured
- Environment variables auto-set (access token, refresh token)
- Test scripts to extract tokens from responses

### 2. Authentication Flow

```
┌─────────────────────────────────────────┐
│ 1. POST /api/v1/auth/register or /login │
├─────────────────────────────────────────┤
│ Response:                               │
│  access_token (15 min)                  │
│  refresh_token (30 days)                │
│  user { id, email, name, avatar_url }  │
└─────────────────────────────────────────┘
         ↓ Store both tokens
┌─────────────────────────────────────────┐
│ 2. Add to all requests:                 │
│  Authorization: Bearer <access_token>   │
└─────────────────────────────────────────┘
         ↓ When access token expires
┌─────────────────────────────────────────┐
│ 3. POST /api/v1/auth/refresh            │
│  { refresh_token: "..." }               │
├─────────────────────────────────────────┤
│ Response: New access + refresh tokens   │
└─────────────────────────────────────────┘
```

### 3. Store Tokens Securely

**iOS**: Keychain  
**Android**: EncryptedSharedPreferences  
**React Native**: secure-storage or AsyncStorage + encryption

Example (pseudo-code):
```swift
// iOS
let query = [
    kSecClass: kSecClassGenericPassword,
    kSecAttrAccount: "access_token",
    kSecValueData: accessToken.data(using: .utf8)!
]
SecItemAdd(query as CFDictionary, nil)
```

---

## Core Features

### A. User Authentication

#### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",  // min 8 chars
  "name": "John Doe"
}
```

**Success (200)**:
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "uuid-1234...",
  "user": {
    "id": "uuid-xxxx",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar_url": null,
    "created_at": "2026-05-06T10:30:00Z"
  }
}
```

**Errors**:
- `400`: Invalid email format or password < 8 chars
- `409`: Email already registered

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Success (200)**: Same as register response

**Errors**:
- `401`: Invalid email or password (don't reveal which one)

#### Refresh Token (Auto-refresh pattern)
When you get a 401 on any protected endpoint:

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "uuid-xxxx..."
}
```

Stores new tokens and retries the original request.

#### Forgot Password Flow

**Step 1: Request reset**
```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response (always 200)**: 
```json
{
  "message": "If that email exists, a reset link has been sent."
}
```

> **Note**: Server doesn't reveal if email exists (security best practice). Email is sent to the user's inbox (or logged to Cloud Run if SMTP not configured).

**Step 2: Mobile app**
- User clicks link in email → opens `https://atelier-frontend-179103012566.us-central1.run.app/reset-password?token=...`
- Web form lets user set new password
- OR your mobile app can intercept the deep link and show a native form

**Step 3: Reset password** (if handling in mobile app)
```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "uuid-from-email-link",
  "password": "NewPassword123"
}
```

**Response (200)**:
```json
{
  "message": "Password updated. Please sign in."
}
```

---

### B. Image Upload & Processing

#### Step 1: Get Presigned Upload URL
```http
POST /api/v1/upload/presign
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "filename": "dress.jpg",
  "content_type": "image/jpeg"
}
```

**Response (200)**:
```json
{
  "upload_url": "https://storage.googleapis.com/atelier-uploads-gcs/...",
  "file_url": "https://storage.googleapis.com/atelier-uploads-gcs/...",
  "key": "path/to/image.jpg"
}
```

#### Step 2: Upload Image (Browser PUT)
Use `upload_url` from response. Valid for 15 minutes.

```http
PUT <upload_url>
Content-Type: image/jpeg

[binary image data]
```

> **Important**: This is a direct browser PUT — your auth token is NOT needed. The URL itself is signed and time-limited.

Store `file_url` for later processing.

---

### C. Processing Images

#### Two Modes: Sync vs. Background

**Sync** (immediate response, ~5-30 sec):
- Good for demos, quick feedback
- Response includes result URL directly

**Background** (returns job ID, poll for status):
- Good for large images or batch processing
- Poll `/api/v1/jobs/{id}` to track progress
- Subscribe to webhooks (coming soon)

#### Ghost Mannequin

**Sync**:
```http
POST /api/v1/ghost-mannequin/sync
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "image_b64": "base64-encoded-image",
  "mime_type": "image/jpeg"
}
```

**Response (200)** (after ~10-30 sec):
```json
{
  "job_id": "uuid-1234",
  "result_url": "https://storage.googleapis.com/atelier-uploads-gcs/processed/..."
}
```

**Background**:
```http
POST /api/v1/jobs/ghost-mannequin
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "dress_url": "https://storage.googleapis.com/atelier-uploads-gcs/..."
}
```

**Response (200)** (immediate):
```json
{
  "id": "uuid-1234",
  "type": "ghost-mannequin",
  "status": "pending",
  "input_files": { "dress_url": "..." },
  "output_files": {},
  "created_at": "2026-05-06T10:30:00Z",
  "updated_at": "2026-05-06T10:30:00Z",
  "completed_at": null
}
```

**Poll for completion**:
```http
GET /api/v1/jobs/uuid-1234
Authorization: Bearer <access_token>
```

Check `status` field — values are: `pending` → `processing` → `completed` or `failed`

When `status == "completed"`, `output_files.result_url` contains the result.

---

#### Pattern Generator

Same pattern as ghost-mannequin:

**Sync**:
```http
POST /api/v1/pattern-generator/sync
{
  "image_b64": "...",
  "mime_type": "image/jpeg"
}
```

**Background**:
```http
POST /api/v1/jobs/pattern-generator
{
  "dress_url": "..."
}
```

Then poll `/api/v1/jobs/{id}` for completion.

---

#### Virtual Try-On

**Sync**:
```http
POST /api/v1/virtual-tryon/sync
{
  "dress_b64": "...",
  "dress_mime": "image/jpeg",
  "person_b64": "...",
  "person_mime": "image/jpeg"
}
```

**Background**:
```http
POST /api/v1/jobs/virtual-tryon
{
  "dress_url": "https://...",
  "person_url": "https://..."
}
```

---

### D. Jobs & History

#### List All Jobs
```http
GET /api/v1/jobs
Authorization: Bearer <access_token>
```

**Response (200)**: Array of jobs with full details and status.

#### Get Job Details
```http
GET /api/v1/jobs/{job_id}
Authorization: Bearer <access_token>
```

**Response (200)**: Single job object.

#### Get Download URL
```http
GET /api/v1/jobs/{job_id}/download
Authorization: Bearer <access_token>
```

**Response (200)**:
```json
{
  "download_url": "https://storage.googleapis.com/atelier-uploads-gcs/processed/..."
}
```

This URL is valid for 1 hour and forces download (Content-Disposition: attachment).

#### Delete Job
```http
DELETE /api/v1/jobs/{job_id}
Authorization: Bearer <access_token>
```

**Response (204)**: No content, job deleted.

---

### E. Projects (Collections)

Group processed results into projects.

#### Create Project
```http
POST /api/v1/projects
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "job_id": "uuid-1234",
  "name": "Summer Collection",
  "thumbnail_url": "https://storage.googleapis.com/atelier-uploads-gcs/thumb.jpg"
}
```

**Response (200)**:
```json
{
  "id": "uuid-5678",
  "name": "Summer Collection",
  "job_id": "uuid-1234",
  "thumbnail_url": "https://...",
  "created_at": "2026-05-06T10:35:00Z"
}
```

#### List Projects
```http
GET /api/v1/projects
Authorization: Bearer <access_token>
```

**Response (200)**: Array of all user projects.

#### Get Project
```http
GET /api/v1/projects/{project_id}
Authorization: Bearer <access_token>
```

**Response (200)**: Single project.

#### Delete Project
```http
DELETE /api/v1/projects/{project_id}
Authorization: Bearer <access_token>
```

**Response (204)**: Deleted.

---

## Error Handling

All errors follow this format:

```json
{
  "message": "human-readable error message"
}
```

**Common HTTP Status Codes**:

| Code | Meaning | Action |
|------|---------|--------|
| 200  | Success | Use the response data |
| 204  | Success (no content) | Request succeeded, no body |
| 400  | Bad request | Check request format/params |
| 401  | Unauthorized | Refresh token, retry. If refresh fails, re-login |
| 403  | Forbidden | User doesn't own this resource |
| 404  | Not found | Resource doesn't exist |
| 409  | Conflict | Email already registered |
| 500  | Server error | Retry with exponential backoff |

**Token Expiry Flow** (automatic):

```swift
// Example iOS implementation
func makeRequest(_ endpoint: String, method: String = "GET") async throws -> Data {
    var request = URLRequest(url: URL(string: baseURL + endpoint)!)
    request.httpMethod = method
    
    // Add current access token
    request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
    
    let (data, response) = try await URLSession.shared.data(for: request)
    
    if let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 401 {
        // Token expired, refresh it
        try await refreshAccessToken()
        // Retry original request
        return try await makeRequest(endpoint, method: method)
    }
    
    return data
}
```

---

## Rate Limits

- No enforced rate limits currently
- Please be reasonable (max ~10 requests/sec)
- Future: will implement 100 req/min per user

---

## Data Types & Formats

### Image Formats Accepted
- **JPEG**: `image/jpeg`
- **PNG**: `image/png`
- **WebP**: `image/webp`
- **Max size**: 50MB

### Timestamps
All timestamps are ISO 8601 format (UTC):
```
2026-05-06T10:30:00Z
```

### Job Status Values
- `pending` — Queued, waiting to start
- `processing` — Currently running
- `completed` — Finished successfully, check `output_files`
- `failed` — Error occurred, check `error_msg`

---

## Common Integration Patterns

### Pattern 1: Simple Upload & Process (Sync)

```swift
// 1. Upload image
let presignResult = try await uploadPresign(filename: "dress.jpg", type: "image/jpeg")
try await uploadToGCS(presignResult.upload_url, imageData: data)

// 2. Process immediately
let result = try await ghostMannequinSync(imageB64: base64Data, mimeType: "image/jpeg")

// 3. Download result
downloadURL = result.result_url
showPreview(downloadURL)
```

### Pattern 2: Batch Processing (Background)

```swift
// 1. Upload multiple images
let urls = try await uploadMultiple(images: [img1, img2, img3])

// 2. Queue all jobs
let jobIds = try await createJobs(urls: urls, type: "ghost-mannequin")

// 3. Poll for completion
for jobId in jobIds {
    while true {
        let job = try await getJob(jobId)
        if job.status == "completed" {
            addToGallery(job.output_files.result_url)
            break
        } else if job.status == "failed" {
            showError(job.error_msg)
            break
        }
        try await Task.sleep(nanoseconds: 2_000_000_000) // 2 sec
    }
}
```

### Pattern 3: Virtual Try-On (Two Images)

```swift
// Upload both images
let dressURL = try await uploadImage(dressImage)
let personURL = try await uploadImage(personImage)

// Process
let job = try await createVirtualTryOnJob(dressURL: dressURL, personURL: personURL)

// Poll for result
let result = try await pollUntilComplete(job.id)
showResult(result.output_files.result_url)
```

---

## Testing Endpoints in Postman

1. Import the collection
2. Set `{{base_url}}` in the Environment
3. Run "Login" request — tokens auto-save
4. All other requests use those tokens
5. Create a test account for mobile dev team:
   ```
   Email: dev@atelier.ai
   Password: DevTest123456
   ```

---

## Authentication

All endpoints marked `[Protected]` require:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token is valid for **15 minutes**. After expiry, use refresh token to get a new one.

---

## Support

- **API Status**: `/health` endpoint
- **Documentation**: This file + OpenAPI spec at `openapi.yaml`
- **Questions**: Reach out in Slack #atelier-mobile

---

## Changelog

**2026-05-06** — Initial release
- Authentication (register, login, refresh, forgot password)
- Image upload with presigned URLs
- Ghost Mannequin, Pattern Generator, Virtual Try-On (sync + background)
- Job polling and history
- Projects collection
