"use client";

import { useState } from "react";

interface ClarityCallProps {
  onNext: (wantsClarityCalls: boolean) => void;
  onBack: () => void;
  initialValue?: boolean;
}

export default function ClarityCalls({ onNext, onBack, initialValue = false }: ClarityCallProps) {
  const [wantsClarityCalls, setWantsClarityCalls] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Call the onNext callback with the reminders preference
    onNext(wantsClarityCalls);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4"> Clarity Calls</h2>
      <p className="mb-6 text-gray-600">
        Would you like to receive calls to checking before scheduled task?
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="wantsClarityCalls"
              checked={wantsClarityCalls}
              onChange={(e) => setWantsClarityCalls(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="wantsClarityCalls" className="ml-2 block text-sm text-gray-900">
              Yes, send me call before scheduled calls
            </label>
          </div>
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