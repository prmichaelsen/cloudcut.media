import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useRef, useEffect, useCallback } from 'react'
import { TimelineEditor, type Clip } from '../components/TimelineEditor'

export const Route = createFileRoute('/demo/timeline')({
  component: TimelineDemo,
})

function TimelineDemo() {
  const videoDuration = 60
  const [currentTime, setCurrentTime] = useState(15)
  const [playing, setPlaying] = useState(false)
  const rafRef = useRef<number>(0)
  const lastFrameRef = useRef<number>(0)

  const [clips, setClips] = useState<Clip[]>([
    {
      id: 'demo-clip-1',
      trackIndex: 0,
      startTime: 0,
      duration: 60,
      sourceOffset: 0,
      color: '#3b82f6',
    },
  ])
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null)

  const maxClipEnd = clips.reduce((max, c) => Math.max(max, c.startTime + c.duration), 0)
  const totalDuration = Math.max(videoDuration, maxClipEnd) + 2
  const maxTrack = clips.reduce((max, c) => Math.max(max, c.trackIndex), 0)
  const trackCount = Math.max(3, maxTrack + 2)

  // Simulate playback
  const tick = useCallback(
    (timestamp: number) => {
      if (!lastFrameRef.current) lastFrameRef.current = timestamp
      const delta = (timestamp - lastFrameRef.current) / 1000
      lastFrameRef.current = timestamp

      setCurrentTime((prev) => {
        const next = prev + delta
        if (next >= videoDuration) {
          setPlaying(false)
          return 0
        }
        return next
      })

      rafRef.current = requestAnimationFrame(tick)
    },
    [videoDuration],
  )

  useEffect(() => {
    if (playing) {
      lastFrameRef.current = 0
      rafRef.current = requestAnimationFrame(tick)
    } else {
      cancelAnimationFrame(rafRef.current)
    }
    return () => cancelAnimationFrame(rafRef.current)
  }, [playing, tick])

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
    const ms = Math.floor((seconds % 1) * 10)
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-blue-400 hover:text-blue-300 text-sm">
            ← Back
          </Link>
          <h1 className="text-lg font-semibold tracking-tight">Timeline Demo</h1>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-3xl space-y-6">
          {/* Fake video preview area */}
          <div className="aspect-video bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center">
            <div className="text-center space-y-2">
              <p className="text-5xl font-mono tabular-nums tracking-tighter text-white/90">
                {formatTime(currentTime)}
              </p>
              <p className="text-sm text-gray-500">{playing ? 'Playing' : 'Paused'}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            <TimelineEditor
              clips={clips}
              selectedClipId={selectedClipId}
              currentTime={currentTime}
              totalDuration={totalDuration}
              trackCount={trackCount}
              onClipSelect={setSelectedClipId}
              onClipMove={handleClipMove}
              onClipResize={handleClipResize}
              onSeek={(t) => {
                setCurrentTime(t)
                setPlaying(false)
              }}
            />

            {/* Info bar */}
            <div className="flex items-center justify-between text-xs text-gray-400 font-mono px-1">
              <span>{formatTime(currentTime)}</span>
              <span>{clips.length} clips</span>
              <span>{formatTime(totalDuration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setCurrentTime(0)
                setPlaying(false)
              }}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-sm rounded transition-colors"
            >
              Reset
            </button>
            <button
              onClick={() => setPlaying(!playing)}
              className="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 text-sm rounded font-medium transition-colors"
            >
              {playing ? 'Pause' : 'Play'}
            </button>
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-500 space-y-1 text-center">
            <p>Click a clip to select it, then drag edges to resize</p>
            <p>Drag a clip body to move it between tracks</p>
            <p>
              Use the <span className="text-teal-400/70">scissors</span> button to split at
              playhead
            </p>
            <p>Click empty space to seek</p>
          </div>
        </div>
      </main>
    </div>
  )
}
