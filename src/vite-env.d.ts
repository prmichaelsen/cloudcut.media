/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLOUDCUT_MEDIA_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
