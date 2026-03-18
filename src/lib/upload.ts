// Upload utilities for cloudcut.media
import { getIdToken } from './auth/firebase-client'

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export async function uploadVideo(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  const token = await getIdToken()
  if (!token) {
    throw new Error('Not authenticated. Please sign in first.')
  }

  // Step 1: Get upload URL (authenticated)
  const urlResponse = await fetch('/api/upload-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type
    })
  });

  if (urlResponse.status === 401) {
    throw new Error('Session expired. Please sign in again.')
  }

  if (!urlResponse.ok) {
    throw new Error('Failed to get upload URL');
  }

  const { uploadUrl, key } = await urlResponse.json() as { uploadUrl: string; key: string };

  // Step 2: Upload file with progress tracking (authenticated)
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress({
          loaded: e.loaded,
          total: e.total,
          percentage: Math.round((e.loaded / e.total) * 100)
        });
      }
    });

    xhr.addEventListener('load', async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const result = JSON.parse(xhr.responseText);
        resolve(result.key);
      } else if (xhr.status === 401) {
        reject(new Error('Session expired. Please sign in again.'));
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(file);
  });
}
