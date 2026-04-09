import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { JobsService } from './jobs.service.js';

describe('JobsService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('creates a summary job and completes it through the summarization service', async () => {
    const summarize = vi.fn().mockResolvedValue({
      summary: 'Resumen final.',
      provider: 'google-gemini',
      model: 'gemini-2.5-flash-lite',
    });
    const service = new JobsService({ summarize });

    const job = service.createJob({
      text: '  Primera linea.\r\nSegunda linea.  ',
      mode: 'summary',
      summaryLength: 'short',
      language: 'es',
      voice: 'es-US-Neural2-A',
      outputFormat: 'mp3',
    });

    expect(job.status).toBe('queued');
    expect(job.finalText).toBe('');

    await vi.advanceTimersByTimeAsync(250);

    const storedJob = service.getJob(job.id);

    expect(summarize).toHaveBeenCalledWith({
      text: 'Primera linea.\nSegunda linea.',
      language: 'es',
      summaryLength: 'short',
    });
    expect(storedJob).toMatchObject({
      status: 'completed',
      finalText: 'Resumen final.',
      summaryProvider: 'google-gemini',
      summaryModel: 'gemini-2.5-flash-lite',
    });
  });

  it('passes full-mode jobs through without calling the summarizer', async () => {
    const summarize = vi.fn();
    const service = new JobsService({ summarize });

    const job = service.createJob({
      text: '  Texto completo listo para narracion.  ',
      mode: 'full',
      language: 'es',
      voice: 'es-US-Neural2-A',
      outputFormat: 'wav',
    });

    expect(job.finalText).toBe('Texto completo listo para narracion.');
    expect(job.summaryProvider).toBe('passthrough');

    await vi.advanceTimersByTimeAsync(250);

    const storedJob = service.getJob(job.id);

    expect(summarize).not.toHaveBeenCalled();
    expect(storedJob).toMatchObject({
      status: 'completed',
      finalText: 'Texto completo listo para narracion.',
      summaryProvider: 'passthrough',
      summaryModel: undefined,
    });
  });

  it('marks the job as failed when summarization throws', async () => {
    const service = new JobsService({
      summarize: vi.fn().mockRejectedValue(new Error('Gemini unavailable.')),
    });

    const job = service.createJob({
      text: 'Texto listo para fallar.',
      mode: 'summary',
      summaryLength: 'medium',
      language: 'es',
      voice: 'es-US-Neural2-A',
      outputFormat: 'mp3',
    });

    await vi.advanceTimersByTimeAsync(250);

    const storedJob = service.getJob(job.id);

    expect(storedJob).toMatchObject({
      status: 'failed',
      errorMessage: 'Gemini unavailable.',
    });
  });

  it('returns undefined when a job id is unknown', () => {
    const service = new JobsService({
      summarize: vi.fn(),
    });

    expect(service.getJob('job_missing')).toBeUndefined();
  });
});
