import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";


export function useCalendarV1Enabled(userId: string) {
  // get the user ID
  if (!userId) return false;
  const user = useQuery(api.user.getCurrentUser);
  if (!user || !user._id) return false;
  const flags = useQuery(api.feature.flags.getFeatureFlagsByUser, { userId: user._id });
  return Boolean(flags?.calendar_v1);
}