import { describe, expect, it, vi } from 'vitest';

import { SummarizationService } from './summarization.service.js';

describe('SummarizationService', () => {
  it('uses the local fallback when no Gemini client is configured', async () => {
    const service = new SummarizationService(null, 'ignored-model');

    const result = await service.summarize({
      text: 'Uno dos tres cuatro cinco seis siete ocho nueve diez once doce.',
      language: 'es',
      summaryLength: 'short',
    });

    expect(result).toEqual({
      summary: 'Uno dos tres cuatro cinco seis siete ocho nueve diez once doce.',
      provider: 'local-fallback',
      model: 'deterministic-truncation',
    });
  });

  it('calls Gemini with structured output and parses the summary', async () => {
    const generateContent = vi.fn().mockResolvedValue({
      text: JSON.stringify({
        summary: '  Resumen listo para narracion.  ',
      }),
    });
    const service = new SummarizationService(
      {
        models: {
          generateContent,
        },
      } as never,
      'gemini-test-model',
    );

    const result = await service.summarize({
      text: 'Linea uno.\r\nLinea dos.',
      language: 'es',
      summaryLength: 'short',
    });

    expect(result).toEqual({
      summary: 'Resumen listo para narracion.',
      provider: 'google-gemini',
      model: 'gemini-test-model',
    });

    expect(generateContent).toHaveBeenCalledWith({
      model: 'gemini-test-model',
      config: expect.objectContaining({
        temperature: 0.4,
        responseMimeType: 'application/json',
        systemInstruction: expect.stringContaining('Write in Spanish.'),
      }),
      contents: expect.stringContaining('Target length: 40 to 70 words.'),
    });
    expect(generateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        contents: expect.stringContaining('Linea uno.\nLinea dos.'),
      }),
    );
  });

  it('throws when Gemini returns invalid JSON', async () => {
    const service = new SummarizationService(
      {
        models: {
          generateContent: vi.fn().mockResolvedValue({ text: 'not json' }),
        },
      } as never,
      'gemini-test-model',
    );

    await expect(
      service.summarize({
        text: 'Text to summarize.',
        language: 'en',
        summaryLength: 'medium',
      }),
    ).rejects.toThrow('Gemini returned invalid JSON');
  });

  it('throws when Gemini returns an empty summary field', async () => {
    const service = new SummarizationService(
      {
        models: {
          generateContent: vi.fn().mockResolvedValue({
            text: JSON.stringify({ summary: '   ' }),
          }),
        },
      } as never,
      'gemini-test-model',
    );

    await expect(
      service.summarize({
        text: 'Text to summarize.',
        language: 'en',
      }),
    ).rejects.toThrow('Gemini returned a response without a usable summary.');
  });
});
