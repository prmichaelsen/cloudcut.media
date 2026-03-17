# Task 3: GCP Project Setup

## Objective

Set up the GCP project with a Cloud Storage bucket, a Cloud Run service stub, and service account credentials for local development and CI.

## Context

The server-side stack runs on GCP. Cloud Storage holds uploaded media and generated proxies. Cloud Run hosts the API/server. This task gets the infrastructure skeleton in place so subsequent milestones can deploy real workloads.

## Steps

1. Create (or select) a GCP project for cloudcut.media. Enable the following APIs: Cloud Run, Cloud Storage, Artifact Registry, IAM.
2. Create a GCS bucket for media storage (e.g., `cloudcut-media-{env}`). Set lifecycle rules to auto-delete objects older than 90 days in the dev bucket.
3. Create a service account (`cloudcut-server@{project}.iam.gserviceaccount.com`) with roles:
   - `roles/storage.objectAdmin` on the media bucket
   - `roles/run.invoker` (for service-to-service calls later)
4. Generate a JSON key for the service account and store it securely (do not commit it). Add the key path to `.env.local` as `GOOGLE_APPLICATION_CREDENTIALS`.
5. Create a minimal Cloud Run service stub:
   - A simple HTTP handler that responds with `{ "status": "ok" }` on `GET /health`
   - A `Dockerfile` (or use `gcloud run deploy --source`) to build and deploy
6. Deploy the stub to Cloud Run and confirm it responds on the public URL.
7. Write a smoke test script (`scripts/gcs-smoke-test.ts`) that writes a test object to the bucket and reads it back using the `@google-cloud/storage` SDK.

## Verification

- [ ] `gcloud run services describe cloudcut-server` shows the service as active
- [ ] `curl https://{service-url}/health` returns `{ "status": "ok" }`
- [ ] `npx tsx scripts/gcs-smoke-test.ts` writes and reads an object from GCS without errors
- [ ] Service account key is in `.gitignore` and not committed
- [ ] `.env.local` contains `GOOGLE_APPLICATION_CREDENTIALS` pointing to the key file
