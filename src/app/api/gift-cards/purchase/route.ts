import { NextResponse } from "next/server";

type PurchaseRequest = {
  sourceId?: string;
  amount?: number;
  senderName?: string;
  senderEmail?: string;
  recipientName?: string;
  recipientEmail?: string;
  message?: string;
  delivery?: "gift" | "self";
};

type SquareOrder = { order?: { id?: string; line_items?: Array<{ uid?: string }> }; errors?: SquareError[] };
type SquarePayment = { payment?: { id?: string }; errors?: SquareError[] };
type SquareGiftCard = { gift_card?: { id?: string; gan?: string }; errors?: SquareError[] };
type SquareError = { detail?: string; code?: string };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID ?? process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID;
  const environment = process.env.SQUARE_ENVIRONMENT === "sandbox" ? "sandbox" : "production";
  const squareBaseUrl = environment === "sandbox" ? "https://connect.squareupsandbox.com" : "https://connect.squareup.com";

  if (!accessToken || !locationId) {
    return NextResponse.json({ error: "Square checkout has not been activated yet." }, { status: 503 });
  }

  let body: PurchaseRequest;
  try {
    body = await request.json() as PurchaseRequest;
  } catch {
    return NextResponse.json({ error: "Invalid purchase request." }, { status: 400 });
  }

  const amount = Number(body.amount);
  const amountCents = Math.round(amount * 100);
  const senderName = body.senderName?.trim() ?? "";
  const senderEmail = body.senderEmail?.trim().toLowerCase() ?? "";
  const recipientName = body.recipientName?.trim() ?? "";
  const recipientEmail = body.recipientEmail?.trim().toLowerCase() ?? "";
  const message = body.message?.trim().slice(0, 300) ?? "";

  if (!body.sourceId || !Number.isInteger(amountCents) || amountCents < 2500 || amountCents > 50000) {
    return NextResponse.json({ error: "Choose a gift card amount between $25 and $500." }, { status: 400 });
  }
  if (!senderName || !recipientName || !emailPattern.test(senderEmail) || !emailPattern.test(recipientEmail)) {
    return NextResponse.json({ error: "Enter valid sender and recipient details." }, { status: 400 });
  }

  const purchaseId = crypto.randomUUID();
  const lineItemUid = crypto.randomUUID();
  let paymentId = "";

  try {
    const order = await squareRequest<SquareOrder>(squareBaseUrl, accessToken, "/v2/orders", {
      idempotency_key: `gift-order-${purchaseId}`,
      order: {
        location_id: locationId,
        reference_id: purchaseId,
        line_items: [{
          uid: lineItemUid,
          name: "Tupelo Honey Digital Gift Card",
          quantity: "1",
          item_type: "GIFT_CARD",
          base_price_money: { amount: amountCents, currency: "USD" },
        }],
      },
    });
    const orderId = order.order?.id;
    const returnedLineItemUid = order.order?.line_items?.[0]?.uid ?? lineItemUid;
    if (!orderId) throw new Error(squareMessage(order.errors, "The gift card order could not be created."));

    const payment = await squareRequest<SquarePayment>(squareBaseUrl, accessToken, "/v2/payments", {
      source_id: body.sourceId,
      idempotency_key: `gift-payment-${purchaseId}`,
      amount_money: { amount: amountCents, currency: "USD" },
      order_id: orderId,
      location_id: locationId,
      autocomplete: true,
      buyer_email_address: senderEmail,
      note: `Digital gift card for ${recipientName}`,
    });
    paymentId = payment.payment?.id ?? "";
    if (!paymentId) throw new Error(squareMessage(payment.errors, "The card payment was not approved."));

    const giftCard = await squareRequest<SquareGiftCard>(squareBaseUrl, accessToken, "/v2/gift-cards", {
      idempotency_key: `gift-card-${purchaseId}`,
      location_id: locationId,
      gift_card: { type: "DIGITAL" },
    });
    const giftCardId = giftCard.gift_card?.id;
    const gan = giftCard.gift_card?.gan;
    if (!giftCardId || !gan) throw new Error(squareMessage(giftCard.errors, "The digital gift card could not be created."));

    await squareRequest(squareBaseUrl, accessToken, "/v2/gift-cards/activities", {
      idempotency_key: `gift-activate-${purchaseId}`,
      gift_card_id: giftCardId,
      gift_card_activity: {
        type: "ACTIVATE",
        location_id: locationId,
        activate_activity_details: { order_id: orderId, line_item_uid: returnedLineItemUid },
      },
    });

    const deliverySent = await sendGiftCardEmail({ recipientName, recipientEmail, senderName, amount, message, gan });
    return NextResponse.json({ success: true, gan, deliverySent });
  } catch (error) {
    if (paymentId) await refundPayment(squareBaseUrl, accessToken, paymentId, amountCents, purchaseId).catch(() => undefined);
    return NextResponse.json({ error: error instanceof Error ? error.message : "The purchase could not be completed." }, { status: 502 });
  }
}

async function squareRequest<T = Record<string, unknown>>(baseUrl: string, accessToken: string, path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Square-Version": process.env.SQUARE_API_VERSION ?? "2026-05-20",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const result = await response.json() as T & { errors?: SquareError[] };
  if (!response.ok) throw new Error(squareMessage(result.errors, "Square could not complete the request."));
  return result;
}

function squareMessage(errors: SquareError[] | undefined, fallback: string) {
  return errors?.[0]?.detail ?? fallback;
}

async function refundPayment(baseUrl: string, accessToken: string, paymentId: string, amount: number, purchaseId: string) {
  await squareRequest(baseUrl, accessToken, "/v2/refunds", {
    idempotency_key: `gift-refund-${purchaseId}`,
    payment_id: paymentId,
    amount_money: { amount, currency: "USD" },
    reason: "Gift card activation did not complete",
  });
}

async function sendGiftCardEmail({ recipientName, recipientEmail, senderName, amount, message, gan }: { recipientName: string; recipientEmail: string; senderName: string; amount: number; message: string; gan: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.GIFT_CARD_FROM_EMAIL;
  if (!apiKey || !from) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [recipientEmail],
      subject: `${senderName} sent you a Tupelo Honey gift card`,
      html: `<div style="font-family:Arial,sans-serif;background:#f6f5e9;padding:40px;color:#33373d"><div style="max-width:560px;margin:auto;background:#fff;padding:36px;border-radius:18px"><p style="color:#893d3e;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">Tupelo Honey Spa</p><h1 style="font-size:36px;line-height:1.1">A little something for you, ${escapeHtml(recipientName)}.</h1><p style="font-size:18px;line-height:1.6">${escapeHtml(senderName)} sent you a $${amount} digital gift card.</p>${message ? `<blockquote style="border-left:3px solid #e3af23;margin:28px 0;padding:12px 20px;color:#676767">${escapeHtml(message)}</blockquote>` : ""}<div style="background:#893d3e;color:#fff;border-radius:14px;padding:28px;margin-top:28px"><p style="margin:0;color:#e3af23;font-size:12px;text-transform:uppercase;letter-spacing:2px">Redemption code</p><p style="font-size:25px;letter-spacing:4px;margin:12px 0 0">${gan.replace(/(.{4})/g, "$1 ").trim()}</p></div><p style="margin-top:28px;color:#676767;font-size:14px">Bring this code to Tupelo Honey Spa when you are ready to use your gift.</p></div></div>`,
    }),
    cache: "no-store",
  });
  return response.ok;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;" })[character] ?? character);
}
