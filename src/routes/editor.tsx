import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useRef } from 'react'
import { uploadVideo, type UploadProgress } from '~/lib/upload'

export const Route = createFileRoute('/editor')({
  component: Editor,
})

function Editor() {
  const [file, setFile] = useState<File | null>(null)
  const [videoKey, setVideoKey] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      setUploading(true)
      setError(null)

      const key = await uploadVideo(file, (progress) => {
        setUploadProgress(progress)
      })

      setVideoKey(key)
      setUploadProgress(null)
    } catch (err) {
      console.error('Upload error:', err)
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
          <h1 className="text-lg font-semibold">Video Editor - MVP</h1>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Upload Section */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">1. Upload Video</h2>

            <div className="space-y-4">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer disabled:opacity-50"
              />

              {file && !videoKey && (
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : `Upload ${file.name}`}
                </button>
              )}

              {uploadProgress && (
                <div className="bg-blue-900/30 border border-blue-700 rounded p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Uploading...</span>
                    <span>{uploadProgress.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.percentage}%` }}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-900/30 border border-red-700 rounded p-4">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Video Player Section */}
          {videoKey && (
            <>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-bold mb-4">2. Preview & Trim</h2>
                <video
                  ref={videoRef}
                  src={`/api/media/${videoKey}`}
                  controls
                  className="w-full rounded bg-black"
                />
              </div>

              {/* Trim Section - Coming Soon */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-bold mb-4">3. Trim Controls</h2>
                <p className="text-gray-400 text-sm mb-4">
                  Select in/out points to trim your video (coming next)
                </p>
                <div className="flex gap-4">
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-600 text-gray-400 rounded cursor-not-allowed"
                  >
                    Set In Point
                  </button>
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-600 text-gray-400 rounded cursor-not-allowed"
                  >
                    Set Out Point
                  </button>
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-600 text-gray-400 rounded cursor-not-allowed"
                  >
                    Export Trimmed Video
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}