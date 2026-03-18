import { useRef, useCallback, useEffect, useState } from 'react'

interface TimelineEditorProps {
  duration: number
  currentTime: number
  inPoint: number
  outPoint: number
  onSeek: (time: number) => void
  onInPointChange: (time: number) => void
  onOutPointChange: (time: number) => void
  waveformData?: number[]
}

type ActiveHandle = 'playhead' | 'in' | 'out' | null

export function TimelineEditor({
  duration,
  currentTime,
  inPoint,
  outPoint,
  onSeek,
  onInPointChange,
  onOutPointChange,
  waveformData,
}: TimelineEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeHandle, setActiveHandle] = useState<ActiveHandle>(null)
  const activeHandleRef = useRef<ActiveHandle>(null)

  // Keep ref in sync for event handlers
  activeHandleRef.current = activeHandle

  const timeToPercent = (time: number) =>
    duration > 0 ? (time / duration) * 100 : 0

  const clientXToTime = useCallback(
    (clientX: number) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect || duration <= 0) return 0
      const x = clientX - rect.left
      const ratio = Math.max(0, Math.min(1, x / rect.width))
      return ratio * duration
    },
    [duration],
  )

  // Waveform canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const dpr = window.devicePixelRatio || 1
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, rect.width, rect.height)

    const samples = waveformData
    if (!samples || samples.length === 0) {
      // Placeholder: subtle noise pattern
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'
      for (let x = 0; x < rect.width; x += 3) {
        const h = Math.random() * rect.height * 0.3 + rect.height * 0.1
        const y = (rect.height - h) / 2
        ctx.fillRect(x, y, 1.5, h)
      }
      return
    }

    const barWidth = rect.width / samples.length
    const centerY = rect.height / 2

    for (let i = 0; i < samples.length; i++) {
      const amplitude = samples[i]
      const barHeight = amplitude * rect.height * 0.8
      const x = i * barWidth

      // Gradient from center outward
      const gradient = ctx.createLinearGradient(x, centerY - barHeight / 2, x, centerY + barHeight / 2)
      gradient.addColorStop(0, 'rgba(148, 163, 184, 0.15)')
      gradient.addColorStop(0.5, 'rgba(148, 163, 184, 0.35)')
      gradient.addColorStop(1, 'rgba(148, 163, 184, 0.15)')

      ctx.fillStyle = gradient
      ctx.fillRect(x, centerY - barHeight / 2, Math.max(barWidth - 0.5, 1), barHeight)
    }
  }, [waveformData])

  // Resize observer for canvas
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(() => {
      // Trigger re-render of waveform
      const canvas = canvasRef.current
      if (!canvas) return
      const dpr = window.devicePixelRatio || 1
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`

      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, rect.width, rect.height)

      const samples = waveformData
      if (!samples || samples.length === 0) return

      const barWidth = rect.width / samples.length
      const centerY = rect.height / 2

      for (let i = 0; i < samples.length; i++) {
        const amplitude = samples[i]
        const barHeight = amplitude * rect.height * 0.8
        const x = i * barWidth
        const gradient = ctx.createLinearGradient(x, centerY - barHeight / 2, x, centerY + barHeight / 2)
        gradient.addColorStop(0, 'rgba(148, 163, 184, 0.15)')
        gradient.addColorStop(0.5, 'rgba(148, 163, 184, 0.35)')
        gradient.addColorStop(1, 'rgba(148, 163, 184, 0.15)')
        ctx.fillStyle = gradient
        ctx.fillRect(x, centerY - barHeight / 2, Math.max(barWidth - 0.5, 1), barHeight)
      }
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [waveformData])

  // Pointer event handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect || duration <= 0) return

      e.preventDefault()
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)

      const relativeY = (e.clientY - rect.top) / rect.height
      const time = clientXToTime(e.clientX)

      if (relativeY < 0.3) {
        // Top zone: playhead
        setActiveHandle('playhead')
        onSeek(time)
      } else if (relativeY > 0.7) {
        // Bottom zone: nearest in/out handle
        const distToIn = Math.abs(time - inPoint)
        const distToOut = Math.abs(time - outPoint)
        if (distToIn <= distToOut) {
          setActiveHandle('in')
          onInPointChange(Math.min(time, outPoint - 0.01))
        } else {
          setActiveHandle('out')
          onOutPointChange(Math.max(time, inPoint + 0.01))
        }
      } else {
        // Middle zone: tap-to-seek
        setActiveHandle('playhead')
        onSeek(time)
      }
    },
    [duration, clientXToTime, inPoint, outPoint, onSeek, onInPointChange, onOutPointChange],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const handle = activeHandleRef.current
      if (!handle) return

      e.preventDefault()
      const time = clientXToTime(e.clientX)

      switch (handle) {
        case 'playhead':
          onSeek(Math.max(0, Math.min(duration, time)))
          break
        case 'in':
          onInPointChange(Math.max(0, Math.min(time, outPoint - 0.01)))
          break
        case 'out':
          onOutPointChange(Math.max(inPoint + 0.01, Math.min(time, duration)))
          break
      }
    },
    [clientXToTime, duration, inPoint, outPoint, onSeek, onInPointChange, onOutPointChange],
  )

  const handlePointerUp = useCallback(() => {
    setActiveHandle(null)
  }, [])

  const playheadPct = timeToPercent(currentTime)
  const inPct = timeToPercent(inPoint)
  const outPct = timeToPercent(outPoint)

  return (
    <div className="relative select-none py-3 pb-3" style={{ touchAction: 'none' }}>
      {/* Main clip bar */}
      <div
        ref={containerRef}
        className="relative h-[88px] bg-gray-800 rounded-lg cursor-crosshair border border-gray-700/50"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Clipped layer for waveform and overlays (respects rounded corners) */}
        <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
          {/* Waveform canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0"
          />

          {/* Dimmed region: before in-point */}
          <div
            className="absolute inset-y-0 left-0 bg-black/50"
            style={{ width: `${inPct}%` }}
          />

          {/* Dimmed region: after out-point */}
          <div
            className="absolute inset-y-0 right-0 bg-black/50"
            style={{ width: `${100 - outPct}%` }}
          />

          {/* Selected region highlight */}
          <div
            className="absolute inset-y-0 border-y border-blue-400/20"
            style={{
              left: `${inPct}%`,
              width: `${outPct - inPct}%`,
            }}
          />
        </div>

        {/* In-point marker */}
        <div
          className="absolute inset-y-0 pointer-events-none"
          style={{ left: `${inPct}%` }}
        >
          {/* Vertical line */}
          <div
            className={`absolute top-0 bottom-0 w-[2px] -translate-x-1/2 transition-colors duration-75 ${
              activeHandle === 'in' ? 'bg-blue-300' : 'bg-blue-400/80'
            }`}
          />
          {/* Circle handle at bottom */}
          <div
            className={`absolute bottom-0 -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all duration-75 ${
              activeHandle === 'in'
                ? 'bg-blue-300 border-white scale-125 shadow-[0_0_8px_rgba(96,165,250,0.5)]'
                : 'bg-blue-500 border-blue-200'
            }`}
          />
        </div>

        {/* Out-point marker */}
        <div
          className="absolute inset-y-0 pointer-events-none"
          style={{ left: `${outPct}%` }}
        >
          {/* Vertical line */}
          <div
            className={`absolute top-0 bottom-0 w-[2px] -translate-x-1/2 transition-colors duration-75 ${
              activeHandle === 'out' ? 'bg-blue-300' : 'bg-blue-400/80'
            }`}
          />
          {/* Circle handle at bottom */}
          <div
            className={`absolute bottom-0 -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all duration-75 ${
              activeHandle === 'out'
                ? 'bg-blue-300 border-white scale-125 shadow-[0_0_8px_rgba(96,165,250,0.5)]'
                : 'bg-blue-500 border-blue-200'
            }`}
          />
        </div>

        {/* Playhead marker */}
        <div
          className="absolute inset-y-0 pointer-events-none"
          style={{ left: `${playheadPct}%` }}
        >
          {/* Vertical line */}
          <div
            className={`absolute top-0 bottom-0 w-[2px] -translate-x-1/2 transition-colors duration-75 ${
              activeHandle === 'playhead' ? 'bg-teal-300' : 'bg-teal-400'
            }`}
          />
          {/* Diamond handle at top */}
          <div
            className={`absolute top-0 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rotate-45 border-2 transition-all duration-75 ${
              activeHandle === 'playhead'
                ? 'bg-teal-300 border-teal-200 scale-125 shadow-[0_0_8px_rgba(94,234,212,0.5)]'
                : 'bg-teal-400 border-teal-300'
            }`}
          />
        </div>

        {/* Zone debug indicators (hidden, uncomment for debugging) */}
        {/* <div className="absolute inset-x-0 top-0 h-[30%] border-b border-red-500/20 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-[30%] border-t border-green-500/20 pointer-events-none" /> */}
      </div>
    </div>
  )
}
