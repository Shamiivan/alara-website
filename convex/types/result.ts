export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function Ok<T>(data: T): Result<T> {
  return { success: true, data };
}

export function Err<T>(error: string): Result<T> {
  return { success: false, error };
}
