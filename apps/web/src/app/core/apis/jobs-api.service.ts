import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import type {
  CreateJobRequest,
  CreateJobResponse,
  JobStatusResponse,
} from '@text2audio-ai/shared-types';

@Injectable({
  providedIn: 'root',
})
export class JobsApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = '/api';

  createJob(payload: CreateJobRequest) {
    return this.http.post<CreateJobResponse>(`${this.apiBaseUrl}/jobs`, payload);
  }

  getJobStatus(jobId: string) {
    return this.http.get<JobStatusResponse>(`${this.apiBaseUrl}/jobs/${jobId}`);
  }
}
