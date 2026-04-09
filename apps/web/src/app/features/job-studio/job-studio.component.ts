import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { JobStatusBadgeComponent } from '../../shared/ui/job-status-badge/job-status-badge.component';
import { JobStatusTimelineComponent } from '../../shared/ui/job-status-timeline/job-status-timeline.component';
import { JobStudioFacade } from './job-studio.facade';
import { summaryLengthChoices } from './job-studio.config';

@Component({
  selector: 'app-job-studio',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    JobStatusBadgeComponent,
    JobStatusTimelineComponent,
  ],
  providers: [JobStudioFacade],
  template: `
    <div class="studio-shell">
      <div class="orb orb-primary"></div>
      <div class="orb orb-secondary"></div>
      <section class="workspace">
        <article class="panel composer-panel">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Request builder</p>
              <h2>Compose a backend job request</h2>
            </div>
            <p>
              Keep this screen close to the API contract. The point is to validate
              payloads and state transitions before the real AI services arrive.
            </p>
          </div>

          <form class="job-form" [formGroup]="facade.form" (ngSubmit)="facade.submitJob()">
            <label class="field field-textarea">
              <span>Source text</span>
              <textarea
                formControlName="text"
                rows="12"
                placeholder="Paste an article, transcript, lesson, or research note."
              ></textarea>

              @if (
                facade.form.controls.text.touched &&
                facade.form.controls.text.hasError('required')
              ) {
                <small class="field-error">Source text is required.</small>
              } @else if (
                facade.form.controls.text.touched &&
                facade.form.controls.text.hasError('minlength')
              ) {
                <small class="field-error">
                  Use at least 20 characters so the backend receives a realistic payload.
                </small>
              } @else {
                <small class="field-hint">
                  The backend currently stores an in-memory job and simulates progression.
                </small>
              }
            </label>

            <div class="field-grid">
              <label class="field">
                <span>Mode</span>
                <select formControlName="mode">
                  <option value="full">Full narration</option>
                  <option value="summary">Summary narration</option>
                </select>
              </label>

              @if (facade.currentMode() === 'summary') {
                <label class="field">
                  <span>Summary length</span>
                  <select formControlName="summaryLength">
                    @for (option of summaryLengthChoicesValue; track option) {
                      <option [value]="option">{{ option }}</option>
                    }
                  </select>
                </label>
              }

              <label class="field">
                <span>Language</span>
                <select formControlName="language">
                  <option value="es">Spanish</option>
                  <option value="en">English</option>
                </select>
              </label>

              <label class="field">
                <span>Voice</span>
                <select formControlName="voice">
                  @for (voice of facade.availableVoices(); track voice.value) {
                    <option [value]="voice.value">{{ voice.label }}</option>
                  }
                </select>
              </label>

              <label class="field">
                <span>Format</span>
                <select formControlName="outputFormat">
                  <option value="mp3">MP3</option>
                  <option value="wav">WAV</option>
                </select>
              </label>
            </div>

            <div class="action-row">
              <button
                type="submit"
                class="primary-button"
                [disabled]="facade.isSubmitting()"
              >
                {{ facade.isSubmitting() ? 'Submitting...' : 'Create job' }}
              </button>

              <p class="action-hint">
                Run <code>corepack pnpm api:dev</code> and <code>corepack pnpm web:dev</code>
                to validate both ends together.
              </p>
            </div>
          </form>
        </article>

        <div class="telemetry-stack">
          <article class="panel telemetry-panel">
            <div class="panel-head compact">
              <div>
                <p class="eyebrow">Runtime telemetry</p>
                <h2>{{ facade.statusHeadline() }}</h2>
              </div>

              @if (facade.activeJob(); as job) {
                <app-job-status-badge [status]="job.status" />
              }
            </div>

            <p class="telemetry-copy">{{ facade.statusDescription() }}</p>

            @if (facade.submissionError()) {
              <div class="alert-panel">
                <strong>Submission error</strong>
                <p>{{ facade.submissionError() }}</p>
              </div>
            }

            @if (facade.activeJob(); as job) {
              <div class="job-meta">
                <div>
                  <span class="meta-label">Job ID</span>
                  <strong>{{ job.id }}</strong>
                </div>
                <div>
                  <span class="meta-label">Current state</span>
                  <strong>{{ job.status }}</strong>
                </div>
              </div>

              <app-job-status-timeline [currentStatus]="job.status" />
            } @else {
              <div class="empty-panel">
                <strong>No active job</strong>
                <p>
                  The latest backend response, timeline, and payload snapshot will
                  appear here after the first submission.
                </p>
              </div>
            }
          </article>

          <article class="panel notes-panel">
            <div class="panel-head compact">
              <div>
                <p class="eyebrow">Payload snapshot</p>
                <h2>What the client just sent</h2>
              </div>
            </div>

            @if (facade.requestSnapshot(); as snapshot) {
              <pre>{{ snapshot | json }}</pre>
            } @else {
              <div class="empty-panel compact-empty">
                <strong>No payload yet</strong>
                <p>Submit one request to inspect the exact body sent to <code>/api/jobs</code>.</p>
              </div>
            }
          </article>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .studio-shell {
        position: relative;
        min-height: 100vh;
        display: grid;
        gap: 1.5rem;
        overflow: hidden;
      }

      .orb {
        position: absolute;
        border-radius: 999px;
        filter: blur(60px);
        opacity: 0.55;
        pointer-events: none;
        animation: drift 14s ease-in-out infinite;
      }

      .orb-primary {
        top: -4rem;
        right: -6rem;
        width: 20rem;
        height: 20rem;
        background: rgba(79, 215, 192, 0.28);
      }

      .orb-secondary {
        bottom: 8%;
        left: -5rem;
        width: 18rem;
        height: 18rem;
        background: rgba(255, 154, 86, 0.24);
        animation-delay: -5s;
      }

      .hero-panel,
      .workspace {
        position: relative;
        z-index: 1;
      }

      .hero-panel {
        display: grid;
        gap: 1.4rem;
        grid-template-columns: minmax(0, 1.45fr) minmax(18rem, 0.95fr);
      }

      .hero-copy {
        display: grid;
        gap: 1rem;
        align-content: start;
      }

      .eyebrow {
        margin: 0;
        color: var(--color-accent-alt);
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.22em;
        text-transform: uppercase;
      }

      .hero-copy h1,
      .panel-head h2 {
        margin: 0;
        font-family: 'Rockwell', 'Georgia', serif;
        line-height: 0.98;
        letter-spacing: -0.05em;
      }

      .hero-copy h1 {
        max-width: 10ch;
        font-size: clamp(2.8rem, 6vw, 5.4rem);
      }

      .lede,
      .panel-head p,
      .telemetry-copy,
      .field-hint,
      .action-hint,
      .empty-panel p {
        color: var(--color-muted);
        line-height: 1.55;
      }

      .lede,
      .panel-head p,
      .telemetry-copy,
      .empty-panel p {
        margin: 0;
      }

      .hero-metrics {
        display: grid;
        gap: 1rem;
      }

      .metric-card,
      .panel {
        border: 1px solid var(--color-border);
        background: var(--color-surface);
        box-shadow: var(--shadow-panel);
        backdrop-filter: blur(20px);
      }

      .metric-card {
        display: grid;
        gap: 0.35rem;
        padding: 1.1rem 1.15rem;
        border-radius: 1.15rem;
      }

      .metric-label,
      .field span,
      .meta-label {
        color: var(--color-muted);
        font-size: 0.76rem;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }

      .metric-card strong,
      .job-meta strong,
      .empty-panel strong,
      .alert-panel strong {
        color: var(--color-ink);
      }

      .metric-card strong {
        font-size: 1.12rem;
      }

      .metric-card small {
        color: var(--color-muted);
      }

      .workspace {
        display: grid;
        gap: 1.5rem;
        grid-template-columns: minmax(0, 1.3fr) minmax(19rem, 1fr);
      }

      .telemetry-stack {
        display: grid;
        gap: 1.5rem;
        align-content: start;
      }

      .panel {
        padding: 1.4rem;
        border-radius: 1.4rem;
      }

      .panel-head {
        display: grid;
        gap: 0.85rem;
        margin-bottom: 1.2rem;
      }

      .panel-head.compact {
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: start;
      }

      .panel-head h2 {
        font-size: 1.7rem;
      }

      .job-form,
      .field,
      .notes-panel,
      .telemetry-panel {
        display: grid;
        gap: 1rem;
      }

      .field-textarea {
        gap: 0.55rem;
      }

      .field textarea,
      .field select {
        width: 100%;
        border: 1px solid rgba(122, 147, 170, 0.2);
        border-radius: 1rem;
        background: rgba(6, 16, 27, 0.72);
        color: var(--color-ink);
        font: inherit;
        transition:
          border-color 180ms ease,
          box-shadow 180ms ease,
          transform 180ms ease;
      }

      .field textarea {
        min-height: 16rem;
        padding: 1rem;
        resize: vertical;
      }

      .field select {
        min-height: 3.25rem;
        padding: 0.9rem 1rem;
      }

      .field textarea::placeholder {
        color: rgba(144, 164, 181, 0.7);
      }

      .field textarea:focus,
      .field select:focus {
        outline: none;
        border-color: rgba(79, 215, 192, 0.48);
        box-shadow: 0 0 0 4px rgba(79, 215, 192, 0.12);
        transform: translateY(-1px);
      }

      .field-grid {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .field-hint,
      .field-error,
      .action-hint {
        margin: 0;
        font-size: 0.92rem;
      }

      .field-error {
        color: #ffb7aa;
      }

      .action-row {
        display: grid;
        gap: 0.85rem;
      }

      .primary-button {
        min-height: 3.4rem;
        padding: 0.9rem 1.35rem;
        border: 0;
        border-radius: 999px;
        background: linear-gradient(135deg, #ff9a56, #46d6be);
        color: #06111b;
        font: inherit;
        font-weight: 800;
        letter-spacing: 0.04em;
        cursor: pointer;
        transition:
          transform 180ms ease,
          box-shadow 180ms ease,
          opacity 180ms ease;
        box-shadow: 0 20px 40px rgba(70, 214, 190, 0.22);
      }

      .primary-button:hover:not(:disabled) {
        transform: translateY(-1px);
      }

      .primary-button:disabled {
        opacity: 0.7;
        cursor: wait;
      }

      .action-hint code,
      .empty-panel code {
        color: var(--color-accent-alt);
      }

      .telemetry-copy {
        margin-bottom: 0.25rem;
      }

      .job-meta {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        padding: 1rem;
        border-radius: 1rem;
        background: rgba(6, 16, 27, 0.68);
      }

      .job-meta strong {
        display: block;
        margin-top: 0.35rem;
        overflow-wrap: anywhere;
      }

      .alert-panel,
      .empty-panel {
        padding: 1rem;
        border-radius: 1rem;
        border: 1px solid rgba(122, 147, 170, 0.16);
      }

      .alert-panel {
        background: rgba(68, 18, 16, 0.72);
        border-color: rgba(255, 124, 100, 0.26);
      }

      .alert-panel p {
        margin: 0.55rem 0 0;
        color: #ffcdc3;
      }

      .empty-panel {
        background: rgba(7, 15, 25, 0.68);
      }

      .compact-empty {
        min-height: 10rem;
        align-content: center;
      }

      .notes-panel pre {
        margin: 0;
        padding: 1rem;
        border-radius: 1rem;
        border: 1px solid rgba(122, 147, 170, 0.16);
        background: rgba(4, 12, 20, 0.84);
        color: #d9e5ef;
        white-space: pre-wrap;
        word-break: break-word;
        font-family: 'Consolas', 'Courier New', monospace;
        font-size: 0.88rem;
        line-height: 1.5;
      }

      @keyframes drift {
        0%,
        100% {
          transform: translate3d(0, 0, 0) scale(1);
        }

        50% {
          transform: translate3d(1rem, -1.2rem, 0) scale(1.08);
        }
      }

      @media (max-width: 960px) {
        .hero-panel,
        .workspace,
        .field-grid,
        .job-meta {
          grid-template-columns: 1fr;
        }

        .hero-copy h1 {
          max-width: 100%;
        }

        .panel-head.compact {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobStudioComponent {
  protected readonly facade = inject(JobStudioFacade);
  protected readonly summaryLengthChoicesValue = summaryLengthChoices;
}
