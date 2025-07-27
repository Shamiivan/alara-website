"use client";

import { useState } from "react";

interface CallTimeStepProps {
  onNext: (callTime: string) => void;
  onBack: () => void;
  initialValue?: string;
}

export default function CallTimeStep({ onNext, onBack, initialValue = "" }: CallTimeStepProps) {
  const [callTime, setCallTime] = useState(initialValue);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!callTime) {
      setError("Preferred call time is required");
      return;
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(callTime)) {
      setError("Please enter a valid time in HH:MM format (e.g., 09:00, 14:30)");
      return;
    }

    // Clear any previous errors
    setError("");

    // Call the onNext callback with the call time
    onNext(callTime);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Preferred Call Time</h2>
      <p className="mb-6 text-gray-600">
        Please select your preferred time for calls.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="callTime" className="block text-sm font-medium text-gray-700 mb-1">
            Preferred Time (24-hour format)
          </label>
          <input
            type="time"
            id="callTime"
            value={callTime}
            onChange={(e) => setCallTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Back
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
}