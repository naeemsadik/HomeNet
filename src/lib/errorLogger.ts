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
    // An AxiosError carries none of these at the top level: the API's code
    // lives at `response.data.error_code`. Reading only the top level logged
    // `null` for every request failure, whatever the API actually said.
    errorCode:
      (error as any)?.errorCode ??
      (error as any)?.error_code ??
      (error as any)?.response?.data?.error_code ??
      null,
    endpoint: (error as any)?.config?.url ?? context?.endpoint as string | undefined,
    context,
  };

  // Always logged. This used to log only in development and on a server, so a crash in the
  // installed Android app left no trace anywhere. A release build's console.error reaches
  // `adb logcat` (tag ReactNativeJS) and a browser's console.
  if (__DEV__) {
    console.error("[HomeNet Error Report]", errorReport);
  } else {
    try {
      console.error(JSON.stringify({ level: "error", ...errorReport }));
    } catch {
      console.error("[HomeNet Error]", errorReport.message);
    }
  }

  return errorReport;
}
