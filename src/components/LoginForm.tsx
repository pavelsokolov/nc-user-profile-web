import { useState, useRef, useEffect, type FormEvent } from 'react';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
  type AuthError,
} from 'firebase/auth';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { auth } from '../firebase.ts';

const firebaseErrorMessages: Record<string, string> = {
  'auth/invalid-phone-number':
    'The phone number is not valid. Please check the country code and number.',
  'auth/too-many-requests':
    'Too many attempts. Please wait a moment and try again.',
  'auth/quota-exceeded':
    'SMS quota exceeded. Please try again later.',
  'auth/captcha-check-failed':
    'reCAPTCHA verification failed. Please try again.',
  'auth/invalid-verification-code':
    'The verification code is incorrect. Please check and try again.',
  'auth/code-expired':
    'The verification code has expired. Please request a new one.',
};

function getErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const code = (err as AuthError).code;
    if (code in firebaseErrorMessages) {
      return firebaseErrorMessages[code];
    }
  }
  return 'Something went wrong. Please try again.';
}

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
    const e164 = '+' + phone.replace(/\D/g, '');
    if (e164.length < 8 || e164.length > 16) {
      setError('Please enter a valid phone number.');
      return;
    }
    setSending(true);
    try {
      const result = await signInWithPhoneNumber(
        auth,
        e164,
        verifierRef.current!,
      );
      setConfirmation(result);
    } catch (err) {
      setError(getErrorMessage(err));
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
      setError(getErrorMessage(err));
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
                inputStyle={{
                  height: '38px',
                  fontSize: '1rem',
                  border: '1px solid #dee2e6',
                  borderLeft: 'none',
                  borderRadius: '0 0.375rem 0.375rem 0',
                  width: '100%',
                }}
                countrySelectorStyleProps={{
                  buttonStyle: {
                    height: '38px',
                    border: '1px solid #dee2e6',
                    borderRight: 'none',
                    borderRadius: '0.375rem 0 0 0.375rem',
                    paddingInline: '10px',
                    background: '#f8f9fa',
                  },
                }}
                style={{ width: '100%' }}
                inputProps={{
                  id: 'phone',
                  name: 'tel',
                  autoComplete: 'tel',
                  required: true,
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
