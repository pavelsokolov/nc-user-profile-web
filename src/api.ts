import { type User } from 'firebase/auth'
import { config } from './config.ts'

interface ProfileData {
  phone: string
  name: string
  email: string
}

interface ProfileUpdate {
  name: string
  email: string
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
  }
}

const FALLBACK_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'Your session has expired. Please sign in again.',
  500: 'A server error occurred. Please try again later.',
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json()
    if (typeof body?.message === 'string') {
      return body.message
    }
  } catch {
    // response wasn't JSON
  }
  return FALLBACK_MESSAGES[response.status] ?? 'Something went wrong. Please try again.'
}

async function authFetch(user: User, input: string, init?: RequestInit): Promise<Response> {
  const token = await user.getIdToken()
  const response = await fetch(input, {
    ...init,
    headers: { ...init?.headers, Authorization: `Bearer ${token}` },
  })

  if (response.status === 401) {
    const freshToken = await user.getIdToken(true)
    return fetch(input, {
      ...init,
      headers: { ...init?.headers, Authorization: `Bearer ${freshToken}` },
    })
  }

  return response
}

export async function getProfile(user: User): Promise<ProfileData> {
  const response = await authFetch(user, `${config.apiBaseUrl}/profile`)
  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response), response.status)
  }
  return response.json() as Promise<ProfileData>
}

export async function updateProfile(user: User, data: ProfileUpdate): Promise<ProfileData> {
  const response = await authFetch(user, `${config.apiBaseUrl}/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response), response.status)
  }
  return response.json() as Promise<ProfileData>
}
