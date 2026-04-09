import { describe, expect, it } from 'vitest';

import { createMockRequest, createMockResponse } from '../test/http-test-helpers.js';
import { getHealth } from './health.controller.js';

describe('getHealth', () => {
  it('returns the API health payload with a timestamp', () => {
    const request = createMockRequest();
    const response = createMockResponse();

    getHealth(request, response);

    expect(response.json).toHaveBeenCalledTimes(1);

    const [payload] = response.json.mock.calls[0] ?? [];

    expect(payload).toMatchObject({
      status: 'ok',
      service: 'api',
    });
    expect(new Date(payload.timestamp).toISOString()).toBe(payload.timestamp);
  });
});
