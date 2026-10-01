import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './auth'
import type { AuthResponse, Job, JobType, PresignResult, Project, User } from './types'

const BASE = process.env.NEXT_PUBLIC_API_URL || ''

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'APIError'
  }
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const token = getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string> || {}),
  }

  const res = await fetch(`${BASE}${path}`, { ...init, headers })

  if (res.status === 401 && retry) {
    const refreshed = await tryRefresh()
    if (refreshed) return request<T>(path, init, false)
    clearTokens()
    if (typeof window !== 'undefined') window.location.href = '/login'
    throw new APIError(401, 'Unauthorized')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new APIError(res.status, body.message || `Request failed: ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false
  try {
    const res = await fetch(`${BASE}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    if (!res.ok) return false
    const data: AuthResponse = await res.json()
    setTokens(data.access_token, data.refresh_token)
    return true
  } catch {
    return false
  }
}

// ── Auth ─────────────────────────────────────────────────────────────

export async function register(email: string, password: string, name: string): Promise<AuthResponse> {
  return request('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  })
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return request('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }, false) // don't trigger token-refresh on 401 — let the caller show the error
}

export async function forgotPassword(email: string): Promise<void> {
  return request('/api/v1/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }, false)
}

export async function resetPassword(token: string, password: string): Promise<void> {
  return request('/api/v1/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  }, false)
}

export async function logout(refreshToken: string): Promise<void> {
  return request('/api/v1/auth/logout', {
    method: 'DELETE',
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
}

export async function getMe(): Promise<User> {
  return request('/api/v1/auth/me')
}

// ── Upload ───────────────────────────────────────────────────────────

export async function presignUpload(filename: string, contentType: string): Promise<PresignResult> {
  return request('/api/v1/upload/presign', {
    method: 'POST',
    body: JSON.stringify({ filename, content_type: contentType }),
  })
}

export async function uploadToS3(uploadURL: string, file: File): Promise<void> {
  const res = await fetch(uploadURL, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })
  if (!res.ok) throw new APIError(res.status, 'Upload failed')
}

// ── Jobs ─────────────────────────────────────────────────────────────

export async function ghostMannequinSync(imageB64: string, mimeType: string): Promise<{ job_id: string; result_url: string }> {
  return request('/api/v1/ghost-mannequin/sync', {
    method: 'POST',
    body: JSON.stringify({ image_b64: imageB64, mime_type: mimeType }),
  })
}

export async function patternGeneratorSync(imageB64: string, mimeType: string): Promise<{ job_id: string; result_url: string }> {
  return request('/api/v1/pattern-generator/sync', {
    method: 'POST',
    body: JSON.stringify({ image_b64: imageB64, mime_type: mimeType }),
  })
}

export async function virtualTryOnSync(dressB64: string, dressMime: string, personB64: string, personMime: string): Promise<{ job_id: string; result_url: string }> {
  return request('/api/v1/virtual-tryon/sync', {
    method: 'POST',
    body: JSON.stringify({ dress_b64: dressB64, dress_mime: dressMime, person_b64: personB64, person_mime: personMime }),
  })
}

export async function createGhostMannequinJob(dressUrl: string): Promise<Job> {
  return request('/api/v1/jobs/ghost-mannequin', {
    method: 'POST',
    body: JSON.stringify({ dress_url: dressUrl }),
  })
}

export async function createPatternGeneratorJob(dressUrl: string): Promise<Job> {
  return request('/api/v1/jobs/pattern-generator', {
    method: 'POST',
    body: JSON.stringify({ dress_url: dressUrl }),
  })
}

export async function createVirtualTryOnJob(dressUrl: string, personUrl: string): Promise<Job> {
  return request('/api/v1/jobs/virtual-tryon', {
    method: 'POST',
    body: JSON.stringify({ dress_url: dressUrl, person_url: personUrl }),
  })
}

export async function getJob(id: string): Promise<Job> {
  return request(`/api/v1/jobs/${id}`)
}

export async function deleteJob(id: string): Promise<void> {
  return request(`/api/v1/jobs/${id}`, { method: 'DELETE' })
}

export async function getJobDownloadUrl(id: string): Promise<{ download_url: string }> {
  return request(`/api/v1/jobs/${id}/download`)
}

export async function listJobs(): Promise<Job[]> {
  return request('/api/v1/jobs')
}

// ── Projects ─────────────────────────────────────────────────────────

export async function createProject(jobId: string, name: string, thumbnailUrl?: string): Promise<Project> {
  return request('/api/v1/projects', {
    method: 'POST',
    body: JSON.stringify({ job_id: jobId, name, thumbnail_url: thumbnailUrl }),
  })
}

export async function listProjects(): Promise<Project[]> {
  return request('/api/v1/projects')
}

export async function getProject(id: string): Promise<Project> {
  return request(`/api/v1/projects/${id}`)
}

export async function deleteProject(id: string): Promise<void> {
  return request(`/api/v1/projects/${id}`, { method: 'DELETE' })
}

export { APIError }
