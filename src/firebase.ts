import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { config } from './config.ts';

const app = initializeApp(config.firebase);

export const auth = getAuth(app);
