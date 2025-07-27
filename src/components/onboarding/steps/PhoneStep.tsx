"use client";

import { useState } from "react";

interface PhoneStepProps {
  onNext: (phone: string) => void;
  initialValue?: string;
}

export default function PhoneStep({ onNext, initialValue = "" }: PhoneStepProps) {
  const [phone, setPhone] = useState(initialValue);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!phone) {
      setError("Phone number is required");
      return;
    }

    // Clear any previous errors
    setError("");

    // Call the onNext callback with the phone number
    onNext(phone);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
      <p className="mb-6 text-gray-600">
        Please provide your phone number so we can contact you.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="(123) 456-7890"
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Next
        </button>
      </form>
    </div>
  );
}