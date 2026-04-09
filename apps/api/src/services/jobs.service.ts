import { randomUUID } from 'node:crypto';

import type {
  CreateJobRequest,
  JobStatus,
} from '@text2audio-ai/shared-types';

import {
  summarizationService,
  type SummarizationService,
} from './summarization.service.js';

type TimerLike = ReturnType<typeof setTimeout>;
type ScheduleTimeout = (
  callback: () => void,
  delay: number,
) => TimerLike;

export interface JobRecord {
  id: string;
  request: CreateJobRequest;
  status: JobStatus;
  originalText: string;
  finalText: string;
  summaryProvider?: string;
  summaryModel?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

function normalizeText(text: string): string {
  return text.replace(/\r\n/g, '\n').trim();
}

function formatProcessingError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unexpected summarization error.';
}

export class JobsService {
  private readonly jobs = new Map<string, JobRecord>();

  constructor(
    private readonly summaryService: Pick<SummarizationService, 'summarize'> = summarizationService,
    private readonly scheduleTimeout: ScheduleTimeout = setTimeout,
  ) {}

  createJob(input: CreateJobRequest): JobRecord {
    const normalizedText = normalizeText(input.text);
    const timestamp = new Date().toISOString();
    const jobId = `job_${randomUUID()}`;
    const job: JobRecord = {
      id: jobId,
      request: {
        ...input,
        text: normalizedText,
      },
      status: 'queued',
      originalText: normalizedText,
      finalText: input.mode === 'summary' ? '' : normalizedText,
      summaryProvider: input.mode === 'summary' ? undefined : 'passthrough',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.jobs.set(job.id, job);
    this.scheduleProgression(job.id);

    return job;
  }

  getJob(jobId: string): JobRecord | undefined {
    return this.jobs.get(jobId);
  }

  private scheduleProgression(jobId: string): void {
    this.scheduleTimeout(() => {
      void this.processJob(jobId);
    }, 250);
  }

  private updateStatus(jobId: string, status: JobStatus): void {
    const job = this.jobs.get(jobId);

    if (!job) {
      return;
    }

    job.status = status;
    job.updatedAt = new Date().toISOString();
  }

  private async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);

    if (!job) {
      return;
    }

    this.updateStatus(jobId, 'processing');

    try {
      if (job.request.mode === 'summary') {
        const result = await this.summaryService.summarize({
          text: job.originalText,
          language: job.request.language,
          summaryLength: job.request.summaryLength,
        });

        job.finalText = result.summary;
        job.summaryProvider = result.provider;
        job.summaryModel = result.model;
      } else {
        job.finalText = job.originalText;
        job.summaryProvider = 'passthrough';
        job.summaryModel = undefined;
      }

      job.errorMessage = undefined;
      this.updateStatus(jobId, 'completed');
    } catch (error) {
      job.errorMessage = formatProcessingError(error);
      this.updateStatus(jobId, 'failed');
    }
  }
}

export const jobsService = new JobsService();
