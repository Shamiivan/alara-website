import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";


export function useCalendarV1Enabled(userId: string) {
  // Call hooks unconditionally at the top level
  const user = useQuery(api.user.getCurrentUser);
  // Use "skip" pattern instead of conditional hook call
  const flagsResult = useQuery(
    api.feature.flags.getFeatureFlagsByUser,
    user && user._id ? { userId: user._id } : "skip"
  );

  // Handle conditional logic after all hooks are called
  if (!userId || !user || !user._id) return false;
  return Boolean(flagsResult?.calendar_v1);
}