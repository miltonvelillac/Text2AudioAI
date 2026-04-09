import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { JobStatus } from '@text2audio-ai/shared-types';

import { getStatusMeta } from '../../../features/job-studio/job-studio.config';

@Component({
  selector: 'app-job-status-badge',
  standalone: true,
  template: `
    <span class="status-badge" [attr.data-tone]="meta().tone">
      {{ meta().label }}
    </span>
  `,
  styles: [
    `
      .status-badge {
        display: inline-flex;
        align-items: center;
        min-height: 2rem;
        padding: 0.35rem 0.85rem;
        border-radius: 999px;
        border: 1px solid var(--badge-border, rgba(120, 158, 189, 0.18));
        background: var(--badge-surface, rgba(120, 158, 189, 0.16));
        color: var(--badge-ink, var(--color-ink));
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .status-badge[data-tone='neutral'] {
        --badge-border: rgba(124, 157, 188, 0.24);
        --badge-surface: rgba(124, 157, 188, 0.16);
        --badge-ink: #d2dee9;
      }

      .status-badge[data-tone='active'] {
        --badge-border: rgba(78, 201, 176, 0.34);
        --badge-surface: rgba(78, 201, 176, 0.16);
        --badge-ink: #9ff4df;
      }

      .status-badge[data-tone='success'] {
        --badge-border: rgba(126, 211, 110, 0.32);
        --badge-surface: rgba(126, 211, 110, 0.16);
        --badge-ink: #bbf4ad;
      }

      .status-badge[data-tone='danger'] {
        --badge-border: rgba(255, 124, 100, 0.3);
        --badge-surface: rgba(255, 124, 100, 0.14);
        --badge-ink: #ffb8a8;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobStatusBadgeComponent {
  readonly status = input.required<JobStatus>();
  protected readonly meta = computed(() => getStatusMeta(this.status()));
}
