import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import {
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { api } from "../../../convex/_generated/api";

const ClarityCallsSettingsCard = () => {
  const user = useQuery(api.core.users.queries.getCurrentUser, {});
  const updateUser = useMutation(api.core.users.mutations.updateUser);
  const updateCallTime = useMutation(api.core.users.mutations.updateCallTime);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localCallTime, setLocalCallTime] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Sync local state with user data
  useEffect(() => {
    if (user?.callTime) {
      setLocalCallTime(user.callTime);
    }
  }, [user?.callTime]);

  const handleToggleCalls = async (enabled: boolean) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      await updateUser({
        wantsClarityCalls: enabled,
      });
    } catch (err) {
      setError("Couldn't update your preferences right now.");
      console.error("Toggle clarity calls error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeChange = (newTime: string) => {
    setLocalCallTime(newTime);
  };

  const handleSaveTime = async () => {
    if (!user || !localCallTime) return;

    setIsLoading(true);
    setError(null);

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

      setIsEditing(false);
    } catch (err) {
      setError("Couldn't update your call time right now.");
      console.error("Update call time error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setLocalCallTime(user?.callTime || "");
    setIsEditing(false);
    setError(null);
  };

  const formatTimeDisplay = (time: string | undefined, timezone?: string) => {
    if (!time) return "";

    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    const timeString = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const timezoneAbbr = timezone
      ? new Date().toLocaleTimeString('en-US', {
        timeZoneName: 'short',
        timeZone: timezone,
      }).split(' ').pop()
      : 'Local';

    return `${timeString} ${timezoneAbbr}`;
  };

  // Loading state
  if (user === undefined) {
    return (
      <div className="bg-white rounded-xl border border-slate-50 p-6 hover:border-slate-100 transition-all duration-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg transition-colors duration-200">
            <Phone className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-slate-900">Daily Clarity Calls</h3>
            <p className="text-sm text-slate-600">
              Get a daily call to plan your day and stay focused
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading your settings…</span>
          </div>
        </div>
      </div>
    );
  }

  // Not signed in state
  if (user === null) {
    return (
      <div className="bg-white rounded-xl border border-slate-50 p-6 hover:border-slate-100 transition-all duration-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg transition-colors duration-200">
            <Phone className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-slate-900">Daily Clarity Calls</h3>
            <p className="text-sm text-slate-600">
              Please sign in to manage your call preferences
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isCallsEnabled = user.wantsClarityCalls ?? false;
  const hasCallTime = user.callTime && user.callTime.length > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-50 p-6 hover:border-slate-100 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg transition-colors duration-200">
          <Phone className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-medium text-slate-900">Daily Clarity Calls</h3>
          <p className="text-sm text-slate-600">
            Get a daily call to plan your day and stay focused
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-100 mb-4">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-sm text-red-700 hover:text-red-800 underline mt-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="font-medium text-slate-900">Enable daily calls</p>
            <p className="text-sm text-slate-600">
              We'll call you each day to help plan and prioritize
            </p>
          </div>
        </div>
        <button
          onClick={() => handleToggleCalls(!isCallsEnabled)}
          disabled={isLoading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${isCallsEnabled ? 'bg-blue-600' : 'bg-slate-200'
            }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${isCallsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
          />
        </button>
      </div>

      {/* Time Configuration - only show if calls are enabled */}
      {isCallsEnabled && (
        <div className="border-t border-slate-100 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-slate-500" />
            <h4 className="text-sm font-medium text-slate-900">Call time</h4>
          </div>

          {!isEditing ? (
            // Display Mode
            <div className="flex items-center justify-between">
              <div>
                {hasCallTime ? (
                  <div>
                    <p className="text-sm text-slate-900">
                      Daily calls at {formatTimeDisplay(user.callTime, user.timezone)}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      We'll call you at this time each day
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-slate-600">No time set</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Choose when you'd like your daily call
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {hasCallTime ? 'Change' : 'Set time'}
              </button>
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-4">
              <div>
                <label htmlFor="call-time" className="block text-sm font-medium text-slate-700 mb-2">
                  Call time
                </label>
                <input
                  type="time"
                  id="call-time"
                  value={localCallTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Choose when you'd like your daily clarity call
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveTime}
                  disabled={isLoading || !localCallTime}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Summary */}
      {isCallsEnabled && hasCallTime && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Daily clarity calls enabled at {formatTimeDisplay(user.callTime!, user.timezone)}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Your next call is scheduled for tomorrow
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer Reassurance */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-500">
          You can change these settings anytime — calls stay helpful, never pushy
        </p>
      </div>
    </div>
  );
};

export default ClarityCallsSettingsCard;