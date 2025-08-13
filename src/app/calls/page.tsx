"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

// Helper function to format date
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

export default function CallsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [selectedCallId, setSelectedCallId] = useState<Id<"calls"> | null>(null);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(true);

  // Fetch user calls
  const userCalls = useQuery(api.calls.getUserCalls, {}) || [];

  // Fetch conversation for selected call
  const selectedConversation = useQuery(
    api.calls.getConversationByCallId,
    selectedCallId ? { callId: selectedCallId } : "skip"
  );

  // Use the Convex action from calls_node.ts
  const initiateCall = useAction(api.calls_node.initiateCall);
  const fetchConversation = useAction(api.calls.fetchElevenLabsConversation);

  // Auto-refresh mechanism
  useEffect(() => {
    if (!isAutoRefreshing) return;

    // Find recently completed calls without transcripts
    const recentCompletedCallsWithoutTranscript = userCalls.filter(call =>
      call.status === 'completed' &&
      !call.hasTranscript &&
      // Only consider calls completed in the last 5 minutes
      call.completedAt &&
      Date.now() - call.completedAt < 5 * 60 * 1000
    );

    // If there's a recently completed call without transcript, fetch it
    if (recentCompletedCallsWithoutTranscript.length > 0) {
      const mostRecentCall = recentCompletedCallsWithoutTranscript.sort(
        (a, b) => (b.completedAt || 0) - (a.completedAt || 0)
      )[0];

      // Only fetch if we're not already loading something
      if (!isLoading) {
        handleFetchConversation(mostRecentCall._id);
        setSelectedCallId(mostRecentCall._id);
      }
    }

    // Set up polling for updates
    const intervalId = setInterval(() => {
      // This will trigger a re-render and re-fetch of userCalls
      // which will then trigger the useEffect again if needed
    }, 10000); // Check every 10 seconds

    return () => clearInterval(intervalId);
  }, [userCalls, isLoading, isAutoRefreshing]);

  const handleInitiateCall = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      console.log('Starting call...');

      // Call the Convex function instead of the API route
      const result = await initiateCall({
        toNumber: "+15146909416",
        userName: "Ivan"
      });

      console.log('Response:', result);

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: 'Failed to initiate call' });
      }
    } catch (error: unknown) {
      console.error('Call error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to initiate call'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchConversation = async (callId: Id<"calls">) => {
    try {
      setMessage(null);
      setIsLoading(true);

      await fetchConversation({ callId });

      setSelectedCallId(callId);
      setMessage({ type: 'success', text: 'Conversation fetched successfully' });
    } catch (error) {
      console.error('Error fetching conversation:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to fetch conversation'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Calls</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column: Call list and initiate call button */}
          <div className="md:col-span-1 space-y-6">
            <Card className="p-4">
              <h2 className="text-xl font-semibold mb-4">Make a Call</h2>
              <div className="text-gray-600 mb-4">
                <p>Click the button below to initiate a call to +5146909416</p>
              </div>

              <Button
                onClick={handleInitiateCall}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Calling...' : 'Start Call'}
              </Button>
            </Card>

            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Calls</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // This will trigger a re-fetch of the calls
                      // The useQuery hook will automatically refresh
                    }}
                    title="Refresh call list"
                  >
                    🔄
                  </Button>
                  <div className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      id="auto-refresh"
                      checked={isAutoRefreshing}
                      onChange={(e) => setIsAutoRefreshing(e.target.checked)}
                    />
                    <label htmlFor="auto-refresh" className="text-sm">
                      Auto-refresh
                    </label>
                  </div>
                </div>
              </div>
              {userCalls.length === 0 ? (
                <p className="text-gray-500">No calls yet</p>
              ) : (
                <div className="space-y-3">
                  {userCalls.map((call) => (
                    <div
                      key={call._id}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${selectedCallId === call._id
                        ? 'bg-blue-100 border border-blue-300'
                        : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      onClick={() => setSelectedCallId(call._id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{call.toNumber}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(call.initiatedAt)}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${call.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : call.status === 'failed' || call.status === 'no_answer'
                            ? 'bg-red-100 text-red-800'
                            : call.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                          {call.status}
                        </span>
                      </div>

                      {call.status === 'completed' && !call.hasTranscript && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFetchConversation(call._id);
                          }}
                        >
                          Fetch Conversation
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right column: Conversation display */}
          <div className="md:col-span-2">
            <Card className="p-4 h-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {selectedCallId ? 'Conversation' : 'Select a call to view conversation'}
                </h2>
                {selectedCallId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFetchConversation(selectedCallId)}
                    disabled={isLoading}
                    title="Refresh conversation"
                  >
                    🔄 {isLoading ? 'Refreshing...' : 'Refresh'}
                  </Button>
                )}
              </div>

              {message && (
                <div className={`p-4 mb-4 rounded-md ${message.type === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                  }`}>
                  {message.text}
                </div>
              )}

              {selectedCallId && !selectedConversation && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No conversation data available</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => handleFetchConversation(selectedCallId)}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Fetching...' : 'Fetch Conversation'}
                  </Button>
                </div>
              )}

              {selectedConversation && (
                <div className="space-y-4">
                  <div className="bg-gray-100 p-3 rounded-md">
                    <p className="text-sm text-gray-500">
                      Call started at: {formatDate(selectedConversation.metadata.startTimeUnixSecs * 1000)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Duration: {selectedConversation.metadata.callDurationSecs} seconds
                    </p>
                  </div>

                  <div className="space-y-3">
                    {selectedConversation.transcript.map((message, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg max-w-[80%] ${message.role === 'assistant'
                          ? 'bg-blue-100 ml-auto'
                          : 'bg-gray-100'
                          }`}
                      >
                        <p className="text-xs text-gray-500 mb-1">
                          {message.role === 'assistant' ? 'Assistant' : 'User'}
                          {' '}({message.timeInCallSecs}s)
                        </p>
                        <p>{message.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}