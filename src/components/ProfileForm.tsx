import { useEffect, useState, type FormEvent } from 'react';
import { signOut, type User } from 'firebase/auth';
import { auth } from '../firebase.ts';
import { getProfile, updateProfile } from '../api.ts';

interface Props {
  user: User;
}

export function ProfileForm({ user }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const token = await user.getIdToken();
        const profile = await getProfile(token);
        setName(profile.name);
        setEmail(profile.email);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load profile',
        );
      }
    }
    load();
  }, [user]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Valid email is required');
      return;
    }

    try {
      const token = await user.getIdToken();
      await updateProfile(token, { name: name.trim(), email: email.trim() });
      setMessage('Profile saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    }
  }

  async function handleLogout() {
    await signOut(auth);
  }

  return (
    <div>
      <h1>Profile</h1>
      <form onSubmit={handleSave}>
        <div>
          <label>
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
        </div>
        <button type="submit">Save</button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
