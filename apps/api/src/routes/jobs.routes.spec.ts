import { describe, expect, it } from 'vitest';

import { jobsRouter } from './jobs.routes.js';

describe('jobsRouter', () => {
  it('registers POST /, GET /:id/result and GET /:id', () => {
    const stack = (jobsRouter as unknown as {
      stack: Array<{
        route?: {
          path: string;
          methods: Record<string, boolean>;
        };
      }>;
    }).stack;

    expect(
      stack.some(
        (layer) =>
          layer.route?.path === '/' && layer.route.methods.post === true,
      ),
    ).toBe(true);
    expect(
      stack.some(
        (layer) =>
          layer.route?.path === '/:id/result' && layer.route.methods.get === true,
      ),
    ).toBe(true);
    expect(
      stack.some(
        (layer) =>
          layer.route?.path === '/:id' && layer.route.methods.get === true,
      ),
    ).toBe(true);
  });
});
