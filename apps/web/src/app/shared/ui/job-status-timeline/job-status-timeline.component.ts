import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import type { JobStatus } from '@text2audio-ai/shared-types';

import {
  getStatusMeta,
  statusTimeline,
  type StatusMeta,
} from '../../../features/job-studio/job-studio.config';

type TimelineStatus = (typeof statusTimeline)[number];

@Component({
  selector: 'app-job-status-timeline',
  standalone: true,
  template: `
    <ol class="timeline">
      @for (step of steps; track step) {
        <li
          class="timeline-step"
          [class.is-active]="isStepActive(step)"
          [class.is-current]="isStepCurrent(step)"
        >
          <span class="timeline-dot"></span>
          <div class="timeline-copy">
            <strong>{{ getStepMeta(step).label }}</strong>
            <small>{{ getStepMeta(step).description }}</small>
          </div>
        </li>
      }
    </ol>
  `,
  styles: [
    `
      .timeline {
        display: grid;
        gap: 0.9rem;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .timeline-step {
        display: grid;
        gap: 0.85rem;
        grid-template-columns: auto 1fr;
        align-items: start;
        padding: 0.9rem 1rem;
        border: 1px solid rgba(122, 147, 170, 0.16);
        border-radius: 1rem;
        background: rgba(10, 19, 31, 0.62);
        opacity: 0.62;
        transition:
          transform 180ms ease,
          opacity 180ms ease,
          border-color 180ms ease,
          background 180ms ease;
      }

      .timeline-step.is-active {
        opacity: 1;
        border-color: rgba(86, 205, 179, 0.34);
      }

      .timeline-step.is-current {
        transform: translateX(4px);
        background: rgba(12, 27, 43, 0.94);
      }

      .timeline-dot {
        width: 0.9rem;
        height: 0.9rem;
        margin-top: 0.2rem;
        border-radius: 999px;
        background: rgba(110, 145, 176, 0.24);
        box-shadow: inset 0 0 0 1px rgba(141, 172, 198, 0.14);
      }

      .timeline-step.is-active .timeline-dot {
        background: linear-gradient(135deg, #ff9a56, #50d7c0);
        box-shadow: 0 0 0 7px rgba(80, 215, 192, 0.12);
      }

      .timeline-copy {
        display: grid;
        gap: 0.35rem;
      }

      .timeline-copy strong {
        font-size: 0.83rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--color-ink);
      }

      .timeline-copy small {
        color: var(--color-muted);
        line-height: 1.45;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobStatusTimelineComponent {
  readonly currentStatus = input<JobStatus | null>(null);
  protected readonly steps = statusTimeline;

  protected getStepMeta(step: TimelineStatus): StatusMeta {
    return getStatusMeta(step);
  }

  protected isStepActive(step: TimelineStatus): boolean {
    const currentStatus = this.currentStatus();

    if (!currentStatus) {
      return false;
    }

    const currentIndex = statusTimeline.indexOf(currentStatus as TimelineStatus);
    const stepIndex = statusTimeline.indexOf(step);

    return currentIndex >= stepIndex && currentIndex !== -1;
  }

  protected isStepCurrent(step: TimelineStatus): boolean {
    return this.currentStatus() === step;
  }
}
