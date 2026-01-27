import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { config } from './config.ts'

const app = initializeApp(config.firebase)

export const auth = getAuth(app)

if (config.authEmulatorUrl) {
  connectAuthEmulator(auth, config.authEmulatorUrl)
}
