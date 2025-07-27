"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function CallsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleInitiateCall = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      console.log('Starting call...');

      const response = await fetch('/api/calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      console.log('Response:', result);

      if (response.ok) {
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.error || 'Unknown error' });
      }
    } catch (error: any) {
      console.error('Call error:', error);
      setMessage({ type: 'error', text: 'Failed to initiate call' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">Call Ivan</h1>

        <div className="text-gray-600">
          <p>Click the button below to initiate a call to +5146909416</p>
        </div>

        <Button
          onClick={handleInitiateCall}
          disabled={isLoading}
          className="px-8 py-4 text-lg"
          size="lg"
        >
          {isLoading ? 'Calling...' : 'Start Call'}
        </Button>

        {message && (
          <div className={`p-4 rounded-md max-w-md mx-auto ${message.type === 'success'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
            }`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}