import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './firebase.ts';
import { LoginForm } from './components/LoginForm.tsx';
import { ProfileForm } from './components/ProfileForm.tsx';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <LoginForm />;
  }

  return <ProfileForm user={user} />;
}
