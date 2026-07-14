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

export function isSquareConfigured() {
  return Boolean(process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID);
}

export function getSquareEnvironment() {
  return process.env.SQUARE_ENVIRONMENT === "production" ? "production" : "sandbox";
}

export function getSquareLocationId() {
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!locationId) throw new SquareApiError("Square location is not configured.", 503, "MISSING_LOCATION");
  return locationId;
}

export async function squareRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  if (!accessToken) throw new SquareApiError("Square access is not configured.", 503, "MISSING_TOKEN");

  const baseUrl = getSquareEnvironment() === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Square-Version": process.env.SQUARE_API_VERSION ?? DEFAULT_SQUARE_API_VERSION,
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
