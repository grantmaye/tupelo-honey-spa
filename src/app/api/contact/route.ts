import { NextResponse } from "next/server";

type ContactRequest = {
  firstName?: string;
  lastName?: string;
  email?: string;
  message?: string;
  website?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL ?? process.env.GIFT_CARD_FROM_EMAIL;
  const to = process.env.CONTACT_TO_EMAIL ?? "tupelohoneyspa@gmail.com";
  if (!apiKey || !from) {
    return NextResponse.json({ error: "Online message delivery is temporarily unavailable." }, { status: 503 });
  }

  let body: ContactRequest;
  try {
    body = await request.json() as ContactRequest;
  } catch {
    return NextResponse.json({ error: "Invalid message request." }, { status: 400 });
  }

  if (body.website) return NextResponse.json({ success: true });
  const firstName = body.firstName?.trim() ?? "";
  const lastName = body.lastName?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const message = body.message?.trim() ?? "";
  if (!firstName || !lastName || firstName.length > 80 || lastName.length > 80 || !emailPattern.test(email) || email.length > 254 || message.length < 5 || message.length > 4000) {
    return NextResponse.json({ error: "Check your contact details and message, then try again." }, { status: 400 });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `Website message from ${firstName} ${lastName}`,
      html: `<div style="font-family:Arial,sans-serif;color:#33373d"><h1>New website message</h1><p><strong>From:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p><p><strong>Email:</strong> ${escapeHtml(email)}</p><div style="white-space:pre-wrap;border-left:3px solid #893d3e;padding-left:16px">${escapeHtml(message)}</div></div>`,
    }),
    cache: "no-store",
  });

  if (!response.ok) return NextResponse.json({ error: "Your message could not be delivered right now." }, { status: 502 });
  return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" })[character] ?? character);
}
