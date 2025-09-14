import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { localFieldsToUtcISO } from "@/lib/utils";

/**
 * Custom hook for clarity calls settings data management
 * Follows the architecture guidelines: data fetching, actions, and derived state in one place
 */
export function useClarityCallsSettingsData() {
  // Data fetching
  const user = useQuery(api.core.users.queries.getCurrentUser, {});

  // Mutations
  const updateUser = useMutation(api.core.users.mutations.updateUser);
  const updateCallTime = useMutation(api.core.users.mutations.updateCallTime);

  // Local state for actions
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync local state with user data
  useEffect(() => {
    if (user?.callTime) {
      // This will be handled in the view component
    }
  }, [user?.callTime]);

  // Derived data
  const isCallsEnabled = user?.wantsClarityCalls ?? false;
  const hasCallTime = Boolean(user?.callTime && user.callTime.length > 0);

  // Action handlers
  const handleToggleCalls = useCallback(async (enabled: boolean): Promise<boolean> => {
    if (!user) return false;

    setIsUpdating(true);
    try {
      await updateUser({
        wantsClarityCalls: enabled,
      });
      return true;
    } catch (error) {
      console.error("Toggle clarity calls error:", error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [updateUser, user]);

  const handleSaveTime = useCallback(async (localCallTime: string): Promise<boolean> => {
    if (!user || !localCallTime) return false;

    setIsUpdating(true);
    try {
      // Build an ISO UTC timestamp for "today at HH:MM" in the user's IANA timezone
      const tz = user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: tz,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(new Date());
      const get = (t: Intl.DateTimeFormatPartTypes) => parts.find(p => p.type === t)?.value || "";
      const dateStr = `${get("year")}-${get("month")}-${get("day")}`;
      const utcISO = localFieldsToUtcISO(dateStr, localCallTime, tz);

      await updateCallTime({
        callTime: localCallTime,
        callTimeUtc: utcISO,
        timezone: tz,
      });

      return true;
    } catch (error) {
      console.error("Update call time error:", error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [updateCallTime, user]);

  // Return standardized interface
  return {
    // Data
    user,
    isCallsEnabled,
    hasCallTime,

    // Loading states
    isLoading: user === undefined,
    isUpdating,

    // Error state (could be expanded based on Convex error handling)
    error: null,

    // Actions
    actions: {
      handleToggleCalls,
      handleSaveTime,
    },
  };
}
