import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useTelemetry() {

  const createLog = useMutation(api.telemetry.createLog);
  const user = useQuery(api.user.getCurrentUser);
  const userId: Id<"users"> | undefined = user?._id;

  const logEvent = async (event: string, context?: any, error?: any) => {
    if (!userId) return;
    try {
      await createLog({ userId, event, context, error });
      console.log(`[Telemetry] Logged event: ${event}`);
    } catch (err) {
      await createLog({ userId, event, context, error: err });
      console.error(`[Telemetry] Failed to log event: ${event}`, err);
    }
  };
  return { logEvent };
}