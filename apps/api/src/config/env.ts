const defaultPort = 3000;

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

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parsePort(process.env.PORT),
};

