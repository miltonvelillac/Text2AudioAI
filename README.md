# Text2Audio AI

<p align="center">
  <strong>An AI-powered monorepo application that turns text into audio, either as full narration or as a summarized spoken version.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-Frontend-dd0031?logo=angular&logoColor=white" alt="Angular">
  <img src="https://img.shields.io/badge/Express-Backend-000000?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/TypeScript-Language-3178c6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Nx-Monorepo-143055?logo=nx&logoColor=white" alt="Nx">
  <img src="https://img.shields.io/badge/pnpm-Workspace-f69220?logo=pnpm&logoColor=white" alt="pnpm">
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169e1?logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Redis-Queue%20Backend-dc382d?logo=redis&logoColor=white" alt="Redis">
  <img src="https://img.shields.io/badge/BullMQ-Jobs-eab308" alt="BullMQ">
  <img src="https://img.shields.io/badge/Google%20Gemini-Summarization-4285f4?logo=google&logoColor=white" alt="Gemini">
  <img src="https://img.shields.io/badge/Google%20Cloud-TTS-34a853?logo=googlecloud&logoColor=white" alt="Google Cloud TTS">
</p>

---

## Table of Contents

- [Overview](#overview)
- [Demo Idea](#demo-idea)
- [Features](#features)
- [Why This Project Is Strong for a Portfolio](#why-this-project-is-strong-for-a-portfolio)
- [Monorepo Strategy](#monorepo-strategy)
- [Architecture](#architecture)
- [System Flow](#system-flow)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Design](#api-design)
- [Database Design](#database-design)
- [Queue Design](#queue-design)
- [AI Pipeline](#ai-pipeline)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Roadmap](#roadmap)
- [Future Enhancements](#future-enhancements)
- [Final Recommendation](#final-recommendation)

---

## Overview

**Text2Audio AI** is a portfolio-ready AI application where a user pastes text into a web interface and chooses one of two output modes:

- **Full Text to Audio** — convert the full text into spoken audio
- **Summary to Audio** — generate a summary first, then narrate it

The goal is to showcase a realistic AI product architecture using:

- a modern frontend
- a modular Node.js backend
- an LLM for summarization
- a TTS engine for speech generation
- asynchronous job processing
- persistent storage for metadata and audio assets

---

## Demo Idea

A user can:

1. paste a long article, note, transcript, or lesson into the interface
2. choose whether they want:
   - the full text narrated, or
   - a short, medium, or long summary narrated
3. select a language and voice
4. generate audio
5. play or download the resulting file
6. review previous generations in a history page

This makes the project useful, easy to explain in interviews, and visually attractive for a portfolio.

---

## Features

### Core Features
- paste text manually into the app
- choose between **full** or **summary** mode
- choose summary length
- choose language and voice
- generate audio asynchronously
- preview and play generated audio
- store generation history
- track job status (`queued`, `processing`, `completed`, `failed`)

### Technical Features
- monorepo architecture
- shared TypeScript packages between frontend and backend
- queue-based background processing with BullMQ
- long-text chunking strategy
- storage for generated audio files
- cost and duration estimation per job
- scalable service boundaries for summarization and TTS

---

## Why This Project Is Strong for a Portfolio

This project demonstrates more than “just calling an API.” It shows that you can design and implement:

- a complete frontend + backend architecture
- AI orchestration using multiple providers/services
- asynchronous job processing
- cloud-friendly file storage
- shared contracts across applications in a monorepo
- realistic engineering tradeoffs around cost, performance, and scalability

You can position it as a product-oriented AI project, not just a demo.

---

## Monorepo Strategy

This project should be built as a **monorepo**.

### Recommended Monorepo Tooling
- **Nx** for workspace orchestration, task running, dependency graph, code generation, and build optimization
- **pnpm workspaces** for package management and local package linking

### Why a Monorepo Fits This Project
A monorepo is a strong fit because this application has:

- a frontend app
- a backend app
- shared DTOs and API contracts
- shared utility functions
- potential shared UI libraries and tooling

### Benefits
- shared TypeScript types between frontend and backend
- one place for linting, formatting, and testing rules
- simpler local development
- clearer dependency management
- better CI performance as the project grows

---

## Architecture

```text
[ Angular Frontend ]
        |
        v
[ Express API ]
        |
        +--> [ Summarization Service ] ---> Gemini 2.5 Flash-Lite
        |
        +--> [ TTS Service ] ------------> Google Cloud Text-to-Speech
        |
        +--> [ Job Queue ] --------------> BullMQ + Redis
        |
        +--> [ Persistence ] ------------> PostgreSQL
        |
        +--> [ File Storage ] -----------> S3 / Cloudflare R2
```

---

## System Flow

### Full Text to Audio
1. The user pastes text into the UI.
2. The frontend sends a job request to the backend.
3. The backend stores job metadata and queues the request.
4. A worker splits the text into chunks if necessary.
5. Each chunk is sent to the TTS provider.
6. Audio segments are merged.
7. The final file is uploaded to storage.
8. The frontend fetches the completed result.

### Summary to Audio
1. The user submits text in `summary` mode.
2. The backend stores the job and queues it.
3. A worker sends the text to the summarization model.
4. The summary is optionally rewritten for better narration.
5. The final text is sent to the TTS service.
6. The generated audio is uploaded to storage.
7. The frontend displays the summary and audio result.

---

## Tech Stack

### Monorepo
- **Nx**
- **pnpm workspaces**

### Frontend
- **Angular**
- **TypeScript**
- **Reactive Forms**
- audio player UI
- polling or WebSockets for job status updates

### Backend
- **Node.js**
- **Express**
- **TypeScript**
- **Zod** or **Joi** for validation

### Jobs and Infrastructure
- **BullMQ**
- **Redis**
- **PostgreSQL**
- **S3** or **Cloudflare R2**

### AI Services
- **Gemini 2.5 Flash-Lite** for summarization
- **Google Cloud Text-to-Speech** for voice generation

---

## Project Structure

```text
apps/
  web/                     # Angular frontend
  api/                     # Express backend

packages/
  shared-types/            # DTOs, interfaces, API contracts
  shared-utils/            # Helpers, text processing, estimators
  eslint-config/           # Shared lint config (optional)
  tsconfig/                # Shared TS config (optional)
  ui/                      # Shared UI library (optional, future)

tools/
  scripts/                 # Local scripts, generators, setup helpers

infra/
  docker/                  # Docker-related files (optional)
  terraform/               # IaC (future)
```

### Express App Structure

```text
apps/api/src/
  app.ts
  server.ts

  config/
    env.ts
    db.ts
    redis.ts

  routes/
    jobs.routes.ts
    voices.routes.ts
    history.routes.ts
    health.routes.ts

  controllers/
    jobs.controller.ts
    voices.controller.ts
    history.controller.ts
    health.controller.ts

  services/
    jobs.service.ts
    summarization.service.ts
    tts.service.ts
    audio.service.ts
    storage.service.ts
    history.service.ts

  workers/
    summary.worker.ts
    tts.worker.ts
    merge.worker.ts

  queues/
    index.ts
    job.queue.ts

  middleware/
    error-handler.ts
    validate-request.ts

  validators/
    create-job.schema.ts

  utils/
    chunk-text.ts
    estimate-duration.ts
    estimate-cost.ts
    logger.ts
```

---

## API Design

### `POST /api/jobs`
Creates a new generation job.

**Request**

```json
{
  "text": "Your text goes here...",
  "mode": "summary",
  "summaryLength": "medium",
  "language": "es",
  "voice": "es-US-Neural2-A",
  "outputFormat": "mp3"
}
```

**Response**

```json
{
  "id": "job_123",
  "status": "queued"
}
```

### `GET /api/jobs/:id`
Returns the current job status.

```json
{
  "id": "job_123",
  "status": "processing"
}
```

### `GET /api/jobs/:id/result`
Returns the completed result.

```json
{
  "id": "job_123",
  "status": "completed",
  "mode": "summary",
  "originalText": "...",
  "finalText": "...",
  "audioUrl": "https://storage.example.com/audio/job_123.mp3",
  "durationSeconds": 92,
  "provider": {
    "summary": "gemini-2.5-flash-lite",
    "tts": "google-cloud-tts"
  }
}
```

### `GET /api/voices?language=es`
Returns a list of available voices.

### `GET /api/history`
Returns previous generations.

---

## Database Design

### `jobs`
Tracks job lifecycle and request settings.

**Fields**
- `id`
- `status`
- `mode`
- `language`
- `voice`
- `output_format`
- `error_message`
- `created_at`
- `updated_at`

### `job_texts`
Stores input and processed text.

**Fields**
- `id`
- `job_id`
- `original_text`
- `processed_text`
- `summary_text`

### `job_assets`
Stores generated file references.

**Fields**
- `id`
- `job_id`
- `audio_url`
- `audio_duration_seconds`
- `storage_key`

### `job_metrics`
Stores performance and cost metadata.

**Fields**
- `id`
- `job_id`
- `llm_provider`
- `llm_model`
- `tts_provider`
- `input_tokens`
- `output_tokens`
- `estimated_cost_usd`
- `processing_ms`

---

## Queue Design

Use **BullMQ** to process jobs asynchronously.

### Queues
- `summary-jobs`
- `tts-jobs`
- `merge-audio-jobs`

### Job States
- `queued`
- `processing`
- `completed`
- `failed`

### Why Queues Matter
- avoid blocking API requests
- handle long-running jobs cleanly
- retry failed work
- scale workers independently
- process long inputs chunk by chunk

---

## AI Pipeline

### Summarization Strategy
For short text:
- summarize directly

For long text:
- split into chunks
- summarize each chunk
- combine into a final summary

### Narration Rewrite Strategy
Before sending text to TTS, optionally rewrite it so it sounds better when read aloud.

### TTS Strategy
For short text:
- send text directly to TTS

For long text:
- split text into semantic chunks
- generate audio for each chunk
- merge the final output

### Example Summarization Prompt
```text
Summarize the following text in clear, natural English or Spanish.
Keep the main ideas, remove redundancy, and make it easy to listen to.
Generate a {{short|medium|long}} summary.
Text:
{{TEXT}}
```

### Example Narration Prompt
```text
Rewrite the following text so it sounds natural when read aloud.
Keep the meaning unchanged, but improve clarity, rhythm, and flow.
Avoid overly long sentences.
Text:
{{TEXT}}
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+
- Redis
- PostgreSQL
- a Google AI Studio or Gemini API key
- a Google Cloud project with Text-to-Speech enabled
- S3 or Cloudflare R2 bucket for audio storage

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/text2audio-ai.git
cd text2audio-ai
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Create Environment Files
Create your environment files based on `.env.example`.

Example:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### 4. Start Local Services
Make sure PostgreSQL and Redis are running.

### 5. Run the Applications
```bash
pnpm nx serve api
pnpm nx serve web
```

Or run both with a convenience script if you add one:

```bash
pnpm dev
```

---

## Environment Variables

Example backend variables:

```env
PORT=3000
NODE_ENV=development

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/text2audio
REDIS_URL=redis://localhost:6379

GEMINI_API_KEY=your_gemini_api_key
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
GOOGLE_CLOUD_PROJECT=your_project_id

AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=text2audio-audio
S3_PUBLIC_BASE_URL=https://your-bucket-url
```

Example frontend variables if needed:

```env
API_BASE_URL=http://localhost:3000/api
```

---

## Available Scripts

These are examples you can define in the root `package.json`.

```json
{
  "scripts": {
    "dev": "nx run-many --target=serve --projects=api,web --parallel",
    "build": "nx run-many --target=build --all",
    "test": "nx run-many --target=test --all",
    "lint": "nx run-many --target=lint --all",
    "format": "prettier --write .",
    "api:serve": "nx serve api",
    "web:serve": "nx serve web"
  }
}
```

---

## Roadmap

### MVP
- [x] project architecture defined
- [ ] Angular text input screen
- [ ] Express job creation endpoint
- [ ] BullMQ + Redis integration
- [ ] Gemini summarization integration
- [ ] Google Cloud TTS integration
- [ ] audio storage integration
- [ ] job history screen

### V2
- [ ] short / medium / long summaries
- [ ] progress tracking in real time
- [ ] downloadable audio
- [ ] cost estimation per job
- [ ] voice preview selector

### V3
- [ ] SSML support
- [ ] text highlighting during playback
- [ ] PDF / DOCX / TXT upload
- [ ] authentication and user-specific history
- [ ] analytics dashboard

---

## Future Enhancements

- WebSocket-based live job updates
- webhook notifications for completed jobs
- multiple TTS provider support
- multilingual optimization prompts
- speaker style presets
- admin dashboard for usage analytics
- rate limiting and quotas
- user accounts and billing logic

---

## Final Recommendation

For this project, the most practical stack is:

- **Monorepo:** Nx + pnpm workspaces
- **Frontend:** Angular
- **Backend:** Node.js + Express + TypeScript
- **Summarization:** Gemini 2.5 Flash-Lite
- **Text-to-Speech:** Google Cloud Text-to-Speech
- **Queue:** BullMQ + Redis
- **Database:** PostgreSQL
- **Storage:** S3 or Cloudflare R2

This stack is affordable, scalable, and strong enough to stand out in a portfolio.

---

## Portfolio Description

You can describe the project like this:

> Text2Audio AI is a monorepo-based web application that transforms user-provided text into audio, either by reading the full text or by generating and narrating a summary. The project uses Angular on the frontend and Node.js with Express on the backend, integrating an LLM for summarization and a TTS engine for speech synthesis. It includes asynchronous job processing, cloud storage for generated audio, shared contracts across apps, and a scalable architecture designed for real-world growth.

---

## Notes

- Replace repository URLs, cloud credentials paths, and storage values with your real project values.
- If you want, you can later split this README into:
  - a root monorepo README
  - a frontend README
  - a backend README
- You can also add screenshots, architecture diagrams, and a demo GIF once the UI is ready.
