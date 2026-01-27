import { useState, useRef, useEffect, type FormEvent } from 'react';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { auth } from '../firebase.ts';

export function LoginForm() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(
    null,
  );
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (recaptchaRef.current && !verifierRef.current) {
      verifierRef.current = new RecaptchaVerifier(auth, recaptchaRef.current, {
        size: 'invisible',
      });
    }
    return () => {
      verifierRef.current?.clear();
      verifierRef.current = null;
    };
  }, []);

  async function handleSendCode(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      const result = await signInWithPhoneNumber(
        auth,
        phone,
        verifierRef.current!,
      );
      setConfirmation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send code');
      verifierRef.current?.clear();
      verifierRef.current = null;
      if (recaptchaRef.current) {
        recaptchaRef.current.innerHTML = '';
        verifierRef.current = new RecaptchaVerifier(
          auth,
          recaptchaRef.current,
          { size: 'invisible' },
        );
      }
    } finally {
      setSending(false);
    }
  }

  async function handleVerifyCode(e: FormEvent) {
    e.preventDefault();
    setError('');
    setVerifying(true);
    try {
      await confirmation!.confirm(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="card shadow-sm mt-5">
      <div className="card-body p-4">
        <h2 className="card-title text-center mb-4">
          {confirmation ? 'Verify Code' : 'Sign In'}
        </h2>

        {!confirmation ? (
          <form onSubmit={handleSendCode} autoComplete="on">
            <div className="mb-3">
              <label htmlFor="phone" className="form-label">
                Phone Number
              </label>
              <PhoneInput
                defaultCountry="se"
                value={phone}
                onChange={setPhone}
                disabled={sending}
                inputProps={{
                  id: 'phone',
                  name: 'tel',
                  autoComplete: 'tel',
                  required: true,
                  className: 'form-control',
                }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={sending}
            >
              {sending ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />
                  Sending...
                </>
              ) : (
                'Send Code'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} autoComplete="on">
            <div className="mb-3">
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
              className="btn btn-primary w-100"
              disabled={verifying}
            >
              {verifying ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </button>
            <button
              type="button"
              className="btn btn-link w-100 mt-2"
              onClick={() => setConfirmation(null)}
              disabled={verifying}
            >
              Back
            </button>
          </form>
        )}

        {error && (
          <div className="alert alert-danger mt-3 mb-0" role="alert">
            {error}
          </div>
        )}

        <div ref={recaptchaRef} />
      </div>
    </div>
  );
}
