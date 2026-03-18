import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { getServerSession } from './session'
import { initFirebaseAdmin } from '../firebase-admin'

export const getAuthSession = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    initFirebaseAdmin()
    const session = await getServerSession(getRequest())
    return session?.user || null
  } catch {
    return null
  }
})
