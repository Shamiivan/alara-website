"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { phoneNumbers } from "@elevenlabs/elevenlabs-js/api/resources/conversationalAi";

/**
 * Hook to get the current user
 * @returns The current user or null if not authenticated
 */
export function useCurrentUser() {
  return useQuery(api.user.getCurrentUser);
}

/**
 * Hook to check if the current user is onboarded
 * @returns Object containing isAuthenticated and isUserOnboarded flags
 */
export function useIsUserOnboarded() {
  return useQuery(api.user.isUserOnboarded);
}

/**
 * Hook to complete the onboarding process
 * Maps onboarding data to the existing schema fields
 */
export function useCompleteOnboarding() {
  const completeOnboarding = useMutation(api.user.completeOnboarding);

  /**
   * Complete the onboarding process
   * @param data Onboarding data from the form
   * @returns Promise that resolves when onboarding is complete
   */
  const handleCompleteOnboarding = async (data: {
    phone: string;
    wantsClarityCalls: boolean;
    callTime: string;
    wantsCallReminders: boolean;
  }) => {
    try {
      return await completeOnboarding({
        phoneNumber: data.phone, // Map phone to phoneNumber for the API
        callTime: data.callTime,
        wantsCallReminders: data.wantsCallReminders,
      });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      throw error;
    }
  };

  return handleCompleteOnboarding;
}

// Note: The updateUser mutation is not fully implemented in the backend yet
// We'll need to update the phone number as part of the onboarding process

/**
 * Hook to ensure the user record exists
 * This is useful after authentication to make sure the user has a record in the database
 */
export function useEnsureUserRecord() {
  return useMutation(api.user.ensureUserRecord);
}