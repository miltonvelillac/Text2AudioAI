import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnDestroy, computed, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Subscription, switchMap, timer } from 'rxjs';

import { countWords, needsSummary } from '@text2audio-ai/shared-utils';
import type {
  CreateJobRequest,
  JobMode,
  JobStatus,
  JobStatusResponse,
  OutputFormat,
  SummaryLength,
} from '@text2audio-ai/shared-types';

import { JobsApiService } from '../../core/apis/jobs-api.service';
import {
  type LanguageOption,
  estimateNarrationMinutes,
  getDefaultVoice,
  getStatusMeta,
  getVoiceOptions,
} from './job-studio.config';

const POLLING_INTERVAL_MS = 900;

@Injectable()
export class JobStudioFacade implements OnDestroy {
  private readonly subscriptions = new Subscription();
  private pollSubscription: Subscription | null = null;

  readonly form = new FormGroup({
    text: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(20)],
    }),
    mode: new FormControl<JobMode>('summary', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    summaryLength: new FormControl<SummaryLength>('medium', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    language: new FormControl<LanguageOption>('es', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    voice: new FormControl(getDefaultVoice('es'), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    outputFormat: new FormControl<OutputFormat>('mp3', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  readonly isSubmitting = signal(false);
  readonly activeJob = signal<JobStatusResponse | null>(null);
  readonly submissionError = signal<string | null>(null);
  readonly requestSnapshot = signal<CreateJobRequest | null>(null);

  readonly currentMode = computed(() => this.form.controls.mode.value);
  readonly selectedLanguage = computed(() => this.form.controls.language.value);
  readonly wordCount = computed(() => countWords(this.form.controls.text.value));
  readonly estimatedReadMinutes = computed(() =>
    estimateNarrationMinutes(this.wordCount()),
  );
  readonly availableVoices = computed(() =>
    getVoiceOptions(this.selectedLanguage()),
  );
  readonly activeVoiceLabel = computed(() => {
    const selectedVoice = this.form.controls.voice.value;

    return (
      this.availableVoices().find((voice) => voice.value === selectedVoice)?.label ??
      selectedVoice
    );
  });
  readonly statusHeadline = computed(() => {
    const job = this.activeJob();

    return job ? getStatusMeta(job.status).label : 'Studio idle';
  });
  readonly statusDescription = computed(() => {
    const job = this.activeJob();

    return job
      ? getStatusMeta(job.status).description
      : 'Submit a job to inspect the backend contract and the processing lifecycle.';
  });
  readonly requestModeLabel = computed(() =>
    needsSummary(this.currentMode()) ? 'Summary pipeline' : 'Full narration',
  );

  constructor(private readonly jobsApi: JobsApiService) {
    this.subscriptions.add(
      this.form.controls.language.valueChanges.subscribe((language) => {
        const nextVoice = getDefaultVoice(language);

        if (nextVoice && this.form.controls.voice.value !== nextVoice) {
          this.form.controls.voice.setValue(nextVoice);
        }
      }),
    );

    this.subscriptions.add(
      this.form.controls.mode.valueChanges.subscribe((mode) => {
        if (mode === 'summary') {
          this.form.controls.summaryLength.addValidators(Validators.required);
        } else {
          this.form.controls.summaryLength.clearValidators();
        }

        this.form.controls.summaryLength.updateValueAndValidity({
          emitEvent: false,
        });
      }),
    );
  }

  submitJob(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.createPayload();

    this.stopPolling();
    this.isSubmitting.set(true);
    this.submissionError.set(null);
    this.activeJob.set(null);
    this.requestSnapshot.set(payload);

    this.subscriptions.add(
      this.jobsApi.createJob(payload).subscribe({
        next: (job) => {
          this.activeJob.set(job);
          this.isSubmitting.set(false);
          this.startPolling(job.id);
        },
        error: (error: unknown) => {
          this.isSubmitting.set(false);
          this.submissionError.set(this.formatError(error));
        },
      }),
    );
  }

  isStepActive(step: JobStatus): boolean {
    const job = this.activeJob();

    if (!job) {
      return false;
    }

    const currentIndex = ['queued', 'processing', 'completed'].indexOf(job.status);
    const stepIndex = ['queued', 'processing', 'completed'].indexOf(step);

    return currentIndex >= stepIndex && currentIndex !== -1;
  }

  isStepCurrent(step: JobStatus): boolean {
    return this.activeJob()?.status === step;
  }

  ngOnDestroy(): void {
    this.stopPolling();
    this.subscriptions.unsubscribe();
  }

  private startPolling(jobId: string): void {
    this.stopPolling();

    this.pollSubscription = timer(0, POLLING_INTERVAL_MS)
      .pipe(switchMap(() => this.jobsApi.getJobStatus(jobId)))
      .subscribe({
        next: (job) => {
          this.activeJob.set(job);

          if (job.status === 'completed' || job.status === 'failed') {
            this.stopPolling();
          }
        },
        error: (error: unknown) => {
          this.submissionError.set(this.formatError(error));
          this.stopPolling();
        },
      });
  }

  private stopPolling(): void {
    this.pollSubscription?.unsubscribe();
    this.pollSubscription = null;
  }

  private createPayload(): CreateJobRequest {
    const value = this.form.getRawValue();

    return {
      text: value.text.trim(),
      mode: value.mode,
      summaryLength: value.mode === 'summary' ? value.summaryLength : undefined,
      language: value.language,
      voice: value.voice,
      outputFormat: value.outputFormat,
    };
  }

  private formatError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.message ?? error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Unexpected client error.';
  }
}
