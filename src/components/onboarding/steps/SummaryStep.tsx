"use client";

import { useState } from "react";
import { useCompleteOnboarding, useEnsureUserRecord } from "@/lib/api";

interface SummaryStepProps {
  onBack: () => void;
  onComplete: () => void;
  data: {
    phone: string;
    callTime: string;
    wantsCallReminders: boolean;
  };
}

export default function SummaryStep({ onBack, onComplete, data }: SummaryStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const completeOnboarding = useCompleteOnboarding();
  const ensureUserRecord = useEnsureUserRecord();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // First ensure the user record exists
      await ensureUserRecord();

      // Then call the completeOnboarding function with the collected data
      await completeOnboarding({
        phone: data.phone, // This will be mapped to phoneNumber in the API layer
        callTime: data.callTime,
        wantsCallReminders: data.wantsCallReminders,
      });

      // Call the onComplete callback
      onComplete();
    } catch (err) {
      console.error("Error completing onboarding:", err);
      setError("An error occurred while completing onboarding. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format the call time for display (convert from 24-hour to 12-hour format)
  const formatCallTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Review Your Information</h2>
      <p className="mb-6 text-gray-600">
        Please review the information below before completing the onboarding process.
      </p>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="mb-2">
            <span className="font-medium">Phone:</span> {data.phone}
          </div>
          <div className="mb-2">
            <span className="font-medium">Preferred Call Time:</span> {formatCallTime(data.callTime)}
          </div>
          <div>
            <span className="font-medium">Call Reminders:</span> {data.wantsCallReminders ? "Yes" : "No"}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Complete Onboarding"}
        </button>
      </div>
    </div>
  );
}