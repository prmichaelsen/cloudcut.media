# Task 16: WebSocket Server

**Milestone**: [M6 - Backend Rendering & WebSocket Connection](../../milestones/milestone-6-backend-rendering.md)
**Dependencies**: Task 3 (GCP project setup)
**Status**: Not Started

## Objective

Build a Cloud Run WebSocket server with connection management, JWT authentication, heartbeat/keepalive, and client-side auto-reconnect logic.

## Context

The export pipeline (Task 18) needs a persistent bidirectional channel between the browser and the server to stream render progress in real-time. Cloud Run supports WebSocket connections (with a configurable timeout up to 3600s). This server also establishes the infrastructure for future real-time features like collaborative editing. The server runs as a Node.js service on Cloud Run, and the client uses the native WebSocket API with a reconnection wrapper.

## Steps

### 1. Set up the server project

- Create a Node.js service (TypeScript) in the project's `server/` directory
- Use `ws` library for WebSocket handling on top of an HTTP server
- Configure the Dockerfile and Cloud Run deployment settings (request timeout, min/max instances, concurrency)

### 2. Implement JWT authentication

- On connection, require a JWT token as a query parameter or in the first message
- Validate the token against the project's auth provider (Firebase Auth or similar)
- Reject connections with invalid/expired tokens with a close code and reason
- Attach the authenticated user ID to the connection context

### 3. Add connection management

- Track active connections in a Map keyed by connection ID
- Associate each connection with a user ID and session metadata
- Clean up on disconnect (remove from map, cancel any in-progress renders)
- Log connection lifecycle events for observability

### 4. Implement heartbeat/keepalive

- Server sends a ping frame every 30 seconds
- If no pong is received within 10 seconds, terminate the connection
- This prevents Cloud Run from closing idle connections and detects zombie clients

### 5. Build client-side WebSocket wrapper

- Create a `WebSocketClient` class/hook that wraps the native WebSocket API
- Auto-reconnect with exponential backoff (1s, 2s, 4s, ... up to 30s)
- Queue outgoing messages while disconnected; flush on reconnect
- Expose connection state (connecting, connected, disconnected) as reactive state
- Re-authenticate on reconnect

### 6. Define the message protocol

- Use JSON messages with a `type` field for routing: `render:start`, `render:progress`, `render:complete`, `render:error`, `ping`, `pong`
- Define TypeScript types for each message shape, shared between client and server
- Add a message ID for request-response correlation

## Verification

- [ ] Client connects and authenticates successfully with a valid JWT
- [ ] Connection is rejected with an appropriate error for invalid/expired tokens
- [ ] Heartbeat keeps the connection alive across idle periods (test with 5-minute idle)
- [ ] Client auto-reconnects after a network interruption (test by toggling network)
- [ ] Messages queued during disconnection are delivered after reconnect
- [ ] Server cleans up connection state on client disconnect
- [ ] Service deploys to Cloud Run and accepts WebSocket upgrades
