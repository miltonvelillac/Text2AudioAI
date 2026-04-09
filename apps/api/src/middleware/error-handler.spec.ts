import type { NextFunction } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { createMockRequest, createMockResponse } from '../test/http-test-helpers.js';
import { errorHandler } from './error-handler.js';

describe('errorHandler', () => {
  it('logs the error and returns a 500 payload', () => {
    const error = new Error('Boom');
    const request = createMockRequest();
    const response = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    errorHandler(error, request, response, next);

    expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      message: 'Unexpected server error.',
    });
  });
});
