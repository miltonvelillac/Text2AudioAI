import type { Request, Response } from 'express';
import type { Mock } from 'vitest';
import { vi } from 'vitest';

export interface MockResponse extends Response {
  status: Mock;
  json: Mock;
}

export function createMockRequest<TBody = unknown, TParams = Record<string, string>>(
  options: {
    body?: TBody;
    params?: TParams;
  } = {},
): Request {
  return {
    body: options.body ?? {},
    params: options.params ?? {},
  } as unknown as Request;
}

export function createMockResponse(): MockResponse {
  const response = {
    status: vi.fn(),
    json: vi.fn(),
  } as unknown as MockResponse;

  response.status.mockReturnValue(response);
  response.json.mockReturnValue(response);

  return response;
}
