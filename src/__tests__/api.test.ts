import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProfile, updateProfile } from '../api.ts';

vi.mock('../config.ts', () => ({
  config: {
    apiBaseUrl: 'https://api.example.com',
    firebase: { apiKey: '', authDomain: '', projectId: '' },
  },
}));

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe('getProfile', () => {
  it('sends GET request with auth header', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ phone: '+1', name: 'Test', email: 'a@b.c' }),
    });

    const result = await getProfile('token123');

    expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/profile', {
      headers: { Authorization: 'Bearer token123' },
    });
    expect(result.name).toBe('Test');
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 401 });

    await expect(getProfile('bad')).rejects.toThrow('401');
  });
});

describe('updateProfile', () => {
  it('sends POST request with body and auth header', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ phone: '+1', name: 'New', email: 'x@y.z' }),
    });

    const result = await updateProfile('tok', { name: 'New', email: 'x@y.z' });

    expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/profile', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer tok',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'New', email: 'x@y.z' }),
    });
    expect(result.email).toBe('x@y.z');
  });

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 400 });

    await expect(
      updateProfile('tok', { name: '', email: '' }),
    ).rejects.toThrow('400');
  });
});
