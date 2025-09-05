"use client";

import { useState, useEffect, useMemo, useCallback, Fragment } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

// Define proper types to match the actual data structure
interface CallType {
  _id: Id<"calls">;
  _creationTime: number;
  purpose?: string;
  elevenLabsCallId?: string;
  errorMessage?: string;
  agentId?: string;
  conversationId?: string;
  status: "in_progress" | "completed" | "failed" | "no_answer";
  userId: Id<"users">;
  initiatedAt: number;
  completedAt?: number;
  duration?: number;
  toNumber?: string; // Make this optional as it might not exist in all call objects
}

interface ConversationType {
  _id: Id<"conversations">;
  _creationTime: number;
  userId?: Id<"users">;
  elevenLabsCallId?: string;
  callId?: Id<"calls">;
  createdAt: number;
  conversationId: string;
  transcript: Array<{
    role: string;
    message: string;
    timeInCallSecs: number;
  }>;
  metadata: {
    startTimeUnixSecs: number;
    callDurationSecs: number;
  };
}
import { TOKENS } from "@/components/tokens";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Phone, RefreshCw, CheckCircle2, AlertTriangle, Clock, Download, Sparkles, Mic, User, MessageSquare } from "lucide-react";

/**
 * CallsPage – Lovable, intuitive, and encouraging.
 * Kevin Hale principles applied:
 * 1) Emotional hook: friendly micro‑copy, tiny sparkle moment on first call.
 * 2) Remove friction: clear primary action, large hit areas, saved preferences, smart auto-refresh.
 * 3) Guide next step: inline hints ("you can change this later"), empty states, status chips.
 * 4) Feel cared for: accessible labels, keyboard shortcuts, reduced motion aware.
 */

// Helper: format timestamp -> local string
const fmt = (ts?: number) => (ts ? new Date(ts).toLocaleString() : "—");

// Status → styles
const statusChip = (s: string) => {
  switch (s) {
    case "completed":
      return { bg: TOKENS.successBg || "rgba(16,185,129,.12)", fg: TOKENS.success || "#10B981", icon: CheckCircle2 };
    case "in_progress":
      return { bg: TOKENS.infoBg || "rgba(37,99,235,.10)", fg: TOKENS.info || "#2563EB", icon: Clock };
    case "failed":
    case "no_answer":
      return { bg: TOKENS.warnBg || "rgba(245,158,11,.12)", fg: TOKENS.warn || "#F59E0B", icon: AlertTriangle };
    default:
      return { bg: TOKENS.accent, fg: TOKENS.text, icon: Clock };
  }
};

export default function CallsPage() {
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<null | { type: "success" | "error"; text: string }>(null);
  const [selectedCallId, setSelectedCallId] = useState<Id<"calls"> | null>(null);
  const [isAutoRefreshing, setAutoRefreshing] = useState(true);
  const [toNumber, setToNumber] = useState("+15146909416");

  // Data
  const user = useQuery(api.user.getCurrentUser);
  const callsRaw = useQuery(api.calls.getUserCalls, {});
  const calls = useMemo(() => (callsRaw ?? []) as CallType[], [callsRaw]);

  const selectedConversation = useQuery(
    api.conversation.getConversationByCallId,
    selectedCallId ? { callId: selectedCallId } : "skip"
  ) as ConversationType | null;

  // Actions
  const initiateCall = useAction(api.calls_node.initiateCall);
  const fetchConversation = useAction(api.calls.fetchElevenLabsConversation);

  // Effects: soft auto-refresh for just-completed calls without transcripts
  useEffect(() => {
    if (!isAutoRefreshing || !calls?.length) return;
    const recent = calls
      .filter(c => c.status === "completed" && !c.conversationId && c.completedAt && Date.now() - c.completedAt < 5 * 60 * 1000)
      .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))[0];
    if (recent && !isLoading) {
      void handleFetchConversation(recent._id);
      setSelectedCallId(recent._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calls, isAutoRefreshing, isLoading]);

  // Keyboard shortcut: r to refresh selected conversation
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if ((e.key === "r" || e.key === "R") && selectedCallId) {
        e.preventDefault();
        void handleFetchConversation(selectedCallId);
      }
    };

    // Use properly typed event listener
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCallId]);

  const handleStartCall = useCallback(async () => {
    if (!user?._id) {
      setToast({ type: "error", text: "Please sign in to start a call." });
      return;
    }
    try {
      setIsLoading(true);
      const res = await initiateCall({ userId: user._id, toNumber, userName: user.name ?? "Friend" });
      // Convex action returns a typed object with success/message; we handle defensively
      if (res && typeof res === "object" && "success" in res && (res as { success: boolean }).success) {
        setToast({ type: "success", text: (res as { message?: string }).message ?? "Call initiated. You got this!" });
      } else {
        setToast({ type: "error", text: "Couldn’t start the call. Try again." });
      }
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : "Call failed to start.";
      setToast({ type: "error", text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  }, [user, toNumber, initiateCall]);

  const handleFetchConversation = useCallback(async (callId: Id<"calls">) => {
    try {
      setIsLoading(true);
      setToast(null);
      await fetchConversation({ callId });
      setToast({ type: "success", text: "Conversation updated." });
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : "Couldn't fetch conversation.";
      setToast({ type: "error", text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  }, [fetchConversation]);

  // Add state to track animations and user interactions
  const [animateIn, setAnimateIn] = useState(false);
  const [sparkleCall, setSparkleCall] = useState(false);

  // Enable animations after component mounts
  useEffect(() => {
    const timer = setTimeout(() => setAnimateIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Add a fun animation when starting a call
  const handleCallButtonClick = useCallback(() => {
    setSparkleCall(true);
    setTimeout(() => setSparkleCall(false), 1200);
    handleStartCall();
  }, [handleStartCall]);

  return (
    <TooltipProvider>
      <div className="min-h-screen px-4 py-4 sm:p-6" style={{ background: TOKENS.bg }}>
        <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
          {/* Header with staggered animation */}
          <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div
              style={{
                opacity: animateIn ? 1 : 0,
                transform: animateIn ? 'translateY(0)' : 'translateY(10px)',
                transition: 'opacity 0.4s ease, transform 0.4s ease'
              }}
            >
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: TOKENS.text }}>Calls</h1>
                <Phone size={20} className="text-indigo-500" style={{ opacity: 0.8 }} />
              </div>
              <p className="mt-1 text-sm sm:text-base" style={{ color: TOKENS.subtext }}>
                You&apos;re one call away from clarity. We&apos;ll handle the follow‑through — you just press the button.
              </p>
            </div>

            {toast && (
              <div
                role="status"
                className={cn(
                  "rounded-md px-3 py-2 text-sm shadow-sm border",
                  "transition-all duration-300 ease-in-out",
                  toast.type === "success" ? "pop-in" : "wiggle-effect"
                )}
                style={{
                  borderColor: TOKENS.border,
                  background: toast.type === "success" ? (TOKENS.successBg) : (TOKENS.warnBg),
                  color: toast.type === "success" ? (TOKENS.text) : (TOKENS.text),
                }}
              >
                {toast.text}
              </div>
            )}
          </header>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3"
            style={{
              opacity: animateIn ? 1 : 0,
              transition: 'opacity 0.5s ease 0.2s'
            }}
          >
            {/* Left: Make a Call + Recent Calls */}
            <section className="space-y-6 md:col-span-1">
              {/* Make a Call */}
              <Card
                className="p-4"
                style={{ background: TOKENS.cardBg, borderColor: TOKENS.border, boxShadow: TOKENS.shadow }}
                aria-labelledby="make-call"
              >
                <div className="flex items-center justify-between">
                  <h2 id="make-call" className="text-xl font-semibold" style={{ color: TOKENS.text }}>
                    Make a call
                  </h2>
                  <Badge variant="outline" className="text-[11px]" style={{ borderColor: TOKENS.border, color: TOKENS.subtext }}>
                    You can change this later
                  </Badge>
                </div>

                <p className="mt-2 text-sm" style={{ color: TOKENS.subtext }}>
                  Quick chat → transcript → gentle nudge. That&apos;s the loop.
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <Input
                    aria-label="Phone number to call"
                    value={toNumber}
                    onChange={(e) => setToNumber(e.target.value)}
                    placeholder="Enter phone number"
                    className="flex-1"
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className={cn(
                          "min-w-[130px] relative overflow-hidden transition-all",
                          sparkleCall ? "scale-105" : "",
                          "hover-lift"
                        )}
                        onClick={handleCallButtonClick}
                        disabled={isLoading}
                        style={{
                          transform: sparkleCall ? 'scale(1.05)' : 'scale(1)',
                          transition: 'transform 0.2s ease-out',
                        }}
                      >
                        {/* Sparkle animation overlay */}
                        {sparkleCall && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <Sparkles
                              className="h-5 w-5 text-white"
                              style={{
                                animation: 'pulse 0.6s ease-in-out infinite alternate',
                                position: 'absolute',
                                left: '50%',
                                top: '50%',
                                transform: 'translate(-50%, -50%) scale(1.2)',
                              }}
                            />
                          </span>
                        )}

                        <Phone className="mr-2 h-4 w-4" />
                        <span className={sparkleCall ? "opacity-80" : ""}>
                          {isLoading ? "Calling…" : "Start Call"}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>We&apos;ll ring you and keep notes for you ✨</TooltipContent>
                  </Tooltip>
                </div>

                <p className="mt-3 text-xs" style={{ color: TOKENS.subtext }}>
                  Tip: Press <kbd className="rounded border px-1" style={{ borderColor: TOKENS.border }}>R</kbd> to refresh a selected conversation.
                </p>
              </Card>

              {/* Recent Calls */}
              <Card className="p-4" style={{ background: TOKENS.cardBg, borderColor: TOKENS.border, boxShadow: TOKENS.shadow }}>
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h2 className="text-xl font-semibold" style={{ color: TOKENS.text }}>Recent calls</h2>
                  <div className="flex items-center gap-2">
                    <label className="flex cursor-pointer items-center gap-2 text-sm" style={{ color: TOKENS.subtext }}>
                      <input
                        type="checkbox"
                        className="accent-current"
                        checked={isAutoRefreshing}
                        onChange={(e) => setAutoRefreshing(e.target.checked)}
                        aria-label="Auto refresh recent calls"
                      />
                      Auto‑refresh
                    </label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" aria-label="Refresh list">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>List updates automatically when things finish</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {!calls?.length ? (
                  <EmptyCalls />
                ) : (
                  <ul className="space-y-2">
                    {calls.map((c) => (
                      <li key={c._id}>
                        <button
                          onClick={() => setSelectedCallId(c._id)}
                          className={cn(
                            "w-full rounded-[10px] border p-3 text-left transition-all",
                            selectedCallId === c._id ? "ring-2" : "hover:-translate-y-[2px]"
                          )}
                          style={{ borderColor: selectedCallId === c._id ? TOKENS.primary : TOKENS.border, background: TOKENS.bg }}
                          aria-current={selectedCallId === c._id ? "true" : undefined}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="truncate font-medium" style={{ color: TOKENS.text }}>{c.toNumber}</span>
                                <Status s={c.status} />
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs" style={{ color: TOKENS.subtext }}>
                                <span>Started: {fmt(c.initiatedAt)}</span>
                                {c.duration ? (
                                  <span className="flex items-center">
                                    <span className="mx-1 w-1 h-1 rounded-full bg-gray-300"></span>
                                    <Clock className="mr-1 h-3 w-3" />
                                    {Math.round((c.duration ?? 0) / 1000)}s
                                  </span>
                                ) : null}
                                {c.errorMessage && (
                                  <span className="flex items-center text-amber-600">
                                    <span className="mx-1 w-1 h-1 rounded-full bg-gray-300"></span>
                                    <AlertTriangle className="mr-1 h-3 w-3" />
                                    <span className="truncate">{c.errorMessage}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                            {c.status === "completed" && !c.conversationId && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleFetchConversation(c._id);
                                  setSelectedCallId(c._id);
                                }}
                              >
                                <Download className="mr-2 h-4 w-4" /> Fetch transcript
                              </Button>
                            )}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </section>

            {/* Right: Conversation */}
            <section className="md:col-span-2">
              <Card className="flex h-full min-h-[480px] flex-col p-4" style={{ background: TOKENS.cardBg, borderColor: TOKENS.border, boxShadow: TOKENS.shadow }}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xl font-semibold" style={{ color: TOKENS.text }}>
                    {selectedCallId ? "Conversation" : "Select a call to view conversation"}
                  </h2>
                  {selectedCallId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => selectedCallId && handleFetchConversation(selectedCallId)}
                      disabled={isLoading}
                      aria-label="Refresh conversation"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> {isLoading ? "Refreshing…" : "Refresh"}
                    </Button>
                  )}
                </div>

                {/* Metadata + transcript */}
                {!selectedCallId ? (
                  <EmptyConversation />
                ) : !selectedConversation ? (
                  <Loader label="Fetching conversation…" />
                ) : (
                  <Fragment>
                    <div className="mb-3 rounded-[10px] border p-3" style={{ borderColor: TOKENS.border, background: TOKENS.bg }}>
                      <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: TOKENS.subtext }}>
                        <span>Started: {fmt(selectedConversation.metadata.startTimeUnixSecs * 1000)}</span>
                        <span>· Duration: {selectedConversation.metadata.callDurationSecs}s</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                      {selectedConversation.transcript.map((m, i) => (
                        <div
                          key={i}
                          className={cn(
                            "max-w-[80%] rounded-[12px] border p-3",
                            m.role === "assistant" ? "ml-auto" : "",
                            "hover-lift transition-all duration-150"
                          )}
                          style={{
                            borderColor: TOKENS.border,
                            background: m.role === "assistant" ? (TOKENS.accent) : TOKENS.bg,
                            opacity: animateIn ? 1 : 0,
                            transform: animateIn ? 'translateY(0)' : 'translateY(8px)',
                            transition: `opacity 0.4s ease ${i * 100 + 300}ms, transform 0.4s ease ${i * 100 + 300}ms`,
                          }}
                        >
                          <div className="mb-1 flex items-center gap-2 text-xs" style={{ color: TOKENS.subtext }}>
                            {m.role === "assistant" ? <Sparkles className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                            <span className="font-medium" style={{ color: TOKENS.text }}>{m.role === "assistant" ? "Assistant" : "You"}</span>
                            <span>· {m.timeInCallSecs}s</span>
                          </div>
                          <p className="whitespace-pre-wrap leading-relaxed" style={{ color: TOKENS.text }}>{m.message}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-[10px] border p-3 text-sm" style={{ borderColor: TOKENS.border, background: TOKENS.bg, color: TOKENS.subtext }}>
                      <MessageSquare className="mr-2 inline h-4 w-4" />
                      We&apos;ll keep improving transcripts. Spot a mistake? It helps to speak close to the mic <Mic className="mb-0.5 inline h-4 w-4" />
                    </div>
                  </Fragment>
                )}
              </Card>
            </section>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function Status({ s }: { s: string }) {
  const conf = statusChip(s);
  const Icon = conf.icon;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
      style={{ background: conf.bg, color: conf.fg, border: `1px solid ${conf.fg}22` }}
    >
      <Icon className="h-3.5 w-3.5" /> {s.replace("_", " ")}
    </span>
  );
}

function EmptyCalls() {
  // Add subtle animation to empty state
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="rounded-[10px] border p-6 text-center hover-lift"
      style={{
        borderColor: TOKENS.border,
        background: TOKENS.bg,
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative inline-block">
        <Phone
          className={cn("mx-auto h-6 w-6", hovered ? "text-indigo-500 float-effect" : "")}
          style={{ transition: 'color 0.3s ease' }}
        />
        {hovered && (
          <span
            className="absolute -top-1 -right-1 h-2 w-2 bg-indigo-500 rounded-full pulse-subtle"
            aria-hidden="true"
          />
        )}
      </div>
      <p className="mt-2 font-medium" style={{ color: TOKENS.text }}>No calls yet</p>
      <p className="mt-1 text-sm" style={{ color: TOKENS.subtext }}>
        Your first call is a tiny step — and it counts. We&apos;ll cheer you on.
      </p>
    </div>
  );
}

function EmptyConversation() {
  // Add state for interactive elements
  const [animate, setAnimate] = useState(false);

  // Trigger animation periodically for a subtle pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimate(true);
      setTimeout(() => setAnimate(false), 1000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="flex h-full min-h-[360px] items-center justify-center rounded-[10px] border"
      style={{
        borderColor: TOKENS.border,
        background: TOKENS.bg,
        transition: 'all 0.3s ease'
      }}
    >
      <div className="text-center p-4 sm:p-6 max-w-sm">
        <div className="relative inline-block mb-2">
          <Sparkles
            className={cn(
              "mx-auto h-6 w-6 text-indigo-500",
              animate ? "scale-110" : ""
            )}
            style={{
              transition: 'transform 0.5s ease',
              transform: animate ? 'scale(1.2)' : 'scale(1)'
            }}
          />
          <span className="absolute top-0 right-0 h-2 w-2 bg-indigo-400 rounded-full pulse-subtle" />
        </div>
        <p className="mt-2 font-medium text-lg" style={{ color: TOKENS.text }}>
          Pick a call to see the conversation
        </p>
        <p className="mt-2 text-sm" style={{ color: TOKENS.subtext }}>
          We&apos;ll fetch transcripts automatically when they&apos;re ready.
        </p>
      </div>
    </div>
  );
}

function Loader({ label = "Loading…" }: { label?: string }) {
  // More engaging loader with subtle animation
  return (
    <div className="flex h-full min-h-[360px] items-center justify-center">
      <div className="rounded-[12px] border p-5 shadow-sm"
        style={{
          borderColor: TOKENS.border,
          background: TOKENS.bg,
          animation: 'pulse 2s infinite ease-in-out'
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="h-5 w-5 rounded-full bg-indigo-400/40"
            style={{ animation: 'pulse 1.5s infinite ease-in-out' }}
          />
          <div className="h-4 w-48 rounded bg-black/10"
            style={{ animation: 'pulse 1.5s infinite ease-in-out' }}
          />
        </div>
        <div className="mt-2 h-3 w-72 rounded bg-black/10"
          style={{ animation: 'pulse 1.5s infinite ease-in-out 0.2s' }}
        />
        <div className="mt-2 h-3 w-64 rounded bg-black/10"
          style={{ animation: 'pulse 1.5s infinite ease-in-out 0.4s' }}
        />
        <div className="mt-2 h-3 w-32 rounded bg-black/10"
          style={{ animation: 'pulse 1.5s infinite ease-in-out 0.6s' }}
        />
        <p className="sr-only">{label}</p>
      </div>
    </div>
  );
}
