"use client";

import { CreditCard, LockKeyhole } from "lucide-react";
import Script from "next/script";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

type SquareTokenError = { message?: string; type?: string; field?: string };
type SquareTokenResult = { status: "OK" | string; token?: string; errors?: SquareTokenError[] };
type SquareCard = {
  attach: (selector: string) => Promise<void>;
  destroy: () => Promise<void>;
  tokenize: (details: Record<string, unknown>) => Promise<SquareTokenResult>;
};
type SquarePayments = { card: () => Promise<SquareCard> };
type SquareWindow = Window & { Square?: { payments: (applicationId: string, locationId: string) => SquarePayments } };

export type BookingCardSecurityHandle = {
  tokenize: (billingContact: { givenName: string; familyName: string; email: string; phone: string }) => Promise<string>;
};

type Props = {
  applicationId: string;
  locationId: string;
  environment: "sandbox" | "production";
  onReadyChange: (ready: boolean) => void;
};

const squareTemporaryErrorPattern = /unexpected|unknown error|internal|temporar|network|timed?\s*out/i;
const squareTemporaryErrorMessage = "Square couldn’t securely verify your card just now. Please wait a moment and try again. Nothing was charged.";

function errorDetails(error: unknown) {
  if (error instanceof Error) return { name: error.name, message: error.message };
  return { name: "UnknownError", message: String(error) };
}

function isTemporarySquareError(message: string, type?: string) {
  return squareTemporaryErrorPattern.test(`${type ?? ""} ${message}`);
}

function reportSquareCardError(details: { phase: "initialize" | "tokenize"; attempt?: number; name?: string; message?: string; status?: string }) {
  void fetch("/api/booking/card-error", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(details),
    keepalive: true,
  }).catch(() => undefined);
}

function pause(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

export const BookingCardSecurity = forwardRef<BookingCardSecurityHandle, Props>(function BookingCardSecurity(
  { applicationId, locationId, environment, onReadyChange },
  forwardedRef,
) {
  const configured = Boolean(applicationId && locationId);
  const cardRef = useRef<SquareCard | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && (window as SquareWindow).Square) setScriptReady(true);
  }, []);

  useEffect(() => {
    if (!configured || !scriptReady || cardRef.current) return;
    let active = true;
    const square = (window as SquareWindow).Square;
    if (!square) return;

    square.payments(applicationId, locationId).card().then(async (card) => {
      if (!active) return;
      await card.attach("#booking-square-card");
      cardRef.current = card;
      setError("");
      onReadyChange(true);
    }).catch((cause: unknown) => {
      const details = errorDetails(cause);
      reportSquareCardError({ phase: "initialize", ...details });
      setError("Secure card entry could not load. Refresh the page and try again.");
      onReadyChange(false);
    });

    return () => {
      active = false;
      onReadyChange(false);
      if (cardRef.current) void cardRef.current.destroy();
      cardRef.current = null;
    };
  }, [applicationId, configured, locationId, onReadyChange, scriptReady]);

  useImperativeHandle(forwardedRef, () => ({
    async tokenize(billingContact) {
      const card = cardRef.current;
      if (!card) throw new Error("Secure card entry is still loading.");
      const verificationDetails = {
        intent: "STORE",
        customerInitiated: true,
        sellerKeyedIn: false,
        billingContact: { ...billingContact, countryCode: "US" },
      };

      for (let attempt = 1; attempt <= 2; attempt += 1) {
        let result: SquareTokenResult;
        try {
          result = await card.tokenize(verificationDetails);
        } catch (cause) {
          const details = errorDetails(cause);
          const temporary = isTemporarySquareError(details.message, details.name);
          reportSquareCardError({ phase: "tokenize", attempt, ...details });
          if (temporary && attempt === 1) {
            await pause(800);
            continue;
          }
          throw new Error(temporary ? squareTemporaryErrorMessage : details.message || "Please review your card information.");
        }

        if (result.status === "OK" && result.token) return result.token;

        const firstError = result.errors?.[0];
        const message = firstError?.message ?? "Please review your card information.";
        const temporary = isTemporarySquareError(message, firstError?.type);
        if (temporary) reportSquareCardError({ phase: "tokenize", attempt, name: firstError?.type, message, status: result.status });
        if (temporary && attempt === 1) {
          await pause(800);
          continue;
        }
        throw new Error(temporary ? squareTemporaryErrorMessage : message);
      }

      throw new Error(squareTemporaryErrorMessage);
    },
  }), []);

  return (
    <section className="mt-7 border-t border-[#e4ded4] pt-7">
      {configured && <Script src={environment === "sandbox" ? "https://sandbox.web.squarecdn.com/v1/square.js" : "https://web.squarecdn.com/v1/square.js"} strategy="afterInteractive" onLoad={() => setScriptReady(true)} onReady={() => setScriptReady(true)} />}
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f6f5e9] text-[#893d3e]"><CreditCard size={18} /></span>
        <div>
          <h3 className="text-sm font-bold text-[#33373d]">Card required to secure your appointment</h3>
          <p className="mt-1 text-xs leading-5 text-[#676767]">Your card is securely stored by Square. Nothing is charged when you book.</p>
        </div>
      </div>

      <div id="booking-square-card" className="mt-5 min-h-14 rounded-xl border border-[#d8cfc5] bg-white p-3" aria-label="Secure Square card entry" />
      {!configured && <p className="mt-3 rounded-xl bg-[#f8e8e5] p-4 text-xs leading-5 text-[#713335]">Square card entry is not configured. Please call the spa to book.</p>}
      {error && <p role="alert" className="mt-3 rounded-xl bg-[#f8e8e5] p-4 text-xs leading-5 text-[#713335]">{error}</p>}

      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-[#d8cfc5] bg-white p-4 text-xs leading-5 text-[#33373d]">
        <input required type="checkbox" name="policyAccepted" value="true" className="mt-1 h-4 w-4 shrink-0 accent-[#893d3e]" />
        <span><strong>I accept the cancellation and no-show policy.</strong> I understand that 50% of the scheduled service price will be charged if I cancel less than 24 hours before the appointment or do not attend, and I authorize Tupelo Honey Spa to charge this card in that event. No charge is made today.</span>
      </label>

      <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-2xl bg-[#f6f5e9] p-4 text-xs leading-5 text-[#33373d]">
        <input type="checkbox" name="saveCardForFuture" value="true" className="mt-1 h-4 w-4 shrink-0 accent-[#893d3e]" />
        <span><strong>Save this card for future appointments.</strong> Optional. If left unchecked, the card is retained only for this appointment’s policy-enforcement period, then disabled.</span>
      </label>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-[.68rem] text-[#777777]"><LockKeyhole size={12} /> Card details are entered directly into Square and never pass through this website.</p>
    </section>
  );
});
