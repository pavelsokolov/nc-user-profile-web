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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const profile = await getProfile(user);
        setName(profile.name);
        setEmail(profile.email);
      } catch {
        // Profile not found or network error — treat as new user with empty fields
      } finally {
        setLoading(false);
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

    setSaving(true);
    try {
      await updateProfile(user, { name: name.trim(), email: email.trim() });
      setMessage('Profile saved');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await signOut(auth);
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm mt-4">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="card-title mb-0">Profile</h2>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              id="name"
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={saving}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={saving}
          >
            {saving ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
        </form>

        {message && (
          <div className="alert alert-success mt-3 mb-0" role="alert">
            {message}
          </div>
        )}
        {error && (
          <div className="alert alert-danger mt-3 mb-0" role="alert">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
