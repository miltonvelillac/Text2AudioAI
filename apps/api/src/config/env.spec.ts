import { afterEach, describe, expect, it, vi } from 'vitest';

const originalEnv = { ...process.env };

async function loadEnvModule() {
  vi.resetModules();
  return import('./env.js');
}

describe('env', () => {
  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('uses the default values when no environment variables are set', async () => {
    delete process.env.PORT;
    delete process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_MODEL;
    delete process.env.NODE_ENV;

    const loadEnvSpy = vi
      .spyOn(process, 'loadEnvFile')
      .mockImplementation(() => undefined as never);

    const { env } = await loadEnvModule();

    expect(loadEnvSpy).toHaveBeenCalledWith('apps/api/.env');
    expect(env).toEqual({
      nodeEnv: 'development',
      port: 3000,
      geminiApiKey: undefined,
      geminiModel: 'gemini-2.5-flash-lite',
    });
  });

  it('parses and normalizes the configured values', async () => {
    process.env.PORT = '4100';
    process.env.NODE_ENV = 'test';
    process.env.GEMINI_API_KEY = '  secret-key  ';
    process.env.GEMINI_MODEL = '  gemini-custom  ';

    vi.spyOn(process, 'loadEnvFile').mockImplementation(() => undefined as never);

    const { env } = await loadEnvModule();

    expect(env).toEqual({
      nodeEnv: 'test',
      port: 4100,
      geminiApiKey: 'secret-key',
      geminiModel: 'gemini-custom',
    });
  });

  it('falls back to the default port and ignores missing .env files', async () => {
    process.env.PORT = '-20';

    vi.spyOn(process, 'loadEnvFile').mockImplementation(() => {
      throw new Error('ENOENT: no such file or directory');
    });

    const { env } = await loadEnvModule();

    expect(env.port).toBe(3000);
  });
});
