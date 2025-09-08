import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

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
      // Create UTC time string for today at the specified local time
      const now = new Date();
      const [hours, minutes] = localCallTime.split(':').map(Number);
      const localDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
      const utcTimeString = localDate.toISOString();

      await updateCallTime({
        callTime: localCallTime,
        callTimeUtc: utcTimeString,
        timezone: user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
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