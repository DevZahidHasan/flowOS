import { AppError } from '../result/result';

export class AppErrorFactory {
  static badRequest(message: string, code: string = 'BAD_REQUEST'): AppError {
    return {
      message,
      code,
      status: 400,
    };
  }

  static unauthorized(message: string = 'Unauthorized access', code: string = 'UNAUTHORIZED'): AppError {
    return {
      message,
      code,
      status: 401,
    };
  }

  static forbidden(message: string = 'Permission denied', code: string = 'FORBIDDEN'): AppError {
    return {
      message,
      code,
      status: 403,
    };
  }

  static notFound(message: string = 'Resource not found', code: string = 'NOT_FOUND'): AppError {
    return {
      message,
      code,
      status: 404,
    };
  }

  static internal(message: string = 'An unexpected internal error occurred', code: string = 'INTERNAL_ERROR'): AppError {
    return {
      message,
      code,
      status: 500,
    };
  }

  static fromUnknown(err: unknown): AppError {
    if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
      return {
        message: (err as { message: string }).message,
        code: 'UNKNOWN_ERROR',
        status: 500,
      };
    }
    return AppErrorFactory.internal(String(err));
  }
}
