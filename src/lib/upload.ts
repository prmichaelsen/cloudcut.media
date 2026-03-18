// Upload utilities for cloudcut.media

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export async function uploadVideo(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  // Step 1: Get upload URL
  const urlResponse = await fetch('/api/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type
    })
  });

  if (!urlResponse.ok) {
    throw new Error('Failed to get upload URL');
  }

  const { uploadUrl, key } = await urlResponse.json();

  // Step 2: Upload file with progress tracking
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
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
}
