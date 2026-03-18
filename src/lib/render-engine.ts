/**
 * Canvas 2D render engine for multi-layer timeline compositing.
 *
 * - One hidden <video> per clip (independent seek positions)
 * - Web Audio API with per-clip GainNode for volume control
 * - Composites active clips onto <canvas> in track order (low = back, high = front)
 * - Black for gaps, hard cuts at clip boundaries
 */

export interface RenderClip {
  id: string
  trackIndex: number
  startTime: number
  duration: number
  sourceOffset: number
  sourceUrl: string
  volume: number
}

class ClipDecoder {
  readonly video: HTMLVideoElement
  readonly gainNode: GainNode
  private source: MediaElementAudioSourceNode

  constructor(clip: RenderClip, audioContext: AudioContext) {
    this.video = document.createElement('video')
    this.video.src = clip.sourceUrl
    this.video.preload = 'auto'
    this.video.playsInline = true
    this.video.crossOrigin = 'anonymous'
    // Mute the element — audio is routed through Web Audio API
    this.video.muted = true

    this.source = audioContext.createMediaElementSource(this.video)
    this.gainNode = audioContext.createGain()
    this.gainNode.gain.value = clip.volume
    this.source.connect(this.gainNode)
    this.gainNode.connect(audioContext.destination)
  }

  seekTo(sourceTime: number) {
    this.video.currentTime = sourceTime
  }

  setVolume(volume: number) {
    this.gainNode.gain.value = volume
  }

  play() {
    this.video.play().catch(() => {})
  }

  pause() {
    this.video.pause()
  }

  destroy() {
    this.video.pause()
    this.video.removeAttribute('src')
    this.video.load()
    this.source.disconnect()
    this.gainNode.disconnect()
  }
}

export class RenderEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private clips: RenderClip[] = []
  private decoders = new Map<string, ClipDecoder>()
  private audioContext: AudioContext | null = null
  private rafId = 0
  private timelineTime = 0
  private lastTimestamp = 0
  private _playing = false
  private timeUpdateCb: ((time: number) => void) | null = null
  private playStateChangeCb: ((playing: boolean) => void) | null = null

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext()
    }
    return this.audioContext
  }

  /** Update the clip list. Recreates decoders for new/changed clips. */
  setClips(clips: RenderClip[]) {
    const oldIds = new Set(this.decoders.keys())
    const newIds = new Set(clips.map((c) => c.id))

    // Destroy removed decoders
    for (const id of oldIds) {
      if (!newIds.has(id)) {
        this.decoders.get(id)?.destroy()
        this.decoders.delete(id)
      }
    }

    // Create new decoders, update existing volumes
    for (const clip of clips) {
      const existing = this.decoders.get(clip.id)
      if (existing) {
        // Update volume if changed
        existing.setVolume(clip.volume)
        // Update source URL if changed
        if (existing.video.src !== clip.sourceUrl && !existing.video.src.endsWith(clip.sourceUrl)) {
          existing.destroy()
          this.decoders.set(clip.id, new ClipDecoder(clip, this.getAudioContext()))
        }
      } else {
        this.decoders.set(clip.id, new ClipDecoder(clip, this.getAudioContext()))
      }
    }

    this.clips = clips
  }

  /** Draw a single composited frame at the given timeline time. */
  renderFrame(timelineTime: number) {
    const dpr = window.devicePixelRatio || 1
    const displayW = this.canvas.clientWidth
    const displayH = this.canvas.clientHeight

    // Size canvas to match display (preview resolution)
    if (this.canvas.width !== displayW * dpr || this.canvas.height !== displayH * dpr) {
      this.canvas.width = displayW * dpr
      this.canvas.height = displayH * dpr
    }

    const w = this.canvas.width
    const h = this.canvas.height

    // Black background (gap rendering)
    this.ctx.fillStyle = '#000'
    this.ctx.fillRect(0, 0, w, h)

    // Find all active clips at this time, sorted by track (low = back)
    const active = this.clips
      .filter((c) => timelineTime >= c.startTime && timelineTime < c.startTime + c.duration)
      .sort((a, b) => a.trackIndex - b.trackIndex)

    // Draw each active clip's current frame
    for (const clip of active) {
      const decoder = this.decoders.get(clip.id)
      if (decoder && decoder.video.readyState >= 2) {
        this.ctx.drawImage(decoder.video, 0, 0, w, h)
      }
    }
  }

  /** Seek all clip decoders to the correct source position and draw frame. */
  seekTo(timelineTime: number) {
    this.timelineTime = timelineTime

    for (const clip of this.clips) {
      const decoder = this.decoders.get(clip.id)
      if (!decoder) continue

      if (timelineTime >= clip.startTime && timelineTime < clip.startTime + clip.duration) {
        const sourceTime = clip.sourceOffset + (timelineTime - clip.startTime)
        decoder.seekTo(sourceTime)
      }
    }

    // Draw after a short delay to let video elements seek
    requestAnimationFrame(() => this.renderFrame(timelineTime))
  }

  /** Start continuous playback from a timeline time. */
  startPlayback(fromTime: number) {
    // Resume AudioContext if suspended (browser autoplay policy)
    this.getAudioContext().resume()

    this.timelineTime = fromTime
    this.lastTimestamp = 0
    this._playing = true
    this.playStateChangeCb?.(true)

    // Seek and start all clip decoders
    for (const clip of this.clips) {
      const decoder = this.decoders.get(clip.id)
      if (!decoder) continue

      const sourceTime = clip.sourceOffset + Math.max(0, fromTime - clip.startTime)
      decoder.seekTo(sourceTime)
      decoder.play()
    }

    const tick = (timestamp: number) => {
      if (!this._playing) return

      if (!this.lastTimestamp) this.lastTimestamp = timestamp
      const delta = (timestamp - this.lastTimestamp) / 1000
      this.lastTimestamp = timestamp

      this.timelineTime += delta
      this.renderFrame(this.timelineTime)
      this.timeUpdateCb?.(this.timelineTime)

      // Check if we've passed the end of all clips
      const maxEnd = this.clips.reduce((max, c) => Math.max(max, c.startTime + c.duration), 0)
      if (this.timelineTime >= maxEnd) {
        this.stopPlayback()
        return
      }

      this.rafId = requestAnimationFrame(tick)
    }

    this.rafId = requestAnimationFrame(tick)
  }

  /** Stop playback. */
  stopPlayback() {
    this._playing = false
    cancelAnimationFrame(this.rafId)
    this.playStateChangeCb?.(false)

    // Pause all decoders
    for (const decoder of this.decoders.values()) {
      decoder.pause()
    }
  }

  /** Get current timeline time. */
  getCurrentTime(): number {
    return this.timelineTime
  }

  /** Whether the engine is currently playing. */
  get playing(): boolean {
    return this._playing
  }

  /** Register callback for timeline time updates during playback. */
  onTimeUpdate(callback: (time: number) => void) {
    this.timeUpdateCb = callback
  }

  /** Register callback for play state changes. */
  onPlayStateChange(callback: (playing: boolean) => void) {
    this.playStateChangeCb = callback
  }

  /** Cleanup all resources. */
  destroy() {
    this.stopPlayback()
    for (const decoder of this.decoders.values()) {
      decoder.destroy()
    }
    this.decoders.clear()
    this.audioContext?.close()
    this.audioContext = null
  }
}
