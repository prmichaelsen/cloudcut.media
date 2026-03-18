import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useRef, useEffect, useCallback } from 'react'
import { uploadVideo, type UploadProgress } from '../lib/upload'
// Lazy import — ffmpeg uses browser APIs that crash during SSR
const getVideoDuration = async (file: File): Promise<number> => {
  const { getVideoDuration: fn } = await import('../lib/ffmpeg')
  return fn(file)
}
import { Scissors } from 'lucide-react'
import { TimelineEditor, type Clip } from '../components/TimelineEditor'
import { useAuth } from '../lib/auth'

export const Route = createFileRoute('/editor')({
  component: Editor,
})

function Editor() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [videoKey, setVideoKey] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Playback state
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const rafRef = useRef<number>(0)

  const [videoDuration, setVideoDuration] = useState(0)

  // Clip state
  const [clips, setClips] = useState<Clip[]>([])
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: '/login' })
    }
  }, [authLoading, user, navigate])

  // Get video duration when file loads
  useEffect(() => {
    if (file) {
      getVideoDuration(file).then((dur) => {
        setVideoDuration(dur)
      })
    }
  }, [file])

  // Create initial clip when duration is known
  useEffect(() => {
    if (videoDuration > 0 && clips.length === 0) {
      setClips([
        {
          id: crypto.randomUUID(),
          trackIndex: 0,
          startTime: 0,
          duration: videoDuration,
          sourceOffset: 0,
          color: '#3b82f6',
        },
      ])
    }
  }, [videoDuration, clips.length])

  // Sync playhead with video playback
  const syncPlayhead = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
      if (!videoRef.current.paused) {
        rafRef.current = requestAnimationFrame(syncPlayhead)
      }
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onPlay = () => {
      setPlaying(true)
      rafRef.current = requestAnimationFrame(syncPlayhead)
    }
    const onPause = () => {
      setPlaying(false)
      cancelAnimationFrame(rafRef.current)
    }
    const onEnded = () => {
      setPlaying(false)
      cancelAnimationFrame(rafRef.current)
    }

    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('ended', onEnded)

    return () => {
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('ended', onEnded)
      cancelAnimationFrame(rafRef.current)
    }
  }, [videoKey, syncPlayhead])

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

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
      if (playing) {
        videoRef.current.pause()
      }
    }
  }

  const handlePlayPause = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
    } else {
      videoRef.current.pause()
    }
  }

  const handleClipMove = (clipId: string, startTime: number, trackIndex: number) => {
    setClips((prev) => prev.map((c) => (c.id === clipId ? { ...c, startTime, trackIndex } : c)))
  }

  const handleClipResize = (
    clipId: string,
    startTime: number,
    duration: number,
    sourceOffset: number,
  ) => {
    setClips((prev) =>
      prev.map((c) => (c.id === clipId ? { ...c, startTime, duration, sourceOffset } : c)),
    )
  }

  const handleSplit = () => {
    const target = clips.find(
      (c) => currentTime > c.startTime && currentTime < c.startTime + c.duration,
    )
    if (!target) return

    const splitAt = currentTime - target.startTime

    setClips((prev) => [
      ...prev.map((c) => (c.id === target.id ? { ...c, duration: splitAt } : c)),
      {
        id: crypto.randomUUID(),
        trackIndex: target.trackIndex,
        startTime: currentTime,
        duration: target.duration - splitAt,
        sourceOffset: target.sourceOffset + splitAt,
        color: target.color,
      },
    ])
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Computed timeline values
  const maxClipEnd = clips.reduce((max, c) => Math.max(max, c.startTime + c.duration), 0)
  const totalDuration = Math.max(videoDuration, maxClipEnd) + 2
  const maxTrack = clips.reduce((max, c) => Math.max(max, c.trackIndex), 0)
  const trackCount = Math.max(3, maxTrack + 2)

  // Auth loading state
  if (authLoading) {
    return (
      <div className="h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    )
  }

  if (!user) return null

  // Pre-upload state
  if (!videoKey) {
    return (
      <div className="h-screen bg-gray-950 text-white flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
          <Link to="/" className="text-xs text-gray-500 hover:text-white">
            ← Home
          </Link>
          <span className="text-xs text-gray-500 tracking-wider uppercase">CloudCut</span>
          <div className="w-12" />
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-sm w-full space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-700 hover:border-teal-700 rounded-2xl p-12 text-center cursor-pointer transition-colors group"
            >
              <div className="w-16 h-16 mx-auto bg-gray-800 group-hover:bg-teal-900/30 rounded-2xl flex items-center justify-center mb-4 transition-colors">
                <span className="text-3xl text-gray-500 group-hover:text-teal-400 transition-colors">
                  +
                </span>
              </div>
              <p className="text-sm text-gray-400 group-hover:text-gray-300">
                Tap to select a video
              </p>
              <p className="text-xs text-gray-600 mt-1">MP4, WebM, MOV</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {file && (
              <div className="space-y-3">
                <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                  <p className="text-sm text-gray-300 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>

                {uploadProgress ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Uploading...</span>
                      <span>{uploadProgress.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5">
                      <div
                        className="bg-teal-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress.percentage}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload & Edit'}
                  </button>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-xl p-3">
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Editor state — video preview + multi-track timeline only
  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col">
      {/* Minimal top bar */}
      <div className="flex items-center justify-between px-4 py-2 z-20">
        <Link to="/" className="text-xs text-gray-500 hover:text-white">
          ← Home
        </Link>
        <span className="text-[10px] text-gray-600 truncate max-w-[120px]">
          {user.email || user.displayName}
        </span>
      </div>

      {/* Full-screen video preview */}
      <div className="flex-1 min-h-0 relative px-3">
        <div className="h-full bg-black rounded-lg overflow-hidden flex items-center justify-center relative">
          <video
            ref={videoRef}
            src={videoKey ? `/api/media/${videoKey}` : undefined}
            className="max-w-full max-h-full"
            playsInline
          />

          {/* Play/pause overlay */}
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center group"
          >
            {!playing && (
              <div className="w-16 h-16 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-0 h-0 border-l-[16px] border-l-white border-y-[10px] border-y-transparent ml-1.5" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-3 py-2">
        <TimelineEditor
          clips={clips}
          selectedClipId={selectedClipId}
          currentTime={currentTime}
          totalDuration={totalDuration}
          trackCount={trackCount}
          onClipSelect={setSelectedClipId}
          onClipMove={handleClipMove}
          onClipResize={handleClipResize}
          onSeek={handleSeek}
        />
        <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono px-1 mt-1">
          <span>{formatTime(0)}</span>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="flex items-center justify-center gap-6 px-4 py-2.5 border-t border-gray-800/50">
        <button
          onClick={handleSplit}
          disabled={!selectedClipId}
          className="flex flex-col items-center gap-1 transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-teal-400 active:text-teal-300"
        >
          <Scissors className="w-5 h-5" />
          <span className="text-[9px] uppercase tracking-wider">Split</span>
        </button>
      </div>

      {/* Error toast */}
      {error && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-red-900/90 backdrop-blur-sm border border-red-700 rounded-lg px-4 py-2 z-40">
          <p className="text-red-300 text-xs">{error}</p>
        </div>
      )}
    </div>
  )
}
