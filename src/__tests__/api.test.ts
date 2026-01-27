import { describe, it, expect, vi, beforeEach } from 'vitest'
import { type User } from 'firebase/auth'
import { getProfile, updateProfile, ApiError } from '../api.ts'

vi.mock('../config.ts', () => ({
  config: {
    apiBaseUrl: 'https://api.example.com',
    firebase: { apiKey: '', authDomain: '', projectId: '' },
  },
}))

const mockFetch = vi.fn()
globalThis.fetch = mockFetch

function mockUser(token: string): User {
  return { getIdToken: vi.fn().mockResolvedValue(token) } as unknown as User
}

beforeEach(() => {
  mockFetch.mockReset()
})

describe('getProfile', () => {
  it('sends GET request with auth header', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ phone: '+1', name: 'Test', email: 'a@b.c' }),
    })

    const result = await getProfile(mockUser('token123'))

    expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/profile', {
      headers: { Authorization: 'Bearer token123' },
    })
    expect(result.name).toBe('Test')
  })

  it('retries with fresh token on 401', async () => {
    const user = mockUser('stale')
    ;(user.getIdToken as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce('stale')
      .mockResolvedValueOnce('fresh')

    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 }).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ phone: '+1', name: 'Test', email: 'a@b.c' }),
    })

    const result = await getProfile(user)

    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(user.getIdToken).toHaveBeenCalledWith(true)
    expect(result.name).toBe('Test')
  })
})

describe('updateProfile', () => {
  it('sends POST request with body and auth header', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ phone: '+1', name: 'New', email: 'x@y.z' }),
    })

    const result = await updateProfile(mockUser('tok'), {
      name: 'New',
      email: 'x@y.z',
    })

    expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/profile', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer tok',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'New', email: 'x@y.z' }),
    })
    expect(result.email).toBe('x@y.z')
  })

  it('uses backend message field on error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'Name must be a non-empty string' }),
    })

    await expect(updateProfile(mockUser('tok'), { name: '', email: 'x@y.z' })).rejects.toThrow(
      'Name must be a non-empty string',
    )
  })

  it('falls back to generic message when no message field', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    })

    try {
      await updateProfile(mockUser('tok'), { name: 'A', email: 'x@y.z' })
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError)
      expect((err as ApiError).message).toBe('A server error occurred. Please try again later.')
      expect((err as ApiError).status).toBe(500)
    }
  })
})
