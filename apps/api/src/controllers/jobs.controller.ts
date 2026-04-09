import type { Request, Response } from 'express';
import type { CreateJobRequest } from '@text2audio-ai/shared-types';

import { jobsService } from '../services/jobs.service.js';
import { validateCreateJobRequest } from '../validators/create-job.js';

export function createJob(
  request: Request<unknown, unknown, CreateJobRequest>,
  response: Response,
): void {
  const validation = validateCreateJobRequest(request.body);

  if (!validation.success) {
    response.status(400).json({
      message: 'Invalid job payload.',
      issues: validation.issues,
    });
    return;
  }

  const job = jobsService.createJob(validation.data);

  response.status(201).json({
    id: job.id,
    status: job.status,
  });
}

export function getJobStatus(
  request: Request<{ id: string }>,
  response: Response,
): void {
  const job = jobsService.getJob(request.params.id);

  if (!job) {
    response.status(404).json({
      message: `Job "${request.params.id}" was not found.`,
    });
    return;
  }

  response.json({
    id: job.id,
    status: job.status,
  });
}

