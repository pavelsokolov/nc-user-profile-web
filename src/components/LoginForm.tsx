import { useState, useRef, type FormEvent } from 'react';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';
import { auth } from '../firebase.ts';

export function LoginForm() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(
    null,
  );
  const [error, setError] = useState('');
  const recaptchaRef = useRef<HTMLDivElement>(null);

  async function handleSendCode(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const verifier = new RecaptchaVerifier(auth, recaptchaRef.current!, {
        size: 'invisible',
      });
      const result = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send code');
    }
  }

  async function handleVerifyCode(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await confirmation!.confirm(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code');
    }
  }

  if (!confirmation) {
    return (
      <div>
        <h1>Sign In</h1>
        <form onSubmit={handleSendCode}>
          <input
            type="tel"
            placeholder="+1234567890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <button type="submit">Send Code</button>
        </form>
        <div ref={recaptchaRef} />
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <h1>Verify Code</h1>
      <form onSubmit={handleVerifyCode}>
        <input
          type="text"
          placeholder="SMS code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <button type="submit">Verify</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
