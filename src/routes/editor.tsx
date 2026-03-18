import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import { uploadVideo, type UploadProgress } from '~/lib/upload'
import { trimVideo, loadFFmpeg, getVideoDuration } from '~/lib/ffmpeg'

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

  // Trim state
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false)
  const [loadingFfmpeg, setLoadingFfmpeg] = useState(false)
  const [videoDuration, setVideoDuration] = useState(0)
  const [inPoint, setInPoint] = useState(0)
  const [outPoint, setOutPoint] = useState(0)
  const [trimming, setTrimming] = useState(false)
  const [trimProgress, setTrimProgress] = useState(0)
  const [trimmedBlob, setTrimmedBlob] = useState<Blob | null>(null)

  // Load FFmpeg when component mounts
  useEffect(() => {
    const initFFmpeg = async () => {
      try {
        setLoadingFfmpeg(true)
        await loadFFmpeg()
        setFfmpegLoaded(true)
      } catch (err) {
        console.error('FFmpeg load error:', err)
        setError('Failed to load video processor')
      } finally {
        setLoadingFfmpeg(false)
      }
    }
    initFFmpeg()
  }, [])

  // Get video duration when video is uploaded
  useEffect(() => {
    if (file) {
      getVideoDuration(file).then(duration => {
        setVideoDuration(duration)
        setOutPoint(duration)
      })
    }
  }, [file])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError(null)
      setTrimmedBlob(null)
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

  const handleSetInPoint = () => {
    if (videoRef.current) {
      setInPoint(videoRef.current.currentTime)
    }
  }

  const handleSetOutPoint = () => {
    if (videoRef.current) {
      setOutPoint(videoRef.current.currentTime)
    }
  }

  const handleTrim = async () => {
    if (!file || !ffmpegLoaded) return

    try {
      setTrimming(true)
      setError(null)

      const blob = await trimVideo(file, {
        startTime: inPoint,
        endTime: outPoint,
        onProgress: (progress) => {
          setTrimProgress(progress)
        }
      })

      setTrimmedBlob(blob)
      setTrimProgress(0)
    } catch (err) {
      console.error('Trim error:', err)
      setError(err instanceof Error ? err.message : 'Trim failed')
    } finally {
      setTrimming(false)
    }
  }

  const handleDownload = () => {
    if (!trimmedBlob) return

    const url = URL.createObjectURL(trimmedBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trimmed-${file?.name || 'video.mp4'}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
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

              {/* Trim Section */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-bold mb-4">3. Trim Video</h2>

                {loadingFfmpeg && (
                  <div className="bg-blue-900/30 border border-blue-700 rounded p-4 mb-4">
                    <p className="text-blue-300 text-sm">Loading video processor...</p>
                  </div>
                )}

                {ffmpegLoaded && (
                  <>
                    <div className="space-y-4 mb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-400 block mb-2">In Point</label>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSetInPoint}
                              disabled={trimming}
                              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                              Set In ({formatTime(inPoint)})
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-400 block mb-2">Out Point</label>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSetOutPoint}
                              disabled={trimming}
                              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                              Set Out ({formatTime(outPoint)})
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-700 p-3 rounded">
                        <p className="text-sm text-gray-300">
                          Duration: {formatTime(outPoint - inPoint)} (from {formatTime(inPoint)} to {formatTime(outPoint)})
                        </p>
                      </div>
                    </div>

                    {trimming && (
                      <div className="bg-purple-900/30 border border-purple-700 rounded p-4 mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Processing video...</span>
                          <span>{trimProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${trimProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button
                        onClick={handleTrim}
                        disabled={trimming || !file || outPoint <= inPoint}
                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {trimming ? 'Processing...' : 'Trim Video'}
                      </button>

                      {trimmedBlob && (
                        <button
                          onClick={handleDownload}
                          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Download Trimmed Video
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}