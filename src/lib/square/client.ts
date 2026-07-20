const DEFAULT_SQUARE_API_VERSION = "2026-05-20";

type SquareError = {
  category?: string;
  code?: string;
  detail?: string;
};

type SquareErrorResponse = {
  errors?: SquareError[];
};

export class SquareApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "SquareApiError";
    this.status = status;
    this.code = code;
  }
}

function squareEnv(name: "SQUARE_ACCESS_TOKEN" | "SQUARE_LOCATION_ID" | "SQUARE_ENVIRONMENT" | "SQUARE_API_VERSION") {
  return process.env[name]?.trim() ?? "";
}

export function isSquareConfigured() {
  return Boolean(squareEnv("SQUARE_ACCESS_TOKEN") && squareEnv("SQUARE_LOCATION_ID"));
}

export function getSquareEnvironment() {
  return squareEnv("SQUARE_ENVIRONMENT") === "production" ? "production" : "sandbox";
}

export function getSquareLocationId() {
  const locationId = squareEnv("SQUARE_LOCATION_ID");
  if (!locationId) throw new SquareApiError("Square location is not configured.", 503, "MISSING_LOCATION");
  return locationId;
}

export async function squareRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const accessToken = squareEnv("SQUARE_ACCESS_TOKEN");
  if (!accessToken) throw new SquareApiError("Square access is not configured.", 503, "MISSING_TOKEN");

  const baseUrl = getSquareEnvironment() === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Square-Version": squareEnv("SQUARE_API_VERSION") || DEFAULT_SQUARE_API_VERSION,
      ...init.headers,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  const body = await response.json() as T & SquareErrorResponse;
  if (!response.ok) {
    const error = body.errors?.[0];
    throw new SquareApiError(
      error?.detail ?? "Square rejected the request.",
      response.status,
      error?.code,
    );
  }

  return body;
}
