import {
  estimateNarrationMinutes,
  getDefaultVoice,
  getStatusMeta,
  getVoiceOptions,
  statusTimeline,
  summaryLengthChoices,
} from './job-studio.config';

describe('job-studio.config', () => {
  it('exposes the configured summary lengths and status timeline', () => {
    expect(summaryLengthChoices).toEqual(['short', 'medium', 'long']);
    expect(statusTimeline).toEqual(['queued', 'processing', 'completed']);
  });

  it('returns voice options and defaults per language', () => {
    expect(getVoiceOptions('es')[0]?.value).toBe('es-US-Neural2-A');
    expect(getVoiceOptions('en')[0]?.value).toBe('en-US-Journey-D');
    expect(getDefaultVoice('es')).toBe('es-US-Neural2-A');
    expect(getDefaultVoice('en')).toBe('en-US-Journey-D');
  });

  it('maps statuses to labels and tones', () => {
    expect(getStatusMeta('queued')).toEqual(
      jasmine.objectContaining({ label: 'Queued', tone: 'neutral' }),
    );
    expect(getStatusMeta('failed')).toEqual(
      jasmine.objectContaining({ label: 'Failed', tone: 'danger' }),
    );
  });

  it('estimates reading time with a minimum of one minute', () => {
    expect(estimateNarrationMinutes(0)).toBe(1);
    expect(estimateNarrationMinutes(151)).toBe(2);
    expect(estimateNarrationMinutes(301)).toBe(3);
  });
});
