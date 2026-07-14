import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.WORDPRESS_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "WordPress revalidation is not configured." }, { status: 503 });
  }

  const suppliedSecret = request.headers.get("x-wordpress-revalidate-secret") ?? "";
  if (!secretsMatch(secret, suppliedSecret)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  revalidateTag("wordpress", "max");
  return NextResponse.json({ revalidated: true, timestamp: new Date().toISOString() });
}

function secretsMatch(expected: string, supplied: string) {
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}
