"use client";

import { useState } from "react";
import { useEventLogger } from "@/lib/eventLogger";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Component that will throw an error for testing error boundary
function ErrorComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("This is a test error for the error boundary!");
  }
  return <p className="text-green-600">No error thrown - component working normally</p>;
}

export default function TestLoggingPage() {
  const { debug, info, warn, error, logUserAction, logApiCall, logJSError } = useEventLogger();
  const [shouldThrowError, setShouldThrowError] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConsoleLogging = () => {
    debug("system", "Debug message test", { testData: "debug test" });
    info("system", "Info message test", { testData: "info test" });
    warn("system", "Warning message test", { testData: "warn test" });
    addResult("Console logging test completed - check browser console");
  };

  const testErrorLogging = () => {
    error("system", "Test error message", {
      testData: "error test",
      errorCode: "TEST_001"
    }, true, "This is a test error for demonstration purposes.");
    addResult("Error logged to console and database");
  };

  const testUserActionLogging = () => {
    logUserAction("Test button clicked", "system", {
      buttonId: "test-user-action",
      timestamp: Date.now()
    });
    addResult("User action logged");
  };

  const testApiCallLogging = () => {
    // Simulate successful API call
    logApiCall("/api/test", "GET", 200);
    addResult("Successful API call logged");

    // Simulate failed API call
    logApiCall("/api/test-fail", "POST", 500, { error: "Test API failure" });
    addResult("Failed API call logged");
  };

  const testJSErrorLogging = () => {
    const testError = new Error("Test JavaScript error");
    testError.stack = "Test stack trace\n  at testFunction (test.js:123:45)";

    logJSError(testError, "system", {
      context: "Manual test error",
      additionalData: "test data"
    });
    addResult("JavaScript error logged");
  };

  const testGlobalErrorHandler = () => {
    // This will trigger the global error handler
    setTimeout(() => {
      throw new Error("Test global error handler");
    }, 100);
    addResult("Global error thrown - check console and database in 100ms");
  };

  const testUnhandledPromiseRejection = () => {
    // This will trigger the global unhandled promise rejection handler
    Promise.reject(new Error("Test unhandled promise rejection"));
    addResult("Unhandled promise rejection triggered - check console and database");
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Event Logging System Test</h1>
          <p className="text-gray-600">
            Test all aspects of the event logging system. Open browser console to see console logs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Console Logging Tests */}
          <Card>
            <CardHeader>
              <CardTitle>Console Logging</CardTitle>
              <CardDescription>
                Test different log levels (debug, info, warn, error)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={testConsoleLogging} className="w-full">
                Test Console Logging
              </Button>
            </CardContent>
          </Card>

          {/* Error Database Logging */}
          <Card>
            <CardHeader>
              <CardTitle>Database Error Logging</CardTitle>
              <CardDescription>
                Test logging errors to the database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={testErrorLogging} variant="destructive" className="w-full">
                Test Error Database Logging
              </Button>
            </CardContent>
          </Card>

          {/* User Action Logging */}
          <Card>
            <CardHeader>
              <CardTitle>User Action Logging</CardTitle>
              <CardDescription>
                Test logging user interactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={testUserActionLogging} variant="outline" className="w-full">
                Test User Action Logging
              </Button>
            </CardContent>
          </Card>

          {/* API Call Logging */}
          <Card>
            <CardHeader>
              <CardTitle>API Call Logging</CardTitle>
              <CardDescription>
                Test logging API calls (success and failure)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={testApiCallLogging} variant="secondary" className="w-full">
                Test API Call Logging
              </Button>
            </CardContent>
          </Card>

          {/* JavaScript Error Logging */}
          <Card>
            <CardHeader>
              <CardTitle>JavaScript Error Logging</CardTitle>
              <CardDescription>
                Test logging JavaScript errors with context
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={testJSErrorLogging} variant="destructive" className="w-full">
                Test JS Error Logging
              </Button>
            </CardContent>
          </Card>

          {/* Global Error Handlers */}
          <Card>
            <CardHeader>
              <CardTitle>Global Error Handlers</CardTitle>
              <CardDescription>
                Test global error and promise rejection handlers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={testGlobalErrorHandler} variant="destructive" className="w-full">
                Test Global Error Handler
              </Button>
              <Button onClick={testUnhandledPromiseRejection} variant="destructive" className="w-full">
                Test Promise Rejection Handler
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Error Boundary Test */}
        <Card>
          <CardHeader>
            <CardTitle>Error Boundary Test</CardTitle>
            <CardDescription>
              Test React Error Boundary functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShouldThrowError(!shouldThrowError)}
                variant={shouldThrowError ? "destructive" : "outline"}
              >
                {shouldThrowError ? "Stop Throwing Error" : "Throw React Error"}
              </Button>
            </div>

            <ErrorBoundary category="system">
              <div className="p-4 border rounded-lg">
                <ErrorComponent shouldThrow={shouldThrowError} />
              </div>
            </ErrorBoundary>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Results of the logging tests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              {testResults.length === 0 ? (
                <p className="text-gray-500 italic">No tests run yet</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="text-sm bg-gray-100 p-2 rounded">
                    {result}
                  </div>
                ))
              )}
            </div>
            {testResults.length > 0 && (
              <Button onClick={clearResults} variant="outline" size="sm">
                Clear Results
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p><strong>Console Logs:</strong> Open browser DevTools (F12) → Console tab to see console logs</p>
            <p><strong>Database Logs:</strong> Errors are automatically saved to the Convex database</p>
            <p><strong>Server Logs:</strong> Check the terminal/console where the dev server is running for server-side logs</p>
            <p><strong>Environment:</strong> Logging is controlled by environment variables in .env.local</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}