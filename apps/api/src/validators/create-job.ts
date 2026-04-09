import type {
  CreateJobRequest,
  JobMode,
  OutputFormat,
  SummaryLength,
} from '@text2audio-ai/shared-types';

const jobModes = ['full', 'summary'] as const satisfies readonly JobMode[];
const outputFormats = ['mp3', 'wav'] as const satisfies readonly OutputFormat[];
const summaryLengths = ['short', 'medium', 'long'] as const satisfies readonly SummaryLength[];

type ValidationResult =
  | { success: true; data: CreateJobRequest }
  | { success: false; issues: string[] };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateCreateJobRequest(payload: unknown): ValidationResult {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      success: false,
      issues: ['Request body must be a JSON object.'],
    };
  }

  const data = payload as Partial<CreateJobRequest>;
  const issues: string[] = [];

  if (!isNonEmptyString(data.text)) {
    issues.push('text is required.');
  }

  if (!jobModes.includes(data.mode as JobMode)) {
    issues.push('mode must be either "full" or "summary".');
  }

  if (!isNonEmptyString(data.language)) {
    issues.push('language is required.');
  }

  if (!isNonEmptyString(data.voice)) {
    issues.push('voice is required.');
  }

  if (!outputFormats.includes(data.outputFormat as OutputFormat)) {
    issues.push('outputFormat must be either "mp3" or "wav".');
  }

  if (
    data.mode === 'summary' &&
    !summaryLengths.includes(data.summaryLength as SummaryLength)
  ) {
    issues.push('summaryLength is required when mode is "summary".');
  }

  if (issues.length > 0) {
    return {
      success: false,
      issues,
    };
  }

  return {
    success: true,
    data: {
      text: data.text!.trim(),
      mode: data.mode!,
      summaryLength: data.summaryLength,
      language: data.language!.trim(),
      voice: data.voice!.trim(),
      outputFormat: data.outputFormat!,
    },
  };
}

