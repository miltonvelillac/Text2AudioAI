export type JobMode = 'full' | 'summary';

export type SummaryLength = 'short' | 'medium' | 'long';

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export type OutputFormat = 'mp3' | 'wav';

export interface JobStatusResponse {
  id: string;
  status: JobStatus;
}

export interface CreateJobRequest {
  text: string;
  mode: JobMode;
  summaryLength?: SummaryLength;
  language: string;
  voice: string;
  outputFormat: OutputFormat;
}

export type CreateJobResponse = JobStatusResponse;

export interface JobResultProviderInfo {
  summary?: string;
  tts: string;
}

export interface JobResult {
  id: string;
  status: Extract<JobStatus, 'completed'>;
  mode: JobMode;
  originalText: string;
  finalText: string;
  audioUrl: string;
  durationSeconds: number;
  provider: JobResultProviderInfo;
}
