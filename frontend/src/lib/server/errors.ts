import { NextResponse } from 'next/server';

export class AdminAuthError extends Error {
  status: number;
  constructor(message: string, status: 401 | 403 = 401) {
    super(message);
    this.status = status;
  }
}

export class ValidationError extends Error {
  fieldErrors: Record<string, string[]>;
  constructor(fieldErrors: Record<string, string[]>) {
    super('Validation failed');
    this.fieldErrors = fieldErrors;
  }
}

export class RateLimitError extends Error {
  retryAfterSeconds: number;
  constructor(message: string, retryAfterSeconds: number) {
    super(message);
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

// Centralizes error -> HTTP response mapping so no route handler ever
// leaks a stack trace or internal detail to the client.
export function handleApiError(error: unknown) {
  if (error instanceof AdminAuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof ValidationError) {
    return NextResponse.json({ error: 'Invalid input', fieldErrors: error.fieldErrors }, { status: 400 });
  }
  if (error instanceof RateLimitError) {
    return NextResponse.json(
      { error: error.message, retryAfterSeconds: error.retryAfterSeconds },
      { status: 429 }
    );
  }

  console.error('[api] unhandled error', error);
  return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
}
