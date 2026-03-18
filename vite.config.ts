import { defineConfig, type Plugin } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'

function firebaseSSRStub(): Plugin {
  return {
    name: 'firebase-ssr-stub',
    enforce: 'pre',
    resolveId(id, _importer, options) {
      if (id === 'firebase/app' || id === 'firebase/auth' || id === './firebase-config') {
        const envName = (this as any).environment?.name
        console.log(`[fb-stub] ${id} env=${envName} ssr=${options?.ssr}`)
        // Stub in any non-client environment
        if (options?.ssr || (envName && envName !== 'client')) {
          return `\0fb-stub:${id}`
        }
      }
    },
    load(id) {
      if (id.startsWith('\0fb-stub:')) {
        return 'export default {}; export const initializeApp = () => ({}); export const getApps = () => []; export const getAuth = () => ({}); export const onAuthStateChanged = () => () => {}; export const signInWithPopup = async () => ({}); export const GoogleAuthProvider = class {}; export const signInWithEmailAndPassword = async () => ({}); export const createUserWithEmailAndPassword = async () => ({}); export const signOut = async () => {}; export const firebaseConfig = {};'
      }
    },
  }
}

export default defineConfig(({ command }) => ({
  plugins: [
    firebaseSSRStub(),
    cloudflare({
      viteEnvironment: { name: 'ssr' },
      ...(command === 'serve' ? { config: { observability: { enabled: false } } } : {}),
    }),
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
}))
