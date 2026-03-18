import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { MediaService } from '~/lib/cloudcut-media'
import type { MediaUploadResponse } from '~/lib/cloudcut-media'

export const Route = createFileRoute('/editor')({
  component: Editor,
})

function Editor() {
  const [uploading, setUploading] = useState(false)
  const [uploadedMedia, setUploadedMedia] = useState<MediaUploadResponse | null>(null)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      setError(null)

      const result = await MediaService.uploadAndGetUrl(file)
      setUploadedMedia(result.info)
      setMediaUrl(result.url)
    } catch (err) {
      console.error('Upload failed:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-blue-400 hover:text-blue-300">
            ← Back
          </Link>
          <h1 className="text-lg font-semibold">Video Editor</h1>
        </div>
        <div className="text-sm text-gray-400">
          Backend Integration Demo
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎬</div>
              <h2 className="text-2xl font-bold mb-2">Media Upload Test</h2>
              <p className="text-gray-400">
                Testing cloudcut-media-server integration
              </p>
            </div>

            <div className="space-y-6">
              {/* Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Upload Video File
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer disabled:opacity-50"
                />
              </div>

              {/* Upload Status */}
              {uploading && (
                <div className="bg-blue-900/30 border border-blue-700 rounded p-4">
                  <p className="text-blue-300">Uploading...</p>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-900/30 border border-red-700 rounded p-4">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* Success Display */}
              {uploadedMedia && mediaUrl && (
                <div className="bg-green-900/30 border border-green-700 rounded p-4 space-y-3">
                  <p className="text-green-300 font-semibold">Upload Successful!</p>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">ID:</span>{' '}
                      <span className="text-white font-mono">{uploadedMedia.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Filename:</span>{' '}
                      <span className="text-white">{uploadedMedia.filename}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Size:</span>{' '}
                      <span className="text-white">{(uploadedMedia.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Type:</span>{' '}
                      <span className="text-white">{uploadedMedia.content_type}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-green-700">
                    <a
                      href={mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm underline"
                    >
                      View Signed URL
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-700">
              <p className="text-xs text-gray-500 text-center">
                Timeline editor UI will be implemented in Milestone 3
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}