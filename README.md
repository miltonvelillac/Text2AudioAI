# Text2Audio AI

A portfolio-ready AI project that converts user-provided text into audio, either by reading the **full text** or by generating a **summary** and narrating it.

This project is designed to showcase a practical AI architecture using:

- **Angular** for the frontend
- **Node.js + Express + TypeScript** for the backend
- **Gemini 2.5 Flash-Lite** for summarization
- **Google Cloud Text-to-Speech** for audio generation
- **BullMQ + Redis** for background jobs
- **PostgreSQL** for persistence
- **S3 / Cloudflare R2** for audio storage

---

## Overview

The application allows a user to paste text into a web interface and choose one of two modes:

- **Full Text to Audio**: converts the full text into speech
- **Summary to Audio**: generates a summary first, then converts that summary into speech

The system processes the request asynchronously, stores the generated audio, and returns a playable/downloadable result.

---

## Recommended Stack

### Frontend
- Angular
- Reactive Forms
- Audio player UI
- Job status polling or WebSocket updates

### Backend
- Node.js
- Express
- TypeScript
- Zod or Joi for request validation
- BullMQ for job queues
- Redis for queue management
- PostgreSQL for metadata and history

### AI Services
- **Summarization**: Gemini 2.5 Flash-Lite
- **Text-to-Speech**: Google Cloud Text-to-Speech

### Storage
- Amazon S3 or Cloudflare R2 for generated audio files

---

## Why This Architecture

This architecture is a good fit for a portfolio project because it demonstrates:

- clean separation of concerns
- real-world AI orchestration
- asynchronous processing with queues
- persistence and asset storage
- scalability for long-running audio generation jobs

It also keeps costs low while still delivering a professional result.

---

## High-Level Architecture

```text
[ Angular Frontend ]
        |
        v
[ Express API ]
        |
        +--> [ Summarization Service ] ---> Gemini 2.5 Flash-Lite
        |
        +--> [ TTS Service ] ------------> Google Cloud TTS
        |
        +--> [ Job Queue ] --------------> BullMQ + Redis
        |
        +--> [ Persistence ] ------------> PostgreSQL
        |
        +--> [ File Storage ] -----------> S3 / Cloudflare R2
```

---

## Main Use Cases

### 1. Full Text to Audio
1. The user pastes text into the interface.
2. The frontend sends the text and selected options to the backend.
3. The backend creates a job.
4. A worker processes the job.
5. If needed, the text is split into chunks.
6. Each chunk is sent to the TTS provider.
7. Audio segments are merged.
8. The final audio file is stored.
9. The frontend receives the result URL and metadata.

### 2. Summary to Audio
1. The user pastes text into the interface.
2. The frontend sends the text with `summary` mode.
3. The backend creates a job.
4. A worker sends the text to the summarization provider.
5. The summary is optionally rewritten for better narration.
6. The final text is sent to the TTS provider.
7. The audio file is generated and stored.
8. The frontend receives the summary, audio URL, and job metadata.

---

## Backend Architecture with Express

A simple and scalable Express structure could look like this:

```text
src/
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
    summarization.service.ts
    tts.service.ts
    audio.service.ts
    storage.service.ts
    history.service.ts
    jobs.service.ts

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

  db/
    migrations/
    repositories/
```

### Layer Responsibilities

#### Routes
Define API endpoints and connect them to controllers.

#### Controllers
Handle HTTP requests and responses.

#### Services
Contain business logic, including summarization, text-to-speech, audio merging, storage, and persistence.

#### Workers
Process long-running or asynchronous jobs from BullMQ.

#### Validators
Validate incoming request payloads.

#### Utilities
Shared helper functions such as text chunking and duration estimation.

---

## Suggested API Endpoints

### Create a Job
`POST /api/jobs`

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

### Get Job Status
`GET /api/jobs/:id`

```json
{
  "id": "job_123",
  "status": "processing"
}
```

### Get Job Result
`GET /api/jobs/:id/result`

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

### List Available Voices
`GET /api/voices?language=es`

### Get History
`GET /api/history`

---

## Database Design

### `jobs`
Stores the lifecycle of each generation request.

Fields:
- `id`
- `status` (`queued`, `processing`, `completed`, `failed`)
- `mode` (`full`, `summary`)
- `language`
- `voice`
- `output_format`
- `error_message`
- `created_at`
- `updated_at`

### `job_texts`
Stores the original and processed text.

Fields:
- `id`
- `job_id`
- `original_text`
- `processed_text`
- `summary_text`

### `job_assets`
Stores generated file references.

Fields:
- `id`
- `job_id`
- `audio_url`
- `audio_duration_seconds`
- `storage_key`

### `job_metrics`
Stores performance and cost data.

Fields:
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

### Suggested Queues
- `summary-jobs`
- `tts-jobs`
- `merge-audio-jobs`

### Job States
- `queued`
- `processing`
- `completed`
- `failed`

### Why Use Queues
Queues make the system more robust and portfolio-ready:

- avoid blocking HTTP requests
- handle long-running audio generation
- retry failed jobs
- process large texts in chunks
- separate API concerns from heavy background work

---

## Processing Strategy

### Summarization Strategy
For short text:
- summarize directly

For long text:
- split into chunks
- summarize each chunk
- combine the chunk summaries into a final summary

This prevents context window issues and improves consistency.

### TTS Strategy
For short text:
- send the text directly to the TTS provider

For long text:
- split text into semantic chunks
- generate audio per chunk
- merge all audio segments into a single file

---

## Prompt Design

### Summarization Prompt
```text
Summarize the following text in clear, natural English or Spanish.
Keep the main ideas, remove redundancy, and make it easy to listen to.
Generate a {{short|medium|long}} summary.
Text:
{{TEXT}}
```

### Narration-Friendly Rewrite Prompt
```text
Rewrite the following text so it sounds natural when read aloud.
Keep the meaning unchanged, but improve clarity, rhythm, and flow.
Avoid overly long sentences.
Text:
{{TEXT}}
```

This extra narration step can noticeably improve the listening experience.

---

## Recommended AI Providers

### Option A — Best Overall Choice
- **Summarization**: Gemini 2.5 Flash-Lite
- **TTS**: Google Cloud Text-to-Speech

This is the best balance of:
- low cost
- strong Node.js support
- good voice quality
- easy integration

### Option B — Single-Provider Demo
- **Summarization**: Gemini 2.5 Flash-Lite
- **TTS**: Gemini TTS

This is useful if you want to demonstrate an all-in-one Gemini workflow, especially for portfolio purposes.

### Option C — Cheap and Fast Alternative
- **Summarization**: Groq-compatible LLM
- **TTS**: Google Cloud Text-to-Speech

This can be attractive if you want very fast summarization requests at low cost.

---

## MVP Scope

### Version 1
- paste text
- choose full text or summary mode
- choose language and voice
- generate audio
- play audio in the browser
- store generation history

### Version 2
- short / medium / long summary levels
- automatic language detection
- progress updates in real time
- chunk-based processing for long text
- downloadable audio
- cost estimation per job

### Version 3
- SSML support for better pauses and pronunciation
- synchronized text highlighting during playback
- file upload support (`.txt`, `.pdf`, `.docx`)
- analytics dashboard for jobs and usage

---

## Key Design Decisions

### Express Instead of NestJS
Express keeps the backend lighter and easier to explain for a portfolio project, while still allowing clean separation into routes, controllers, services, workers, and validators.

### Store the Final Narrated Text
Do not store only the original text. Also store the final processed text that was actually sent to TTS.

Benefits:
- easier debugging
- easier regeneration without re-summarizing
- better auditability of the pipeline

### Store Audio Externally
Do not store audio binaries inside PostgreSQL.
Store files in S3 or R2, and persist only:
- file URL
- storage key
- duration
- size

---

## Portfolio Value

This project is strong for a portfolio because it shows:

- AI integration with LLM + TTS
- backend architecture with Express
- asynchronous processing with queues
- text chunking strategies
- storage and persistence design
- product thinking and user experience

You can describe it like this:

> Text2Audio AI is a web application that transforms user-provided text into audio, either by reading the full text or by generating and narrating a summary. The project uses Angular on the frontend and Node.js with Express on the backend, integrating an LLM for summarization and a TTS engine for voice synthesis. It includes background job processing, audio storage, generation history, and a scalable modular architecture.

---

## Suggested Next Steps

1. Build the Express API skeleton
2. Create the `POST /jobs` endpoint
3. Add BullMQ and Redis
4. Integrate Gemini summarization
5. Integrate Google Cloud TTS
6. Save job metadata in PostgreSQL
7. Store audio files in cloud storage
8. Connect the Angular frontend
9. Add playback, history, and progress tracking

---

## Future Enhancements

- user authentication
- per-user history
- rate limiting
- webhook completion notifications
- real-time updates via WebSockets
- multiple TTS provider support
- voice previews
- multilingual prompt tuning

---

## Final Recommendation

For this project, the most practical stack is:

- **Frontend**: Angular
- **Backend**: Node.js + Express + TypeScript
- **Summarization**: Gemini 2.5 Flash-Lite
- **Text-to-Speech**: Google Cloud Text-to-Speech
- **Queue**: BullMQ + Redis
- **Database**: PostgreSQL
- **Storage**: S3 or Cloudflare R2

This stack is affordable, realistic, and strong enough to make the project stand out in a portfolio.

