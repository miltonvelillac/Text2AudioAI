import { randomUUID } from 'node:crypto';

import type {
  CreateJobRequest,
  JobStatus,
  SummaryLength,
} from '@text2audio-ai/shared-types';

interface JobRecord {
  id: string;
  request: CreateJobRequest;
  status: JobStatus;
  originalText: string;
  finalText: string;
  createdAt: string;
  updatedAt: string;
}

function normalizeText(text: string): string {
  return text.replace(/\r\n/g, '\n').trim();
}

function selectSummaryWordLimit(length: SummaryLength): number {
  switch (length) {
    case 'short':
      return 30;
    case 'medium':
      return 60;
    case 'long':
      return 120;
  }
}

function createFallbackSummary(
  text: string,
  length: SummaryLength = 'medium',
): string {
  const words = normalizeText(text).split(/\s+/).filter(Boolean);
  const maxWords = selectSummaryWordLimit(length);

  return words.slice(0, maxWords).join(' ');
}

class JobsService {
  private readonly jobs = new Map<string, JobRecord>();

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
      finalText:
        input.mode === 'summary'
          ? createFallbackSummary(normalizedText, input.summaryLength)
          : normalizedText,
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
    setTimeout(() => {
      this.updateStatus(jobId, 'processing');
    }, 250);

    setTimeout(() => {
      this.updateStatus(jobId, 'completed');
    }, 900);
  }

  private updateStatus(jobId: string, status: JobStatus): void {
    const job = this.jobs.get(jobId);

    if (!job) {
      return;
    }

    job.status = status;
    job.updatedAt = new Date().toISOString();
  }
}

export const jobsService = new JobsService();

