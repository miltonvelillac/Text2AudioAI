import { type WritableSignal, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import type { CreateJobRequest, JobStatusResponse } from '@text2audio-ai/shared-types';

import { JobStatusBadgeComponent } from '../../shared/ui/job-status-badge/job-status-badge.component';
import { JobStatusTimelineComponent } from '../../shared/ui/job-status-timeline/job-status-timeline.component';
import { JobStudioComponent } from './job-studio.component';
import { JobStudioFacade } from './job-studio.facade';

describe('JobStudioComponent', () => {
  let facadeStub: JobStudioFacade;
  let activeJobSignal: WritableSignal<JobStatusResponse | null>;
  let requestSnapshotSignal: WritableSignal<CreateJobRequest | null>;
  let currentModeSignal: WritableSignal<'full' | 'summary'>;
  let submitJobSpy: jasmine.Spy;

  beforeEach(async () => {
    activeJobSignal = signal<JobStatusResponse | null>({
      id: 'job-17',
      status: 'processing',
    });
    requestSnapshotSignal = signal<CreateJobRequest | null>({
      text: 'This is a sufficiently long text to keep the request valid in the view.',
      mode: 'summary',
      summaryLength: 'medium',
      language: 'es',
      voice: 'es-US-Neural2-A',
      outputFormat: 'mp3',
    });
    currentModeSignal = signal<'full' | 'summary'>('summary');
    submitJobSpy = jasmine.createSpy('submitJob');

    facadeStub = {
      form: new FormGroup({
        text: new FormControl(
          'This is a sufficiently long text to keep the request valid in the view.',
          {
            nonNullable: true,
            validators: [Validators.required, Validators.minLength(20)],
          },
        ),
        mode: new FormControl<'full' | 'summary'>('summary', {
          nonNullable: true,
          validators: [Validators.required],
        }),
        summaryLength: new FormControl<'short' | 'medium' | 'long'>('medium', {
          nonNullable: true,
          validators: [Validators.required],
        }),
        language: new FormControl<'es' | 'en'>('es', {
          nonNullable: true,
          validators: [Validators.required],
        }),
        voice: new FormControl('es-US-Neural2-A', {
          nonNullable: true,
          validators: [Validators.required],
        }),
        outputFormat: new FormControl<'mp3' | 'wav'>('mp3', {
          nonNullable: true,
          validators: [Validators.required],
        }),
      }),
      isSubmitting: signal(false),
      activeJob: activeJobSignal,
      submissionError: signal<string | null>(null),
      requestSnapshot: requestSnapshotSignal,
      currentMode: currentModeSignal,
      selectedLanguage: signal<'es' | 'en'>('es'),
      wordCount: signal(14),
      estimatedReadMinutes: signal(1),
      availableVoices: signal([
        {
          label: 'Neutral Latin A',
          value: 'es-US-Neural2-A',
          accent: 'Spanish',
          description: 'Balanced tone for explainers.',
        },
      ]),
      activeVoiceLabel: signal('Neutral Latin A'),
      statusHeadline: signal('Processing'),
      statusDescription: signal(
        'The worker placeholder is simulating the async generation stage.',
      ),
      requestModeLabel: signal('Summary pipeline'),
      submitJob: submitJobSpy,
      isStepActive: jasmine.createSpy('isStepActive').and.returnValue(true),
      isStepCurrent: jasmine.createSpy('isStepCurrent').and.returnValue(false),
      ngOnDestroy: jasmine.createSpy('ngOnDestroy'),
    } as unknown as JobStudioFacade;

    await TestBed.configureTestingModule({
      imports: [JobStudioComponent],
    })
      .overrideComponent(JobStudioComponent, {
        set: {
          providers: [
            {
              provide: JobStudioFacade,
              useValue: facadeStub,
            },
          ],
        },
      })
      .compileComponents();
  });

  it('renders the dark-mode studio shell with telemetry cards', () => {
    const fixture = TestBed.createComponent(JobStudioComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Angular control deck');
    expect(fixture.nativeElement.textContent).toContain('Summary pipeline');
    expect(fixture.debugElement.query(By.directive(JobStatusBadgeComponent))).not.toBeNull();
    expect(fixture.debugElement.query(By.directive(JobStatusTimelineComponent))).not.toBeNull();
  });

  it('submits the form through the facade', () => {
    const fixture = TestBed.createComponent(JobStudioComponent);
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    expect(submitJobSpy).toHaveBeenCalled();
  });

  it('hides the summary-length control when full narration is selected', () => {
    currentModeSignal.set('full');

    const fixture = TestBed.createComponent(JobStudioComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Summary length');
  });

  it('shows the empty states when there is no active job or payload snapshot', () => {
    activeJobSignal.set(null);
    requestSnapshotSignal.set(null);

    const fixture = TestBed.createComponent(JobStudioComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No active job');
    expect(fixture.nativeElement.textContent).toContain('No payload yet');
  });
});
