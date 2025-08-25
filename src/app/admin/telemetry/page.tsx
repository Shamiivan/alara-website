"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Id } from "../../../../convex/_generated/dataModel";

// Key events to track for counters
const IMPORTANT_EVENTS = ["oauth_success", "freebusy_ok", "events_created", "error"];

export default function TelemetryPage() {
  const [eventFilter, setEventFilter] = useState("");
  const [userFilter, setUserFilter] = useState<Id<"users"> | null>(null);
  const limit = 200;

  // Reset filters
  const resetFilters = () => {
    setEventFilter("");
    setUserFilter(null);
  };

  // Fetch telemetry data with filters
  const telemetryData = useQuery(api.telemetry.latest, {
    limit,
    event: eventFilter || undefined,
    userId: userFilter || undefined,
  });

  // Fetch event counts for the past 24 hours
  const eventCounts = useQuery(api.telemetry.getCountsByEvent, {
    events: IMPORTANT_EVENTS,
    hours: 24,
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Telemetry Dashboard</h2>
      </div>

      {/* Quick Counters */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Quick Counters (Past 24h)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {IMPORTANT_EVENTS.map((event) => (
            <QuickCounter
              key={event}
              event={event}
              count={eventCounts?.[event] || 0}
              onFilter={() => setEventFilter(event)}
            />
          ))}
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-8">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Event Name</label>
            <Input
              placeholder="Filter by event name"
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={resetFilters}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Reset Filters
            </Button>
          </div>
        </div>
        {userFilter && (
          <div className="mt-4 p-2 bg-slate-100 rounded-md flex justify-between items-center">
            <div>
              <span className="text-sm font-medium">Filtered by User ID: </span>
              <Badge variant="outline" className="ml-2">{userFilter}</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUserFilter(null)}
            >
              Clear
            </Button>
          </div>
        )}
      </Card>

      {/* Telemetry Events Table */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          Events
          {telemetryData && (
            <Badge variant="outline" className="ml-2">
              {telemetryData.length} results
            </Badge>
          )}
        </h3>

        {telemetryData && telemetryData.length > 0 ? (
          <EventsTable
            events={telemetryData}
            onUserFilter={(userId) => setUserFilter(userId)}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            {telemetryData ? "No events found" : "Loading events..."}
          </div>
        )}
      </Card>
    </div>
  );
}

// Quick Counter Component
function QuickCounter({
  event,
  count,
  onFilter
}: {
  event: string;
  count: number;
  onFilter: () => void
}) {
  return (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onFilter}
    >
      <div className="text-xs uppercase text-gray-500 mb-1">{event}</div>
      <div className="text-3xl font-bold">{count}</div>
    </Card>
  );
}

// Events Table Component
function EventsTable({
  events,
  onUserFilter
}: {
  events: Array<{
    _id: string;
    createdAt: number;
    event: string;
    userId: Id<"users">;
    context?: Record<string, unknown>;
  }>;
  onUserFilter: (userId: Id<"users">) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Time</th>
            <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Event</th>
            <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">User</th>
            <th className="text-left px-4 py-2 text-sm font-medium text-gray-500">Context</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event._id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-3 text-sm">
                {new Date(event.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <Badge>{event.event}</Badge>
              </td>
              <td className="px-4 py-3">
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto"
                  onClick={() => onUserFilter(event.userId)}
                >
                  {truncateId(event.userId)}
                </Button>
              </td>
              <td className="px-4 py-3 text-sm">
                {event.context ? (
                  <pre className="text-xs overflow-x-auto max-w-xs">
                    {JSON.stringify(event.context, null, 2)}
                  </pre>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Helper to truncate long IDs for display
function truncateId(id: string): string {
  if (!id) return "";
  if (id.length <= 12) return id;
  return `${id.substring(0, 6)}...${id.substring(id.length - 6)}`;
}