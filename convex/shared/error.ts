import { api } from "../_generated/api";

export async function withErrorHandling<T>(
  ctx: any,
  operation: string,
  fn: () => Promise<T>,
  context?: any
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    await ctx.runMutation(api.events.logErrorInternal, {
      category: operation,
      message: error instanceof Error ? error.message : String(error),
      details: { context, error: error instanceof Error ? error.stack : String(error) },
      source: "convex",
    });
    throw error;
  }
}