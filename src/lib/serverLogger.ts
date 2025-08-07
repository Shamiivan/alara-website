import { consola } from "consola";
import { NextRequest } from "next/server";

// Create tagged logger instance
const logger = consola.withTag("alara-server");

// Event data interface for server-side
export interface ServerEventData {
  category: "auth" | "onboarding" | "payment" | "calls" | "api" | "system";
  message: string;
  details?: Record<string, unknown>;
  userId?: string;
  url?: string;
  userAgent?: string;
  sessionId?: string;
}

// Environment checks
const isLoggingEnabled = () => {
  return process.env.ENABLE_EVENT_LOGGING === "true";
};

const isServerLoggingEnabled = () => {
  return process.env.ENABLE_SERVER_LOGGING === "true";
};

const getLogLevel = (): "debug" | "info" | "warn" | "error" => {
  const level = process.env.LOG_LEVEL as "debug" | "info" | "warn" | "error" | undefined;
  return level || "info";
};

// Server logger class
export class ServerLogger {
  private shouldLog(level: string): boolean {
    const currentLevel = getLogLevel();
    const levels = ["debug", "info", "warn", "error"];
    const currentIndex = levels.indexOf(currentLevel);
    const messageIndex = levels.indexOf(level);
    return messageIndex >= currentIndex;
  }

  // Extract request context
  private getRequestContext(req?: NextRequest) {
    if (req) {
      return {
        url: req.url,
        userAgent: req.headers.get("user-agent") || undefined,
        method: req.method,
        ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
      };
    }
    return {};
  }

  // Log events to console only (no database for server-side events except errors)
  logEvent(level: "debug" | "info" | "warn" | "error", data: ServerEventData, req?: NextRequest) {
    if (!isLoggingEnabled() || !isServerLoggingEnabled()) return;

    if (!this.shouldLog(level)) return;

    const context = this.getRequestContext(req);
    const message = `[${data.category.toUpperCase()}] ${data.message}`;

    const logData = {
      ...data.details,
      ...context,
      userId: data.userId,
      sessionId: data.sessionId,
    };

    switch (level) {
      case "debug":
        logger.debug(message, logData);
        break;
      case "info":
        logger.info(message, logData);
        break;
      case "warn":
        logger.warn(message, logData);
        break;
      case "error":
        logger.error(message, logData);
        break;
    }
  }

  // Convenience methods
  debug(category: ServerEventData["category"], message: string, details?: Record<string, unknown>, req?: NextRequest) {
    this.logEvent("debug", { category, message, details }, req);
  }

  info(category: ServerEventData["category"], message: string, details?: Record<string, unknown>, req?: NextRequest) {
    this.logEvent("info", { category, message, details }, req);
  }

  warn(category: ServerEventData["category"], message: string, details?: Record<string, unknown>, req?: NextRequest) {
    this.logEvent("warn", { category, message, details }, req);
  }

  error(category: ServerEventData["category"], message: string, details?: Record<string, unknown>, req?: NextRequest) {
    this.logEvent("error", { category, message, details }, req);
  }

  // Log request/response cycles
  logRequest(req: NextRequest, additionalData?: Record<string, unknown>) {
    this.info("api", `${req.method} ${req.url}`, {
      pathname: req.nextUrl.pathname,
      searchParams: Object.fromEntries(req.nextUrl.searchParams),
      ...additionalData,
    }, req);
  }

  logResponse(req: NextRequest, status: number, duration?: number, additionalData?: Record<string, unknown>) {
    const level = status >= 400 ? "error" : status >= 300 ? "warn" : "info";
    this.logEvent(level, {
      category: "api",
      message: `${req.method} ${req.url} - ${status}`,
      details: {
        status,
        duration: duration ? `${duration}ms` : undefined,
        pathname: req.nextUrl.pathname,
        ...additionalData,
      },
    }, req);
  }

  // Log authentication events
  logAuth(event: "login_attempt" | "login_success" | "login_failure" | "logout", details?: Record<string, unknown>, req?: NextRequest) {
    const level = event === "login_failure" ? "error" : "info";
    this.logEvent(level, {
      category: "auth",
      message: `Authentication: ${event}`,
      details,
    }, req);
  }

  // Log system events
  logSystem(event: string, details?: Record<string, unknown>) {
    this.info("system", event, details);
  }

  // Log errors with stack traces
  logError(error: Error, category: ServerEventData["category"], additionalContext?: Record<string, unknown>, req?: NextRequest) {
    this.error(category, error.message, {
      name: error.name,
      stack: error.stack,
      context: additionalContext,
    }, req);
  }

  // Log payment events
  logPayment(event: string, details?: Record<string, unknown>) {
    this.info("payment", event, details);
  }

  // Log call events
  logCall(event: string, details?: Record<string, unknown>) {
    this.info("calls", event, details);
  }

  // Log database operations (for debugging)
  logDatabase(operation: string, details?: Record<string, unknown>) {
    this.debug("system", `Database: ${operation}`, details);
  }
}

// Create singleton instance
export const serverLogger = new ServerLogger();

// Export individual loggers for different modules
export const authLogger = {
  info: (message: string, details?: Record<string, unknown>, req?: NextRequest) => serverLogger.info("auth", message, details, req),
  warn: (message: string, details?: Record<string, unknown>, req?: NextRequest) => serverLogger.warn("auth", message, details, req),
  error: (message: string, details?: Record<string, unknown>, req?: NextRequest) => serverLogger.error("auth", message, details, req),
};

export const apiLogger = {
  info: (message: string, details?: Record<string, unknown>, req?: NextRequest) => serverLogger.info("api", message, details, req),
  warn: (message: string, details?: Record<string, unknown>, req?: NextRequest) => serverLogger.warn("api", message, details, req),
  error: (message: string, details?: Record<string, unknown>, req?: NextRequest) => serverLogger.error("api", message, details, req),
};

export const systemLogger = {
  debug: (message: string, details?: Record<string, unknown>) => serverLogger.debug("system", message, details),
  info: (message: string, details?: Record<string, unknown>) => serverLogger.info("system", message, details),
  warn: (message: string, details?: Record<string, unknown>) => serverLogger.warn("system", message, details),
  error: (message: string, details?: Record<string, unknown>) => serverLogger.error("system", message, details),
};

export const paymentLogger = {
  info: (message: string, details?: Record<string, unknown>) => serverLogger.info("payment", message, details),
  warn: (message: string, details?: Record<string, unknown>) => serverLogger.warn("payment", message, details),
  error: (message: string, details?: Record<string, unknown>) => serverLogger.error("payment", message, details),
};

export const callLogger = {
  info: (message: string, details?: Record<string, unknown>) => serverLogger.info("calls", message, details),
  warn: (message: string, details?: Record<string, unknown>) => serverLogger.warn("calls", message, details),
  error: (message: string, details?: Record<string, unknown>) => serverLogger.error("calls", message, details),
};