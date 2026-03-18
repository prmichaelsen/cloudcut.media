import type { MediaUploadResponse, MediaInfo, MediaUrlResponse } from './types'
import { CLOUDCUT_MEDIA_CONFIG } from './config'

export class CloudcutMediaApiClient {
  private static baseUrl = CLOUDCUT_MEDIA_CONFIG.baseUrl

  /**
   * Make a request to the cloudcut-media-server API
   */
  private static async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`cloudcut-media API error ${response.status}: ${error}`)
    }

    return response.json()
  }

  /**
   * Upload a file to the media server
   */
  static async uploadMedia(file: File): Promise<MediaUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.baseUrl}/media/upload`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type - browser will set it with boundary for multipart/form-data
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Media upload failed ${response.status}: ${error}`)
    }

    return response.json()
  }

  /**
   * Get media information by ID
   */
  static async getMediaInfo(id: string): Promise<MediaInfo> {
    return this.request<MediaInfo>(`/media/${id}`)
  }

  /**
   * Get a signed download URL for media
   */
  static async getMediaUrl(id: string): Promise<MediaUrlResponse> {
    return this.request<MediaUrlResponse>(`/media/${id}/url`)
  }
}
