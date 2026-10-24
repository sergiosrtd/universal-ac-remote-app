export type AppErrorCode =
  | 'TRANSPORT_UNAVAILABLE'
  | 'TRANSPORT_TIMEOUT'
  | 'UNSUPPORTED_COMMAND'
  | 'UNSUPPORTED_PLATFORM'
  | 'PERMISSION_DENIED'
  | 'AUTH_REQUIRED'
  | 'DEVICE_NOT_FOUND'
  | 'BRAND_NOT_FOUND'
  | 'STORAGE_ERROR'
  | 'UNKNOWN';

export class AppError extends Error {
  readonly code: AppErrorCode;
  /** Whether retrying the same operation could succeed (e.g. timeouts). */
  readonly retryable: boolean;
  override readonly cause?: unknown;

  constructor(code: AppErrorCode, message: string, options: { retryable?: boolean; cause?: unknown } = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.retryable = options.retryable ?? false;
    this.cause = options.cause;
  }

  static from(error: unknown, fallbackCode: AppErrorCode = 'UNKNOWN'): AppError {
    if (error instanceof AppError) return error;
    const message = error instanceof Error ? error.message : String(error);
    return new AppError(fallbackCode, message, { cause: error });
  }
}

/** Explicit success/failure result for service calls, so callers can't forget to handle errors. */
export type Result<T, E = AppError> = { ok: true; value: T } | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
