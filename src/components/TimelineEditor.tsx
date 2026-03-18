import { useRef, useState, useCallback } from 'react'

export interface Clip {
  id: string
  trackIndex: number
  startTime: number
  duration: number
  sourceOffset: number
  sourceUrl: string
  volume: number
  color: string
}

interface TimelineEditorProps {
  clips: Clip[]
  selectedClipId: string | null
  currentTime: number
  totalDuration: number
  trackCount: number
  onClipSelect: (clipId: string | null) => void
  onClipMove: (clipId: string, startTime: number, trackIndex: number) => void
  onClipResize: (clipId: string, startTime: number, duration: number, sourceOffset: number) => void
  onSeek: (time: number) => void
}

const TRACK_H = 44
const HANDLE_ZONE = 14
const MIN_DUR = 0.05

type Drag =
  | { type: 'seek' }
  | { type: 'move'; clipId: string; grabTime: number }
  | { type: 'in'; clipId: string; origStart: number; origDur: number; origOff: number }
  | { type: 'out'; clipId: string; origStart: number; origDur: number }
  | null

export function TimelineEditor({
  clips,
  selectedClipId,
  currentTime,
  totalDuration,
  trackCount,
  onClipSelect,
  onClipMove,
  onClipResize,
  onSeek,
}: TimelineEditorProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<Drag>(null)
  const dragRef = useRef<Drag>(null)
  const [pv, setPv] = useState<Record<string, Partial<Clip>>>({})
  const pvRef = useRef(pv)

  dragRef.current = drag
  pvRef.current = pv

  const toPct = (t: number) => (totalDuration > 0 ? (t / totalDuration) * 100 : 0)

  const xToTime = useCallback(
    (cx: number) => {
      const r = containerRef.current?.getBoundingClientRect()
      if (!r || totalDuration <= 0) return 0
      return Math.max(0, Math.min(totalDuration, ((cx - r.left) / r.width) * totalDuration))
    },
    [totalDuration],
  )

  const yToTrack = useCallback(
    (cy: number) => {
      const r = containerRef.current?.getBoundingClientRect()
      if (!r) return 0
      return Math.max(0, Math.min(trackCount - 1, Math.floor((cy - r.top) / TRACK_H)))
    },
    [trackCount],
  )

  const clipDisplay = (clip: Clip): Clip => {
    const p = pv[clip.id]
    return p ? { ...clip, ...p } : clip
  }

  // Get the selected clip's display state (with drag preview)
  const selectedClip = selectedClipId ? clips.find((c) => c.id === selectedClipId) : null
  const selectedDisplay = selectedClip ? clipDisplay(selectedClip) : null

  const onDown = useCallback(
    (e: React.PointerEvent) => {
      const r = containerRef.current?.getBoundingClientRect()
      if (!r || totalDuration <= 0) return

      e.preventDefault()
      wrapperRef.current?.setPointerCapture(e.pointerId)

      const t = xToTime(e.clientX)
      const tk = yToTrack(e.clientY)
      const px = e.clientX - r.left
      const relY = (e.clientY - r.top) / (trackCount * TRACK_H)

      // Above tracks (playhead grab area) — always seek
      if (e.clientY < r.top) {
        onSeek(t)
        setDrag({ type: 'seek' })
        return
      }

      // Bottom 30%: check in/out handle proximity (only when a clip is selected)
      if (relY > 0.7 && selectedClipId) {
        const sel = clips.find((c) => c.id === selectedClipId)
        if (sel) {
          const inX = (sel.startTime / totalDuration) * r.width
          const outX = ((sel.startTime + sel.duration) / totalDuration) * r.width

          const distIn = Math.abs(px - inX)
          const distOut = Math.abs(px - outX)

          if (distIn < HANDLE_ZONE || distOut < HANDLE_ZONE) {
            if (distIn <= distOut) {
              setDrag({
                type: 'in',
                clipId: sel.id,
                origStart: sel.startTime,
                origDur: sel.duration,
                origOff: sel.sourceOffset,
              })
            } else {
              setDrag({
                type: 'out',
                clipId: sel.id,
                origStart: sel.startTime,
                origDur: sel.duration,
              })
            }
            return
          }
        }
      }

      // Check clip body hit (reverse for z-order)
      const hit = [...clips]
        .reverse()
        .find((c) => c.trackIndex === tk && t >= c.startTime && t <= c.startTime + c.duration)

      if (hit) {
        onClipSelect(hit.id)
        setDrag({ type: 'move', clipId: hit.id, grabTime: t - hit.startTime })
        return
      }

      // Empty space — seek + deselect
      onClipSelect(null)
      onSeek(t)
      setDrag({ type: 'seek' })
    },
    [clips, selectedClipId, totalDuration, trackCount, xToTime, yToTrack, onClipSelect, onSeek],
  )

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      const d = dragRef.current
      if (!d) return
      e.preventDefault()

      const t = xToTime(e.clientX)
      const tk = yToTrack(e.clientY)

      if (d.type === 'seek') {
        onSeek(t)
        return
      }

      if (d.type === 'move') {
        const c = clips.find((x) => x.id === d.clipId)
        if (!c) return
        setPv({ [d.clipId]: { startTime: Math.max(0, t - d.grabTime), trackIndex: tk } })
        return
      }

      if (d.type === 'in') {
        const minS = d.origStart - d.origOff
        const maxS = d.origStart + d.origDur - MIN_DUR
        const ns = Math.max(minS, Math.min(maxS, t))
        const delta = ns - d.origStart
        setPv({
          [d.clipId]: {
            startTime: ns,
            duration: d.origDur - delta,
            sourceOffset: d.origOff + delta,
          },
        })
        return
      }

      if (d.type === 'out') {
        const nd = Math.max(MIN_DUR, t - d.origStart)
        setPv({ [d.clipId]: { duration: nd } })
      }
    },
    [clips, xToTime, yToTrack, onSeek],
  )

  const onUp = useCallback(() => {
    const d = dragRef.current
    const currentPv = pvRef.current

    if (d && d.type !== 'seek') {
      const cid = 'clipId' in d ? d.clipId : null
      if (cid && currentPv[cid]) {
        const c = clips.find((x) => x.id === cid)
        if (c) {
          const p = currentPv[cid]
          if (d.type === 'move') {
            onClipMove(cid, p.startTime ?? c.startTime, p.trackIndex ?? c.trackIndex)
          } else {
            onClipResize(
              cid,
              p.startTime ?? c.startTime,
              p.duration ?? c.duration,
              p.sourceOffset ?? c.sourceOffset,
            )
          }
        }
      }
    }

    setDrag(null)
    setPv({})
  }, [clips, onClipMove, onClipResize])

  const phPct = toPct(currentTime)
  const inPct = selectedDisplay ? toPct(selectedDisplay.startTime) : 0
  const outPct = selectedDisplay ? toPct(selectedDisplay.startTime + selectedDisplay.duration) : 0

  return (
    <div
      ref={wrapperRef}
      className="relative select-none pt-5 pb-3"
      style={{ touchAction: 'none' }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      {/* Playhead — rendered outside the clipped container so diamond isn't clipped */}
      <div
        className="absolute pointer-events-none z-20"
        style={{
          left: `${phPct}%`,
          top: 0,
          bottom: 0,
        }}
      >
        {/* Vertical line — spans from diamond down through tracks */}
        <div
          className={`absolute top-3 bottom-0 w-[2px] -translate-x-1/2 transition-colors duration-75 ${
            drag?.type === 'seek' ? 'bg-teal-300' : 'bg-teal-400'
          }`}
        />
        {/* Diamond handle — sits above the tracks, easy to grab */}
        <div
          className={`absolute top-0 -translate-x-1/2 w-4 h-4 rotate-45 border-2 transition-all duration-75 ${
            drag?.type === 'seek'
              ? 'bg-teal-300 border-teal-200 scale-125 shadow-[0_0_8px_rgba(94,234,212,0.5)]'
              : 'bg-teal-400 border-teal-300'
          }`}
        />
      </div>

      {/* Main clip bar */}
      <div
        ref={containerRef}
        className={`relative rounded-lg border border-gray-700/50 mt-2 ${
          drag?.type === 'move'
            ? 'cursor-grabbing'
            : drag?.type === 'in' || drag?.type === 'out'
              ? 'cursor-col-resize'
              : 'cursor-crosshair'
        }`}
        style={{ height: trackCount * TRACK_H, background: '#0c0f16' }}
      >
        {/* Clipped layer for overlays (respects rounded corners) */}
        <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
          {/* Track lane dividers */}
          {Array.from({ length: trackCount }).map((_, i) => (
            <div
              key={i}
              className="absolute inset-x-0 border-b border-white/[0.04]"
              style={{ top: i * TRACK_H, height: TRACK_H }}
            />
          ))}

          {/* Dimmed region: before in-point (only when clip selected) */}
          {selectedDisplay && (
            <div className="absolute inset-y-0 left-0 bg-black/40" style={{ width: `${inPct}%` }} />
          )}

          {/* Dimmed region: after out-point (only when clip selected) */}
          {selectedDisplay && (
            <div
              className="absolute inset-y-0 right-0 bg-black/40"
              style={{ width: `${100 - outPct}%` }}
            />
          )}

          {/* Selected region highlight */}
          {selectedDisplay && (
            <div
              className="absolute inset-y-0 border-y border-blue-400/20"
              style={{ left: `${inPct}%`, width: `${outPct - inPct}%` }}
            />
          )}
        </div>

        {/* Clips */}
        {clips.map((clip) => {
          const c = clipDisplay(clip)
          const sel = clip.id === selectedClipId
          const leftPct = toPct(c.startTime)
          const widthPct = toPct(c.duration)

          return (
            <div
              key={clip.id}
              className={`absolute rounded-[4px] transition-shadow ${
                sel ? 'ring-[1.5px] ring-white/70 z-10' : 'z-[1]'
              } ${!drag ? (sel ? 'cursor-grab' : 'cursor-pointer') : ''}`}
              style={{
                left: `${leftPct}%`,
                width: `${Math.max(widthPct, 0.5)}%`,
                top: c.trackIndex * TRACK_H + 4,
                height: TRACK_H - 8,
                background: `linear-gradient(135deg, ${clip.color}55, ${clip.color}30)`,
                borderLeft: `3px solid ${clip.color}`,
              }}
            />
          )
        })}

        {/* In-point marker — only when clip selected */}
        {selectedDisplay && (
          <div className="absolute inset-y-0 pointer-events-none z-[15]" style={{ left: `${inPct}%` }}>
            {/* Vertical line */}
            <div
              className={`absolute top-0 bottom-0 w-[2px] -translate-x-1/2 transition-colors duration-75 ${
                drag?.type === 'in' ? 'bg-blue-300' : 'bg-blue-400/80'
              }`}
            />
            {/* Circle handle at bottom */}
            <div
              className={`absolute bottom-0 -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all duration-75 ${
                drag?.type === 'in'
                  ? 'bg-blue-300 border-white scale-125 shadow-[0_0_8px_rgba(96,165,250,0.5)]'
                  : 'bg-blue-500 border-blue-200'
              }`}
            />
          </div>
        )}

        {/* Out-point marker — only when clip selected */}
        {selectedDisplay && (
          <div className="absolute inset-y-0 pointer-events-none z-[15]" style={{ left: `${outPct}%` }}>
            {/* Vertical line */}
            <div
              className={`absolute top-0 bottom-0 w-[2px] -translate-x-1/2 transition-colors duration-75 ${
                drag?.type === 'out' ? 'bg-blue-300' : 'bg-blue-400/80'
              }`}
            />
            {/* Circle handle at bottom */}
            <div
              className={`absolute bottom-0 -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all duration-75 ${
                drag?.type === 'out'
                  ? 'bg-blue-300 border-white scale-125 shadow-[0_0_8px_rgba(96,165,250,0.5)]'
                  : 'bg-blue-500 border-blue-200'
              }`}
            />
          </div>
        )}

        {/* (Playhead rendered outside container — see above) */}
      </div>

    </div>
  )
}
