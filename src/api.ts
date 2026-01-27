import { config } from './config.ts';

interface ProfileData {
  phone: string;
  name: string;
  email: string;
}

interface ProfileUpdate {
  name: string;
  email: string;
}

export async function getProfile(token: string): Promise<ProfileData> {
  const response = await fetch(`${config.apiBaseUrl}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch profile: ${response.status}`);
  }
  return response.json() as Promise<ProfileData>;
}

export async function updateProfile(
  token: string,
  data: ProfileUpdate,
): Promise<ProfileData> {
  const response = await fetch(`${config.apiBaseUrl}/profile`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to update profile: ${response.status}`);
  }
  return response.json() as Promise<ProfileData>;
}
