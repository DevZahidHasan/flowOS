export type AppError = {
  message: string;
  code: string;
  status: number;
};

export type Result<T> =
  | { data: T; error: null }
  | { data: null; error: AppError };

export function ok<T>(data: T): Result<T> {
  return { data, error: null };
}

export function fail<T = never>(error: AppError): Result<T> {
  return { data: null, error };
}
