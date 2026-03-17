# Task 5: GCS Upload Pipeline

## Objective

Build a server-side upload endpoint that streams file data to Google Cloud Storage and returns signed URLs for retrieval.

## Context

Files uploaded from the browser need to land in GCS without buffering the entire file in server memory. Using streaming upload keeps memory usage constant regardless of file size. Signed URLs let the client fetch files directly from GCS without proxying through the server.

## Steps

1. Create a server function or API route (`/api/upload`) that:
   - Accepts `multipart/form-data` POST requests
   - Validates the incoming file type and size server-side (defense in depth)
   - Streams the file body directly to GCS using `@google-cloud/storage` resumable uploads
2. Organize uploads in GCS under a path structure: `projects/{projectId}/originals/{filename}`.
3. On successful upload, generate a signed URL (read-only, 1-hour expiry) for the uploaded object and return it in the response along with the GCS object path.
4. Handle errors: return appropriate HTTP status codes for validation failures (400), auth issues (401), and storage errors (500).
5. Add a simple in-memory or database record of uploaded assets (asset ID, original filename, GCS path, MIME type, size, upload timestamp). For now, an in-memory map is fine.
6. Test with `curl` or the upload UI from Task 4 to confirm end-to-end flow.

## Verification

- [ ] `POST /api/upload` with a valid video file returns 200 with a signed URL and GCS path
- [ ] The file appears in the GCS bucket at the expected path
- [ ] The signed URL is accessible and serves the file correctly
- [ ] Uploading an invalid file type returns 400
- [ ] Large files (100+ MB) upload without server OOM (streaming works)
- [ ] The asset record contains correct metadata
