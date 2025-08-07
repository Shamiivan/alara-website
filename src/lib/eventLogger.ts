"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

// Event data interface
export interface EventData {
  category: "auth" | "onboarding" | "payment" | "calls" | "api" | "system";
  message: string;
  details?: Record<string, unknown>;
  url?: string;
  showToUser?: boolean;
  userMessage?: string;
}

// Convex mutation type (flexible to match actual Convex types)
type ConvexMutation = (args: {
  category: string;
  message: string;
  details?: unknown;
  url?: string;
  userAgent?: string;
  sessionId?: string;
  source: string;
  showToUser?: boolean;
  userMessage?: string;
}) => Promise<unknown>;

// Environment checks
const isLoggingEnabled = () => {
  return process.env.NEXT_PUBLIC_ENABLE_EVENT_LOGGING === "true";
};

const isClientLoggingEnabled = () => {
  return process.env.NEXT_PUBLIC_ENABLE_CLIENT_LOGGING === "true";
};

const getLogLevel = (): "debug" | "info" | "warn" | "error" => {
  const level = process.env.NEXT_PUBLIC_LOG_LEVEL as "debug" | "info" | "warn" | "error" | undefined;
  return level || "info";
};

// Simple console logger with levels
class ConsoleLogger {
  private shouldLog(level: string): boolean {
    // Don't log in production unless explicitly enabled
    if (process.env.NODE_ENV === "production" && !isLoggingEnabled()) {
      return false;
    }

    const currentLevel = getLogLevel();
    const levels = ["debug", "info", "warn", "error"];
    const currentIndex = levels.indexOf(currentLevel);
    const messageIndex = levels.indexOf(level);
    return messageIndex >= currentIndex;
  }

  debug(message: string, data?: unknown) {
    if (this.shouldLog("debug")) {
      console.log(`🐛 [DEBUG] ${message}`, data || "");
    }
  }

  info(message: string, data?: unknown) {
    if (this.shouldLog("info")) {
      console.info(`ℹ️ [INFO] ${message}`, data || "");
    }
  }

  warn(message: string, data?: unknown) {
    if (this.shouldLog("warn")) {
      console.warn(`⚠️ [WARN] ${message}`, data || "");
    }
  }

  error(message: string, data?: unknown) {
    if (this.shouldLog("error")) {
      console.error(`❌ [ERROR] ${message}`, data || "");
    }
  }
}

// Create global console logger instance
export const logger = new ConsoleLogger();

// Event logger class for database logging
export class EventLogger {
  private logErrorMutation: ConvexMutation | null;

  constructor() {
    // This will be set from React components that use the hook
    this.logErrorMutation = null;
  }

  setMutation(mutation: ConvexMutation) {
    this.logErrorMutation = mutation;
  }

  private getRequestContext() {
    if (typeof window !== "undefined") {
      return {
        url: window.location.href,
        userAgent: navigator.userAgent,
        sessionId: this.getSessionId(),
      };
    }
    return {};
  }

  private getSessionId(): string {
    if (typeof window !== "undefined") {
      let sessionId = localStorage.getItem("session_id");
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem("session_id", sessionId);
      }
      return sessionId;
    }
    return "";
  }

  // Log events to console (all events)
  logEvent(level: "debug" | "info" | "warn" | "error", data: EventData) {
    // In production, only log errors to database, skip console logging unless explicitly enabled
    if (process.env.NODE_ENV === "production") {
      if (level === "error") {
        this.logErrorToDatabase(data);
      }
      return;
    }

    // Development logging
    if (!isLoggingEnabled() || !isClientLoggingEnabled()) return;

    const message = `[${data.category.toUpperCase()}] ${data.message}`;

    switch (level) {
      case "debug":
        logger.debug(message, data.details);
        break;
      case "info":
        logger.info(message, data.details);
        break;
      case "warn":
        logger.warn(message, data.details);
        break;
      case "error":
        logger.error(message, data.details);
        // Only errors go to database
        this.logErrorToDatabase(data);
        break;
    }
  }

  // Log errors to database
  private async logErrorToDatabase(data: EventData) {
    if (!this.logErrorMutation) {
      // Only warn in development
      if (process.env.NODE_ENV === "development") {
        logger.warn("Error mutation not available, cannot log to database");
      }
      return;
    }

    try {
      const context = this.getRequestContext();
      await this.logErrorMutation({
        category: data.category,
        message: data.message,
        details: data.details,
        url: context.url,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        source: "client",
        showToUser: data.showToUser,
        userMessage: data.userMessage,
      });

      // Only log success in development
      if (process.env.NODE_ENV === "development") {
        logger.debug("Error logged to database successfully");
      }
    } catch (error) {
      // Only log to console in development
      if (process.env.NODE_ENV === "development") {
        logger.error("Failed to log error to database:", error);
      }
    }
  }

  // Convenience methods
  debug(category: EventData["category"], message: string, details?: Record<string, unknown>) {
    this.logEvent("debug", { category, message, details });
  }

  info(category: EventData["category"], message: string, details?: Record<string, unknown>) {
    this.logEvent("info", { category, message, details });
  }

  warn(category: EventData["category"], message: string, details?: Record<string, unknown>) {
    this.logEvent("warn", { category, message, details });
  }

  error(category: EventData["category"], message: string, details?: Record<string, unknown>, showToUser?: boolean, userMessage?: string) {
    this.logEvent("error", {
      category,
      message,
      details,
      showToUser,
      userMessage
    });
  }

  // Log JavaScript errors
  logJSError(error: Error, category: EventData["category"] = "system", additionalContext?: Record<string, unknown>) {
    this.error(
      category,
      error.message,
      {
        name: error.name,
        stack: error.stack,
        context: additionalContext,
      },
      true,
      "Something went wrong. Please try again."
    );
  }

  // Log user actions
  logUserAction(action: string, category: EventData["category"], details?: Record<string, unknown>) {
    this.info(category, `User action: ${action}`, details);
  }

  // Log API calls
  logApiCall(url: string, method: string, status?: number, error?: unknown) {
    if (error || (status && status >= 400)) {
      this.error("api", `API call failed: ${method} ${url}`, { status, error: error instanceof Error ? error.message : String(error) });
    } else {
      this.info("api", `API call: ${method} ${url}`, { status });
    }
  }
}

// Create singleton instance
export const eventLogger = new EventLogger();

// React hook for using event logger with Convex mutation
export const useEventLogger = () => {
  const logErrorMutation = useMutation(api.events.logError);

  // Set the mutation on the logger instance
  eventLogger.setMutation(logErrorMutation);

  return {
    logger: eventLogger,
    // Re-export convenience methods
    debug: (category: EventData["category"], message: string, details?: Record<string, unknown>) =>
      eventLogger.debug(category, message, details),
    info: (category: EventData["category"], message: string, details?: Record<string, unknown>) =>
      eventLogger.info(category, message, details),
    warn: (category: EventData["category"], message: string, details?: Record<string, unknown>) =>
      eventLogger.warn(category, message, details),
    error: (category: EventData["category"], message: string, details?: Record<string, unknown>, showToUser?: boolean, userMessage?: string) =>
      eventLogger.error(category, message, details, showToUser, userMessage),
    logJSError: (error: Error, category?: EventData["category"], additionalContext?: Record<string, unknown>) =>
      eventLogger.logJSError(error, category, additionalContext),
    logUserAction: (action: string, category: EventData["category"], details?: Record<string, unknown>) =>
      eventLogger.logUserAction(action, category, details),
    logApiCall: (url: string, method: string, status?: number, error?: unknown) =>
      eventLogger.logApiCall(url, method, status, error),
  };
};

// Global error handler for unhandled errors
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    eventLogger.logJSError(event.error || new Error(event.message), "system", {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    eventLogger.logJSError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      "system",
      { type: "unhandled_promise_rejection" }
    );
  });
}