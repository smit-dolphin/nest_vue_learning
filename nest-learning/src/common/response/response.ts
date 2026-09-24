export interface ApiResponse {
  status: number;
  message: string;
  data: unknown;
  meta?: unknown;
  success: boolean;
}

export function ok(
  message: string,
  data?: unknown,
  meta?: unknown,
  status = 200,
): ApiResponse {
  const body: ApiResponse = { status, message, data, success: true };
  if (meta !== undefined) body.meta = meta;
  return body;
}
