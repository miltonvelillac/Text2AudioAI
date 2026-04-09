import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { jobsService, type JobRecord } from './services/jobs.service.js';
import { app } from './app.js';

function createJobRecord(overrides: Partial<JobRecord> = {}): JobRecord {
  return {
    id: 'job_1',
    request: {
      text: 'Texto listo para resumir.',
      mode: 'summary',
      summaryLength: 'short',
      language: 'es',
      voice: 'es-US-Neural2-A',
      outputFormat: 'mp3',
    },
    status: 'queued',
    originalText: 'Texto listo para resumir.',
    finalText: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('app', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('serves GET /api/health', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'api',
    });
    expect(new Date(response.body.timestamp).toISOString()).toBe(response.body.timestamp);
  });

  it('creates a job through POST /api/jobs', async () => {
    vi.spyOn(jobsService, 'createJob').mockReturnValue(createJobRecord());

    const response = await request(app).post('/api/jobs').send({
      text: 'Texto listo para resumir.',
      mode: 'summary',
      summaryLength: 'short',
      language: 'es',
      voice: 'es-US-Neural2-A',
      outputFormat: 'mp3',
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: 'job_1',
      status: 'queued',
    });
  });

  it('returns 400 for invalid job payloads', async () => {
    const response = await request(app).post('/api/jobs').send({
      mode: 'summary',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Invalid job payload.',
      issues: [
        'text is required.',
        'language is required.',
        'voice is required.',
        'outputFormat must be either "mp3" or "wav".',
        'summaryLength is required when mode is "summary".',
      ],
    });
  });

  it('returns the current job status through GET /api/jobs/:id', async () => {
    vi.spyOn(jobsService, 'getJob').mockReturnValue(
      createJobRecord({
        id: 'job_9',
        status: 'processing',
      }),
    );

    const response = await request(app).get('/api/jobs/job_9');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 'job_9',
      status: 'processing',
    });
  });

  it('returns 404 when a route is unknown', async () => {
    const response = await request(app).get('/api/unknown');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: 'Route not found.',
    });
  });

  it('uses the error handler when a route throws unexpectedly', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(jobsService, 'createJob').mockImplementation(() => {
      throw new Error('Unexpected create failure.');
    });

    const response = await request(app).post('/api/jobs').send({
      text: 'Texto listo para resumir.',
      mode: 'summary',
      summaryLength: 'short',
      language: 'es',
      voice: 'es-US-Neural2-A',
      outputFormat: 'mp3',
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: 'Unexpected server error.',
    });
  });
});
