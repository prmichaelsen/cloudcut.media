import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useRef, useEffect, useCallback } from 'react'
import { TimelineEditor } from '~/components/TimelineEditor'

export const Route = createFileRoute('/demo/timeline')({
  component: TimelineDemo,
})

function TimelineDemo() {
  const duration = 60 // fake 60s clip
  const [currentTime, setCurrentTime] = useState(15)
  const [inPoint, setInPoint] = useState(10)
  const [outPoint, setOutPoint] = useState(45)
  const [playing, setPlaying] = useState(false)
  const rafRef = useRef<number>(0)
  const lastFrameRef = useRef<number>(0)

  // Generate fake waveform data
  const [waveformData] = useState(() => {
    const samples: number[] = []
    for (let i = 0; i < 200; i++) {
      const base = 0.2 + Math.random() * 0.3
      const speech = Math.sin(i * 0.15) * 0.3 + 0.5
      const burst = i > 40 && i < 60 ? 0.3 : 0
      const quiet = i > 130 && i < 160 ? -0.2 : 0
      samples.push(Math.min(1, Math.max(0.05, base * speech + burst + quiet)))
    }
    return samples
  })

  // Simulate playback
  const tick = useCallback(
    (timestamp: number) => {
      if (!lastFrameRef.current) lastFrameRef.current = timestamp
      const delta = (timestamp - lastFrameRef.current) / 1000
      lastFrameRef.current = timestamp

      setCurrentTime((prev) => {
        const next = prev + delta
        if (next >= duration) {
          setPlaying(false)
          return 0
        }
        return next
      })

      rafRef.current = requestAnimationFrame(tick)
    },
    [duration],
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
          <h1 className="text-lg font-semibold tracking-tight">
            Timeline Demo
          </h1>
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
              <p className="text-sm text-gray-500">
                {playing ? 'Playing' : 'Paused'}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            <TimelineEditor
              duration={duration}
              currentTime={currentTime}
              inPoint={inPoint}
              outPoint={outPoint}
              onSeek={(t) => {
                setCurrentTime(t)
                setPlaying(false)
              }}
              onInPointChange={setInPoint}
              onOutPointChange={setOutPoint}
              waveformData={waveformData}
            />

            {/* Info bar */}
            <div className="flex items-center justify-between text-xs text-gray-400 font-mono px-1">
              <span>IN {formatTime(inPoint)}</span>
              <span>
                Selection: {formatTime(outPoint - inPoint)}
              </span>
              <span>OUT {formatTime(outPoint)}</span>
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
            <button
              onClick={() => {
                setInPoint(0)
                setOutPoint(duration)
              }}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-sm rounded transition-colors"
            >
              Clear Selection
            </button>
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-500 space-y-1 text-center">
            <p>Drag the <span className="text-white/70">diamond</span> at the top to scrub the playhead</p>
            <p>Drag the <span className="text-blue-400/70">circles</span> at the bottom to set in/out trim points</p>
            <p>Tap the middle of the bar to jump the playhead</p>
          </div>
        </div>
      </main>
    </div>
  )
}
