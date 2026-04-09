const defaultPort = 3000;
const defaultGeminiModel = 'gemini-2.5-flash-lite';

try {
  process.loadEnvFile?.('apps/api/.env');
} catch (error) {
  if (
    !(error instanceof Error) ||
    !error.message.includes('ENOENT')
  ) {
    throw error;
  }
}

function parsePort(value: string | undefined): number {
  if (!value) {
    return defaultPort;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return defaultPort;
  }

  return parsed;
}

function parseOptionalString(value: string | undefined): string | undefined {
  const normalized = value?.trim();

  return normalized ? normalized : undefined;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parsePort(process.env.PORT),
  geminiApiKey: parseOptionalString(process.env.GEMINI_API_KEY),
  geminiModel: parseOptionalString(process.env.GEMINI_MODEL) ?? defaultGeminiModel,
};
