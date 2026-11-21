import crypto from 'crypto';

export function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'req-' + Math.random().toString(36).substring(2, 15);
}

export interface ApiResponse<T = unknown> {
  requestId: string;
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function ok<T>(requestId: string, data: T): ApiResponse<T> {
  return {
    requestId,
    success: true,
    data,
  };
}

export function err(
  requestId: string,
  code: string,
  message: string,
  details?: unknown,
): ApiResponse {
  return {
    requestId,
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}
