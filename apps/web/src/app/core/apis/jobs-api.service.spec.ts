import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import type { CreateJobRequest } from '@text2audio-ai/shared-types';

import { JobsApiService } from './jobs-api.service';

describe('JobsApiService', () => {
  let service: JobsApiService;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JobsApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(JobsApiService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  });

  it('posts a job creation request', () => {
    const payload: CreateJobRequest = {
      text: 'This is a sufficiently long sample payload for the first request.',
      mode: 'summary',
      summaryLength: 'medium',
      language: 'es',
      voice: 'es-US-Neural2-A',
      outputFormat: 'mp3',
    };

    service.createJob(payload).subscribe((response) => {
      expect(response).toEqual({ id: 'job-1', status: 'queued' });
    });

    const request = httpController.expectOne('/api/jobs');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({ id: 'job-1', status: 'queued' });
  });

  it('requests a job status by id', () => {
    service.getJobStatus('job-7').subscribe((response) => {
      expect(response).toEqual({ id: 'job-7', status: 'processing' });
    });

    const request = httpController.expectOne('/api/jobs/job-7');

    expect(request.request.method).toBe('GET');

    request.flush({ id: 'job-7', status: 'processing' });
  });
});
