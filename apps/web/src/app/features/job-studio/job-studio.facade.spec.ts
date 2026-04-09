import { HttpErrorResponse } from '@angular/common/http';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import type { JobStatusResponse } from '@text2audio-ai/shared-types';

import { JobsApiService } from '../../core/apis/jobs-api.service';
import { JobStudioFacade } from './job-studio.facade';

describe('JobStudioFacade', () => {
  let facade: JobStudioFacade;
  let jobsApi: jasmine.SpyObj<JobsApiService>;

  beforeEach(() => {
    jobsApi = jasmine.createSpyObj<JobsApiService>('JobsApiService', [
      'createJob',
      'getJobStatus',
    ]);

    TestBed.configureTestingModule({
      providers: [
        JobStudioFacade,
        {
          provide: JobsApiService,
          useValue: jobsApi,
        },
      ],
    });

    facade = TestBed.inject(JobStudioFacade);
    facade.form.patchValue({
      text: 'This is a sufficiently long text to submit the job from the Angular client.',
      mode: 'summary',
      summaryLength: 'medium',
      language: 'es',
      voice: 'es-US-Neural2-A',
      outputFormat: 'mp3',
    });
  });

  afterEach(() => {
    facade.ngOnDestroy();
  });

  it('switches the voice when the language changes', () => {
    facade.form.controls.language.setValue('en');

    expect(facade.form.controls.voice.value).toBe('en-US-Journey-D');
  });

  it('does not submit invalid forms', () => {
    facade.form.controls.text.setValue('');

    facade.submitJob();

    expect(jobsApi.createJob).not.toHaveBeenCalled();
    expect(facade.form.controls.text.touched).toBeTrue();
  });

  it('omits summary length when full narration mode is selected', () => {
    jobsApi.createJob.and.returnValue(of({ id: 'job-1', status: 'queued' }));
    jobsApi.getJobStatus.and.returnValue(of({ id: 'job-1', status: 'completed' }));

    facade.form.patchValue({
      mode: 'full',
      summaryLength: 'long',
      outputFormat: 'wav',
    });

    facade.submitJob();

    expect(jobsApi.createJob).toHaveBeenCalledWith(
      jasmine.objectContaining({
        mode: 'full',
        summaryLength: undefined,
        outputFormat: 'wav',
      }),
    );
  });

  it('polls job status until the request is completed', fakeAsync(() => {
    jobsApi.createJob.and.returnValue(of({ id: 'job-7', status: 'queued' }));
    jobsApi.getJobStatus.and.returnValues(
      of({ id: 'job-7', status: 'queued' }),
      of({ id: 'job-7', status: 'processing' }),
      of({ id: 'job-7', status: 'completed' }),
    );

    facade.submitJob();

    expect(facade.activeJob()).toEqual({ id: 'job-7', status: 'queued' });
    expect(facade.isSubmitting()).toBeFalse();

    tick(0);
    expect(facade.activeJob()?.status).toBe('queued');

    tick(900);
    expect(facade.activeJob()?.status).toBe('processing');

    tick(900);
    expect(facade.activeJob()?.status).toBe('completed');

    const callsAfterCompletion = jobsApi.getJobStatus.calls.count();

    tick(900);
    expect(jobsApi.getJobStatus.calls.count()).toBe(callsAfterCompletion);
  }));

  it('formats request errors coming from HttpClient', () => {
    jobsApi.createJob.and.returnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { message: 'Invalid payload received by the API.' },
          }),
      ),
    );

    facade.submitJob();

    expect(facade.submissionError()).toBe('Invalid payload received by the API.');
    expect(facade.isSubmitting()).toBeFalse();
  });

  it('tracks which timeline steps are active and current', () => {
    const processingJob: JobStatusResponse = { id: 'job-9', status: 'processing' };

    facade.activeJob.set(processingJob);

    expect(facade.isStepActive('queued')).toBeTrue();
    expect(facade.isStepActive('processing')).toBeTrue();
    expect(facade.isStepActive('completed')).toBeFalse();
    expect(facade.isStepCurrent('processing')).toBeTrue();
  });
});
