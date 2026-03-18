// FFmpeg.wasm utilities for client-side video processing
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

let ffmpeg: FFmpeg | null = null

export async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg) return ffmpeg

  ffmpeg = new FFmpeg()

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  })

  return ffmpeg
}

export interface TrimOptions {
  startTime: number  // seconds
  endTime: number    // seconds
  onProgress?: (progress: number) => void
}

export async function trimVideo(
  videoFile: File,
  options: TrimOptions
): Promise<Blob> {
  const ffmpeg = await loadFFmpeg()

  // Convert File to Uint8Array
  const data = new Uint8Array(await videoFile.arrayBuffer())

  // Write input file
  await ffmpeg.writeFile('input.mp4', data)

  // Set up progress callback
  if (options.onProgress) {
    ffmpeg.on('progress', ({ progress }) => {
      options.onProgress?.(Math.round(progress * 100))
    })
  }

  // Trim video (fast copy, no re-encode)
  const duration = options.endTime - options.startTime
  await ffmpeg.exec([
    '-i', 'input.mp4',
    '-ss', options.startTime.toString(),
    '-t', duration.toString(),
    '-c', 'copy',  // Copy codec (fast, no quality loss)
    'output.mp4'
  ])

  // Read output file
  const outputData = await ffmpeg.readFile('output.mp4')

  // Clean up
  await ffmpeg.deleteFile('input.mp4')
  await ffmpeg.deleteFile('output.mp4')

  // @ts-ignore - FFmpeg returns compatible buffer format
  return new Blob([outputData], { type: 'video/mp4' })
}

export async function getVideoDuration(videoFile: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.preload = 'metadata'

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src)
      resolve(video.duration)
    }

    video.onerror = () => {
      reject(new Error('Failed to load video metadata'))
    }

    video.src = URL.createObjectURL(videoFile)
  })
}
