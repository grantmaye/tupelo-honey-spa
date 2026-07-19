import { NextRequest } from "next/server";

const allowedPhases = new Set(["initialize", "tokenize"]);

function safeText(value: unknown, maximumLength = 300) {
  return typeof value === "string" ? value.replace(/[\r\n]/g, " ").slice(0, maximumLength) : undefined;
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return new Response(null, { status: 403 });

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 4096) return new Response(null, { status: 413 });

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return new Response(null, { status: 400 });
  }

  const phase = safeText(body.phase, 20);
  if (!phase || !allowedPhases.has(phase)) return new Response(null, { status: 400 });

  console.error("[booking-card] Square client failure", {
    phase,
    attempt: typeof body.attempt === "number" ? Math.min(Math.max(Math.trunc(body.attempt), 1), 2) : undefined,
    name: safeText(body.name, 80),
    message: safeText(body.message),
    status: safeText(body.status, 40),
    userAgent: safeText(request.headers.get("user-agent"), 250),
  });

  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
