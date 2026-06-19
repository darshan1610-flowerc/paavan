import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ValidationError } from '@/lib/server/errors';

export async function validateBody<T extends z.ZodTypeAny>(
  schema: T,
  req: NextRequest
): Promise<z.infer<T>> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw new ValidationError({ body: ['Request body must be valid JSON'] });
  }

  const result = schema.safeParse(json);
  if (!result.success) {
    throw new ValidationError(result.error.flatten().fieldErrors as Record<string, string[]>);
  }
  return result.data;
}

export function validateQuery<T extends z.ZodTypeAny>(
  schema: T,
  searchParams: URLSearchParams
): z.infer<T> {
  const result = schema.safeParse(Object.fromEntries(searchParams));
  if (!result.success) {
    throw new ValidationError(result.error.flatten().fieldErrors as Record<string, string[]>);
  }
  return result.data;
}
