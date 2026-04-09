import { GoogleGenAI } from '@google/genai';
import type { SummaryLength } from '@text2audio-ai/shared-types';

import { env } from '../config/env.js';

type SummarizationClient = Pick<GoogleGenAI, 'models'>;

const summaryResponseSchema = {
  type: 'object',
  properties: {
    summary: {
      type: 'string',
      description: 'Natural-language summary ready to be narrated aloud.',
    },
  },
  required: ['summary'],
  propertyOrdering: ['summary'],
} as const;

const lengthTargets: Record<SummaryLength, string> = {
  short: '40 to 70 words',
  medium: '80 to 140 words',
  long: '160 to 240 words',
};

export interface SummarizeTextInput {
  text: string;
  language: string;
  summaryLength?: SummaryLength;
}

export interface SummarizeTextResult {
  summary: string;
  provider: string;
  model: string;
}

function normalizeText(text: string): string {
  return text.replace(/\r\n/g, '\n').trim();
}

function resolveOutputLanguage(language: string): string {
  return language.toLowerCase().startsWith('es') ? 'Spanish' : 'English';
}

function buildSystemInstruction(language: string): string {
  return [
    'You summarize long-form text for a text-to-speech pipeline.',
    `Write in ${resolveOutputLanguage(language)}.`,
    'Keep only the main ideas, remove repetition, and make the result easy to listen to.',
    'Prefer shorter sentences and a clean spoken rhythm.',
    'Do not mention that this is a summary.',
  ].join(' ');
}

function buildUserPrompt(input: SummarizeTextInput): string {
  const summaryLength = input.summaryLength ?? 'medium';

  return [
    `Target length: ${lengthTargets[summaryLength]}.`,
    'Return a spoken-style summary that preserves the key points and overall meaning.',
    'Avoid bullet points, section headers, or meta commentary.',
    '',
    'Text to summarize:',
    normalizeText(input.text),
  ].join('\n');
}

function selectSummaryWordLimit(length: SummaryLength): number {
  switch (length) {
    case 'short':
      return 30;
    case 'medium':
      return 60;
    case 'long':
      return 120;
  }
}

function createFallbackSummary(
  text: string,
  length: SummaryLength = 'medium',
): string {
  const words = normalizeText(text).split(/\s+/).filter(Boolean);
  const maxWords = selectSummaryWordLimit(length);

  return words.slice(0, maxWords).join(' ');
}

function parseSummaryPayload(payload: string): string {
  if (!payload) {
    throw new Error('Gemini returned an empty response.');
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(payload);
  } catch (error) {
    throw new Error(
      `Gemini returned invalid JSON: ${
        error instanceof Error ? error.message : 'Unknown parse error.'
      }`,
    );
  }

  const summary = (parsed as { summary?: unknown }).summary;

  if (typeof summary !== 'string' || normalizeText(summary).length === 0) {
    throw new Error('Gemini returned a response without a usable summary.');
  }

  return normalizeText(summary);
}

function createGeminiClient(apiKey: string | undefined): SummarizationClient | null {
  return apiKey ? new GoogleGenAI({ apiKey }) : null;
}

export class SummarizationService {
  constructor(
    private readonly client: SummarizationClient | null = createGeminiClient(
      env.geminiApiKey,
    ),
    private readonly model: string = env.geminiModel,
  ) {}

  async summarize(input: SummarizeTextInput): Promise<SummarizeTextResult> {
    if (!this.client) {
      return {
        summary: createFallbackSummary(input.text, input.summaryLength),
        provider: 'local-fallback',
        model: 'deterministic-truncation',
      };
    }

    const response = await this.client.models.generateContent({
      model: this.model,
      config: {
        temperature: 0.4,
        responseMimeType: 'application/json',
        responseJsonSchema: summaryResponseSchema,
        systemInstruction: buildSystemInstruction(input.language),
      },
      contents: buildUserPrompt(input),
    });

    return {
      summary: parseSummaryPayload(response.text ?? ''),
      provider: 'google-gemini',
      model: this.model,
    };
  }
}

export const summarizationService = new SummarizationService();
