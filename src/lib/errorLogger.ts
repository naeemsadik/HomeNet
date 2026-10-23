/**
 * Error Logging & Telemetry Layer
 *
 * Captures full error details (stack traces, parameters, endpoints, statuses)
 * for server-side / debugging logs without leaking them to the end user.
 */

export interface DetailedErrorReport {
  timestamp: string;
  name: string;
  message: string;
  stack?: string;
  status?: number | null;
  errorCode?: number | null;
  endpoint?: string;
  context?: Record<string, unknown>;
}

export function reportError(
  error: unknown,
  context?: Record<string, unknown>,
): DetailedErrorReport {
  const isErr = error instanceof Error;
  const errorReport: DetailedErrorReport = {
    timestamp: new Date().toISOString(),
    name: isErr ? error.name : "UnknownError",
    message: isErr ? error.message : String(error),
    stack: isErr ? error.stack : undefined,
    status: (error as any)?.status ?? null,
    errorCode: (error as any)?.errorCode ?? (error as any)?.error_code ?? null,
    endpoint: (error as any)?.config?.url ?? context?.endpoint as string | undefined,
    context,
  };

  // 1. In development or local runs, log full detailed diagnostic info
  if (__DEV__) {
    console.error("[HomeNet Error Report]", errorReport);
  } else if (typeof window === "undefined") {
    // 2. Server-side / Node / SSR environment: log structured JSON for server logs
    try {
      console.error(JSON.stringify({ level: "error", ...errorReport }));
    } catch {
      console.error("[HomeNet Server Error]", errorReport.message);
    }
  }

  return errorReport;
}
