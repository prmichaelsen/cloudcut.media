/**
 * Configuration for cloudcut-media-server API
 */
export const CLOUDCUT_MEDIA_CONFIG = {
  baseUrl:
    import.meta.env.VITE_CLOUDCUT_MEDIA_URL ||
    'https://cloudcut-media-server-868795766038.us-central1.run.app/api/v1',
} as const
