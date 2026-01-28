import { useState, useRef, useCallback, type FormEvent } from 'react'
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
  type AuthError,
} from 'firebase/auth'
import { PhoneInput } from 'react-international-phone'
import 'react-international-phone/style.css'
import { auth } from '../firebase.ts'
import styles from '../styles/LoginForm.module.css'

const errorMessages: Record<string, string> = {
  'auth/invalid-phone-number': 'Invalid phone number. Check the country code and number.',
  'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
  'auth/quota-exceeded': 'SMS quota exceeded. Try again later.',
  'auth/captcha-check-failed': 'reCAPTCHA failed. Please try again.',
  'auth/invalid-verification-code': 'Incorrect code. Please check and try again.',
  'auth/code-expired': 'Code expired. Request a new one.',
  'auth/error-code:-39': 'SMS not supported for this number/region.',
}

function getErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const code = (err as AuthError).code
    return errorMessages[code] ?? `Authentication error: ${code}`
  }
  return err instanceof Error ? err.message : 'Something went wrong.'
}

export function LoginForm() {
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const verifierRef = useRef<RecaptchaVerifier | null>(null)

  const getVerifier = useCallback(() => {
    try {
      verifierRef.current?.clear()
    } catch {
      /* already cleared */
    }
    verifierRef.current = null
    if (containerRef.current) {
      containerRef.current.replaceChildren()
      const el = document.createElement('div')
      containerRef.current.appendChild(el)
      verifierRef.current = new RecaptchaVerifier(auth, el, { size: 'invisible' })
    }
    return verifierRef.current!
  }, [])

  async function handleSendCode(e: FormEvent) {
    e.preventDefault()
    setError('')
    const e164 = '+' + phone.replace(/\D/g, '')
    if (e164.length < 8 || e164.length > 16) {
      //   setError('Please enter a valid phone number.')
      //   return
    }
    setSending(true)
    try {
      setConfirmation(await signInWithPhoneNumber(auth, e164, getVerifier()))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  async function handleVerifyCode(e: FormEvent) {
    e.preventDefault()
    setError('')
    setVerifying(true)
    try {
      await confirmation!.confirm(code)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className={`card ${styles.card}`}>
      <div className={styles.cardBody}>
        <h2 className={`card-title ${styles.title}`}>{confirmation ? 'Verify Code' : 'Sign In'}</h2>

        {!confirmation ? (
          <form onSubmit={handleSendCode} autoComplete="on">
            <div className={styles.field}>
              <label htmlFor="phone" className="form-label">
                Phone Number
              </label>
              <PhoneInput
                defaultCountry="se"
                value={phone}
                onChange={setPhone}
                disabled={sending}
                className={styles.phoneInput}
                inputProps={{ id: 'phone', name: 'tel', autoComplete: 'tel', required: true }}
              />
            </div>
            <button
              type="submit"
              className={`btn btn-primary ${styles.submitBtn}`}
              disabled={sending}
            >
              {sending ? (
                <>
                  <span className={`spinner-border spinner-border-sm ${styles.spinner}`} />
                  Sending...
                </>
              ) : (
                'Send Code'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} autoComplete="on">
            <div className={styles.field}>
              <label htmlFor="code" className="form-label">
                SMS Code
              </label>
              <input
                id="code"
                type="text"
                name="one-time-code"
                autoComplete="one-time-code"
                className="form-control"
                placeholder="Enter verification code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                disabled={verifying}
              />
            </div>
            <button
              type="submit"
              className={`btn btn-primary ${styles.submitBtn}`}
              disabled={verifying}
            >
              {verifying ? (
                <>
                  <span className={`spinner-border spinner-border-sm ${styles.spinner}`} />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </button>
            <button
              type="button"
              className={`btn btn-link ${styles.backBtn}`}
              onClick={() => {
                setConfirmation(null)
                setCode('')
                setError('')
              }}
              disabled={verifying}
            >
              Back
            </button>
          </form>
        )}

        {error && (
          <div className={`alert alert-danger ${styles.alert}`} role="alert">
            {error}
          </div>
        )}

        <div ref={containerRef} />
      </div>
    </div>
  )
}
