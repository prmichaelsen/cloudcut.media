// cloudcut-media-server API types

export interface MediaUploadResponse {
  id: string
  filename: string
  content_type: string
  size: number
  created_at: string
  storage_path: string
}

export interface MediaInfo {
  id: string
  filename: string
  content_type: string
  size: number
  created_at: string
  storage_path: string
  metadata?: {
    width?: number
    height?: number
    duration?: number
    codec?: string
    bitrate?: number
  }
}

export interface MediaUrlResponse {
  url: string
  expires_at: string
}

export interface ApiError {
  error: string
  message: string
  status: number
}
