import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as createJobValidatorModule from '../validators/create-job.js';
import { jobsService } from '../services/jobs.service.js';
import { createMockRequest, createMockResponse } from '../test/http-test-helpers.js';
import { createJob, getJobResult, getJobStatus } from './jobs.controller.js';

describe('jobs.controller', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 400 when the job payload is invalid', () => {
    const request = createMockRequest({
      body: { mode: 'summary' },
    });
    const response = createMockResponse();

    vi.spyOn(createJobValidatorModule, 'validateCreateJobRequest').mockReturnValue({
      success: false,
      issues: ['text is required.'],
    });

    createJob(request as never, response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Invalid job payload.',
      issues: ['text is required.'],
    });
  });

  it('creates a job and returns the initial status', () => {
    const request = createMockRequest({
      body: {
        text: 'Texto listo para resumir.',
        mode: 'summary',
        summaryLength: 'short',
        language: 'es',
        voice: 'es-US-Neural2-A',
        outputFormat: 'mp3',
      },
    });
    const response = createMockResponse();

    vi.spyOn(createJobValidatorModule, 'validateCreateJobRequest').mockReturnValue({
      success: true,
      data: {
        text: 'Texto listo para resumir.',
        mode: 'summary',
        summaryLength: 'short',
        language: 'es',
        voice: 'es-US-Neural2-A',
        outputFormat: 'mp3',
      },
    });
    vi.spyOn(jobsService, 'createJob').mockReturnValue({
      id: 'job_1',
      request: request.body,
      status: 'queued',
      originalText: 'Texto listo para resumir.',
      finalText: '',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    });

    createJob(request as never, response);

    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({
      id: 'job_1',
      status: 'queued',
    });
  });

  it('returns 404 when the requested job does not exist', () => {
    const request = createMockRequest({
      params: { id: 'job_missing' },
    });
    const response = createMockResponse();

    vi.spyOn(jobsService, 'getJob').mockReturnValue(undefined);

    getJobStatus(request as never, response);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Job "job_missing" was not found.',
    });
  });

  it('returns the current status when the job exists', () => {
    const request = createMockRequest({
      params: { id: 'job_7' },
    });
    const response = createMockResponse();

    vi.spyOn(jobsService, 'getJob').mockReturnValue({
      id: 'job_7',
      request: {
        text: 'Texto.',
        mode: 'full',
        language: 'es',
        voice: 'es-US-Neural2-A',
        outputFormat: 'mp3',
      },
      status: 'processing',
      originalText: 'Texto.',
      finalText: 'Texto.',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:01.000Z',
    });

    getJobStatus(request as never, response);

    expect(response.json).toHaveBeenCalledWith({
      id: 'job_7',
      status: 'processing',
    });
  });

  it('returns 409 when the job result is requested before completion', () => {
    const request = createMockRequest({
      params: { id: 'job_11' },
    });
    const response = createMockResponse();

    vi.spyOn(jobsService, 'getJob').mockReturnValue({
      id: 'job_11',
      request: {
        text: 'Texto.',
        mode: 'summary',
        summaryLength: 'short',
        language: 'es',
        voice: 'es-US-Neural2-A',
        outputFormat: 'mp3',
      },
      status: 'processing',
      originalText: 'Texto.',
      finalText: '',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:01.000Z',
    });

    getJobResult(request as never, response);

    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith({
      id: 'job_11',
      status: 'processing',
      message: 'Job "job_11" is not completed yet.',
    });
  });

  it('returns the completed text result when the job is ready', () => {
    const request = createMockRequest({
      params: { id: 'job_13' },
    });
    const response = createMockResponse();

    vi.spyOn(jobsService, 'getJob').mockReturnValue({
      id: 'job_13',
      request: {
        text: 'Texto original.',
        mode: 'summary',
        summaryLength: 'short',
        language: 'es',
        voice: 'es-US-Neural2-A',
        outputFormat: 'mp3',
      },
      status: 'completed',
      originalText: 'Texto original.',
      finalText: 'Resumen final.',
      summaryProvider: 'google-gemini',
      summaryModel: 'gemini-2.5-flash-lite',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:01.000Z',
    });

    getJobResult(request as never, response);

    expect(response.json).toHaveBeenCalledWith({
      id: 'job_13',
      status: 'completed',
      mode: 'summary',
      originalText: 'Texto original.',
      finalText: 'Resumen final.',
      provider: {
        summary: 'google-gemini',
      },
      model: {
        summary: 'gemini-2.5-flash-lite',
      },
    });
  });
});
