import { describe, expect, it } from 'vitest';

import { validateCreateJobRequest } from './create-job.js';

describe('validateCreateJobRequest', () => {
  it('rejects non-object payloads', () => {
    expect(validateCreateJobRequest(null)).toEqual({
      success: false,
      issues: ['Request body must be a JSON object.'],
    });
  });

  it('rejects missing required fields', () => {
    const result = validateCreateJobRequest({
      text: '',
      mode: 'invalid',
      language: '',
      voice: '',
      outputFormat: 'ogg',
    });

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error('Expected validation to fail.');
    }

    expect(result.issues).toEqual([
      'text is required.',
      'mode must be either "full" or "summary".',
      'language is required.',
      'voice is required.',
      'outputFormat must be either "mp3" or "wav".',
    ]);
  });

  it('requires summaryLength when the mode is summary', () => {
    const result = validateCreateJobRequest({
      text: 'A valid body still needs a summary length in summary mode.',
      mode: 'summary',
      language: 'es',
      voice: 'es-US-Neural2-A',
      outputFormat: 'mp3',
    });

    expect(result).toEqual({
      success: false,
      issues: ['summaryLength is required when mode is "summary".'],
    });
  });

  it('returns a sanitized payload when the body is valid', () => {
    const result = validateCreateJobRequest({
      text: '  Texto listo para resumir.  ',
      mode: 'summary',
      summaryLength: 'medium',
      language: ' es ',
      voice: ' es-US-Neural2-A ',
      outputFormat: 'mp3',
    });

    expect(result).toEqual({
      success: true,
      data: {
        text: 'Texto listo para resumir.',
        mode: 'summary',
        summaryLength: 'medium',
        language: 'es',
        voice: 'es-US-Neural2-A',
        outputFormat: 'mp3',
      },
    });
  });
});
