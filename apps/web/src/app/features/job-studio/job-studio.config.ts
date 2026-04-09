import type { JobStatus, SummaryLength } from '@text2audio-ai/shared-types';

export type LanguageOption = 'es' | 'en';

export interface VoiceOption {
  readonly label: string;
  readonly value: string;
  readonly accent: string;
  readonly description: string;
}

export interface StatusMeta {
  readonly label: string;
  readonly description: string;
  readonly tone: 'neutral' | 'active' | 'success' | 'danger';
}

export const summaryLengthChoices = ['short', 'medium', 'long'] as const satisfies
  readonly SummaryLength[];

export const statusTimeline = ['queued', 'processing', 'completed'] as const satisfies
  readonly JobStatus[];

const voiceOptionsByLanguage: Record<LanguageOption, readonly VoiceOption[]> = {
  es: [
    {
      label: 'Neutral Latin A',
      value: 'es-US-Neural2-A',
      accent: 'Spanish',
      description: 'Balanced tone for explainers, lessons, and long-form notes.',
    },
    {
      label: 'Dynamic Latin B',
      value: 'es-US-Neural2-B',
      accent: 'Spanish',
      description: 'Slightly brighter delivery for shorter summaries and updates.',
    },
  ],
  en: [
    {
      label: 'Journey D',
      value: 'en-US-Journey-D',
      accent: 'English',
      description: 'Conversational pacing for article narration and study guides.',
    },
    {
      label: 'Studio O',
      value: 'en-US-Studio-O',
      accent: 'English',
      description: 'Cleaner projection for more polished voice-over style output.',
    },
  ],
};

const statusMetaByValue: Record<JobStatus, StatusMeta> = {
  queued: {
    label: 'Queued',
    description: 'The API accepted the job and reserved a slot for processing.',
    tone: 'neutral',
  },
  processing: {
    label: 'Processing',
    description: 'The worker placeholder is simulating the async generation stage.',
    tone: 'active',
  },
  completed: {
    label: 'Completed',
    description: 'The current MVP flow finished and the result can be exposed next.',
    tone: 'success',
  },
  failed: {
    label: 'Failed',
    description: 'The request could not complete and should surface an actionable error.',
    tone: 'danger',
  },
};

export function getVoiceOptions(language: LanguageOption): readonly VoiceOption[] {
  return voiceOptionsByLanguage[language];
}

export function getDefaultVoice(language: LanguageOption): string {
  return getVoiceOptions(language)[0]?.value ?? '';
}

export function getStatusMeta(status: JobStatus): StatusMeta {
  return statusMetaByValue[status];
}

export function estimateNarrationMinutes(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 150));
}
