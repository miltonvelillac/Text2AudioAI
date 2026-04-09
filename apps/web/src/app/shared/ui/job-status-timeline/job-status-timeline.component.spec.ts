import { TestBed } from '@angular/core/testing';

import { JobStatusTimelineComponent } from './job-status-timeline.component';

describe('JobStatusTimelineComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobStatusTimelineComponent],
    }).compileComponents();
  });

  it('marks the previous and current states as active', () => {
    const fixture = TestBed.createComponent(JobStatusTimelineComponent);
    fixture.componentRef.setInput('currentStatus', 'processing');
    fixture.detectChanges();

    const activeSteps = fixture.nativeElement.querySelectorAll('.timeline-step.is-active');
    const currentStep = fixture.nativeElement.querySelector(
      '.timeline-step.is-current .timeline-copy strong',
    ) as HTMLElement;

    expect(activeSteps.length).toBe(2);
    expect(currentStep.textContent).toContain('Processing');
  });

  it('does not activate any step when the job has failed outside the happy path', () => {
    const fixture = TestBed.createComponent(JobStatusTimelineComponent);
    fixture.componentRef.setInput('currentStatus', 'failed');
    fixture.detectChanges();

    const activeSteps = fixture.nativeElement.querySelectorAll('.timeline-step.is-active');

    expect(activeSteps.length).toBe(0);
  });
});
