import { CloudcutMediaApiClient } from './api-client'
import type { MediaUploadResponse, MediaInfo, MediaUrlResponse } from './types'

/**
 * High-level media service for cloudcut-media operations
 */
export class MediaService {
  /**
   * Upload a video file and get metadata
   */
  static async uploadVideo(file: File): Promise<MediaUploadResponse> {
    try {
      console.log(`[MediaService] Uploading video: ${file.name} (${file.size} bytes)`)
      const result = await CloudcutMediaApiClient.uploadMedia(file)
      console.log(`[MediaService] Upload complete: ${result.id}`)
      return result
    } catch (error) {
      console.error('[MediaService] Upload failed:', error)
      throw error
    }
  }

  /**
   * Get information about an uploaded media file
   */
  static async getMediaInfo(mediaId: string): Promise<MediaInfo> {
    try {
      return await CloudcutMediaApiClient.getMediaInfo(mediaId)
    } catch (error) {
      console.error(`[MediaService] Failed to get media info for ${mediaId}:`, error)
      throw error
    }
  }

  /**
   * Get a signed URL to download or stream media
   */
  static async getMediaUrl(mediaId: string): Promise<string> {
    try {
      const result = await CloudcutMediaApiClient.getMediaUrl(mediaId)
      return result.url
    } catch (error) {
      console.error(`[MediaService] Failed to get URL for ${mediaId}:`, error)
      throw error
    }
  }

  /**
   * Upload and immediately get the playback URL
   */
  static async uploadAndGetUrl(file: File): Promise<{ id: string; url: string; info: MediaUploadResponse }> {
    const info = await this.uploadVideo(file)
    const url = await this.getMediaUrl(info.id)
    return { id: info.id, url, info }
  }
}
