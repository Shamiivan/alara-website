
// app/settings/CalendarConnect.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useState, useMemo } from "react";

export default function CalendarConnect() {
  // 1) Always call hooks in the same order
  const user = useQuery(api.user.getCurrentUser);

  // 2) Never wrap hooks in conditionals; pass `undefined` to skip until ready
  const calendarStatus = useQuery(api.calendar.isCalendarConnected, user ? { userId: user._id } as { userId: Id<"users"> } : "skip")


  // const disconnect = useMutation(api.calendar.disconnect);
  const [busy, setBusy] = useState(false);

  // 3) Derive stable UI state
  const connected = Boolean(calendarStatus?.connected);
  const email = calendarStatus?.email ?? null;
  const connectLabel = useMemo(
    () => (connected ? "Reconnect" : "Connect Google Calendar"),
    [connected]
  );

  const handleConnect = () => {
    window.location.href = "/api/gcal/auth";
  };

  const handleDisconnect = async () => {
    setBusy(true);
    try {
      // await disconnect({});
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #E5E7EB",
        borderRadius: "10px",
        padding: "16px",
        background: "#FFFFFF",
        maxWidth: 520,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Google Calendar</h3>
          <p style={{ marginTop: 6, color: "#6B7280", fontSize: 14 }}>
            Read-only connection. We only request <code>calendar.readonly</code>.
          </p>
        </div>
        <div>
          {connected ? (
            <span style={{ fontSize: 13, color: "#10B981" }}>
              Connected{email ? ` as ${email}` : ""}
            </span>
          ) : (
            <span style={{ fontSize: 13, color: "#EF4444" }}>Not connected</span>
          )}
        </div>
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <button
          onClick={handleConnect}
          style={{
            height: 40,
            padding: "0 16px",
            borderRadius: 8,
            background: connected ? "#F9FAFB" : "#4F46E5",
            color: connected ? "#111827" : "#FFFFFF",
            border: connected ? "1px solid #E5E7EB" : "none",
            cursor: "pointer",
          }}
        >
          {connectLabel}
        </button>

        {connected && (
          <button
            onClick={handleDisconnect}
            disabled={busy}
            style={{
              height: 40,
              padding: "0 16px",
              borderRadius: 8,
              border: "1px solid #EF4444",
              background: "#FEF2F2",
              color: "#B91C1C",
              cursor: busy ? "not-allowed" : "pointer",
              opacity: busy ? 0.6 : 1,
            }}
          >
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
}
