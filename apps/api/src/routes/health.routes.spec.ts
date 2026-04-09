import { describe, expect, it } from 'vitest';

import { healthRouter } from './health.routes.js';

describe('healthRouter', () => {
  it('registers GET /', () => {
    const stack = (healthRouter as unknown as {
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
          layer.route?.path === '/' && layer.route.methods.get === true,
      ),
    ).toBe(true);
  });
});
