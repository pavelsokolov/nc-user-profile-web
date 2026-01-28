import { useEffect, useState, type FormEvent } from 'react'
import { signOut, type User } from 'firebase/auth'
import { auth } from '../firebase.ts'
import { getProfile, updateProfile } from '../api.ts'
import styles from '../styles/ProfileForm.module.css'

interface Props {
  user: User
}

export function ProfileForm({ user }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getProfile(user)
      .then((p) => {
        setName(p.name)
        setEmail(p.email)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)
    try {
      await updateProfile(user, { name: name.trim(), email: email.trim() })
      setMessage('Profile saved')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`card ${styles.card}`}>
      <div className={styles.cardBody}>
        <div className={styles.header}>
          <h2 className={`card-title ${styles.title}`}>Profile</h2>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => signOut(auth)}>
            Logout
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className={styles.field}>
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
          <div className={styles.field}>
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
          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={saving}>
            {saving ? (
              <>
                <span className={`spinner-border spinner-border-sm ${styles.spinner}`} />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
        </form>

        {message && (
          <div className={`alert alert-success ${styles.alert}`} role="alert">
            {message}
          </div>
        )}
        {error && (
          <div className={`alert alert-danger ${styles.alert}`} role="alert">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
