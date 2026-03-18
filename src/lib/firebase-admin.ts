import { initializeApp as _initializeApp } from '@prmichaelsen/firebase-admin-sdk-v8'

declare const process: { env: Record<string, string | undefined> }

export function initFirebaseAdmin() {
  _initializeApp({
    serviceAccount: process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_KEY,
    projectId: process.env.FIREBASE_PROJECT_ID,
  })
}
