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
  const status =
    (error as any)?.status ??
    (error as any)?.statusCode ??
    (error as any)?.response?.status ??
    (context?.status as number | undefined) ??
    null;

  const errorReport: DetailedErrorReport = {
    timestamp: new Date().toISOString(),
    name: isErr ? error.name : "UnknownError",
    message: isErr ? error.message : String(error),
    stack: isErr ? error.stack : undefined,
    status,
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

  // For expected transient rate-limit responses (status === 429), downgrade __DEV__ logging
  // from console.error to console.warn so Expo's dev LogBox does not trigger a red fatal overlay,
  // while still preserving visibility in the console.
  if (status === 429) {
    if (__DEV__) {
      console.warn("[HomeNet Rate Limit 429]", errorReport);
    } else {
      try {
        console.warn(JSON.stringify({ level: "warn", ...errorReport }));
      } catch {
        console.warn("[HomeNet Rate Limit 429]", errorReport.message);
      }
    }
  } else if (__DEV__) {
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
