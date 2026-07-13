"use client";

import { Check, Gift, LockKeyhole, Mail, Sparkles } from "lucide-react";
import Script from "next/script";
import { FormEvent, useEffect, useRef, useState } from "react";

type SquareTokenResult = { status: "OK" | string; token?: string; errors?: Array<{ message?: string }> };
type SquareCard = {
  attach: (selector: string) => Promise<void>;
  destroy: () => Promise<void>;
  tokenize: (details: Record<string, unknown>) => Promise<SquareTokenResult>;
};
type SquarePayments = { card: () => Promise<SquareCard> };
type SquareWindow = Window & { Square?: { payments: (applicationId: string, locationId: string) => SquarePayments } };

const presetAmounts = [25, 50, 100, 150];

type GiftCardCheckoutProps = { applicationId: string; locationId: string; environment: "sandbox" | "production" };

export function GiftCardCheckout({ applicationId, locationId, environment }: GiftCardCheckoutProps) {
  const configured = Boolean(applicationId && locationId);
  const cardRef = useRef<SquareCard | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [cardReady, setCardReady] = useState(false);
  const [amount, setAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState("");
  const [delivery, setDelivery] = useState<"gift" | "self">("gift");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ kind: "idle" | "error" | "success"; message: string; code?: string }>({ kind: "idle", message: "" });

  useEffect(() => {
    if (!configured || !scriptReady || cardRef.current) return;
    let active = true;
    const square = (window as SquareWindow).Square;
    if (!square) return;

    square.payments(applicationId, locationId).card().then(async (card) => {
      if (!active) return;
      await card.attach("#square-card-container");
      cardRef.current = card;
      setCardReady(true);
    }).catch(() => setStatus({ kind: "error", message: "Secure card entry could not load. Please refresh and try again." }));

    return () => {
      active = false;
      if (cardRef.current) void cardRef.current.destroy();
      cardRef.current = null;
    };
  }, [applicationId, configured, locationId, scriptReady]);

  function selectPreset(value: number) {
    setAmount(value);
    setCustomAmount("");
  }

  function applyCustomAmount(value: string) {
    setCustomAmount(value);
    const parsed = Number(value);
    if (Number.isFinite(parsed)) setAmount(parsed);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ kind: "idle", message: "" });
    if (!cardRef.current || !cardReady) {
      setStatus({ kind: "error", message: configured ? "Secure card entry is still loading." : "Square credentials must be connected before checkout can accept payment." });
      return;
    }
    if (amount < 25 || amount > 500) {
      setStatus({ kind: "error", message: "Choose an amount between $25 and $500." });
      return;
    }

    const form = new FormData(event.currentTarget);
    const senderName = String(form.get("senderName") ?? "").trim();
    const senderEmail = String(form.get("senderEmail") ?? "").trim();
    const recipientName = delivery === "gift" ? String(form.get("recipientName") ?? "").trim() : senderName;
    const recipientEmail = delivery === "gift" ? String(form.get("recipientEmail") ?? "").trim() : senderEmail;

    setSubmitting(true);
    try {
      const tokenResult = await cardRef.current.tokenize({
        amount: amount.toFixed(2),
        currencyCode: "USD",
        intent: "CHARGE",
        customerInitiated: true,
        sellerKeyedIn: false,
        billingContact: { givenName: senderName, email: senderEmail, countryCode: "US" },
      });
      if (tokenResult.status !== "OK" || !tokenResult.token) throw new Error(tokenResult.errors?.[0]?.message ?? "Please review your card information.");

      const response = await fetch("/api/gift-cards/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceId: tokenResult.token,
          amount,
          senderName,
          senderEmail,
          recipientName,
          recipientEmail,
          message: String(form.get("message") ?? "").trim(),
          delivery,
        }),
      });
      const result = await response.json() as { error?: string; gan?: string; deliverySent?: boolean };
      if (!response.ok) throw new Error(result.error ?? "We could not complete the purchase.");
      setStatus({ kind: "success", message: result.deliverySent ? `Your $${amount} gift card is on its way.` : "Your gift card is ready. Save the redemption code below.", code: result.gan });
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "We could not complete the purchase." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {configured && <Script src={environment === "sandbox" ? "https://sandbox.web.squarecdn.com/v1/square.js" : "https://web.squarecdn.com/v1/square.js"} strategy="afterInteractive" onLoad={() => setScriptReady(true)} />}
      <section className="bg-[#ead6cf] py-16 text-center sm:py-24">
        <div className="container-site max-w-4xl">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e3af23] text-white"><Gift size={25} /></span>
          <p className="mt-7 text-xs font-bold uppercase tracking-[.16em] text-[#893d3e]">A little time for themselves</p>
          <h1 className="font-display mt-4 text-5xl leading-none text-[#33373d] sm:text-7xl">Give the gift of feeling good.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#676767]">Choose an amount, add a personal note, and send a digital Tupelo Honey gift card without leaving the website.</p>
        </div>
      </section>

      <section className="bg-[#f6f5e9] py-16 sm:py-24">
        <form onSubmit={submit} className="container-site grid gap-8 lg:grid-cols-[1fr_390px]">
          <div className="space-y-6">
            {!configured && <div className="rounded-2xl border border-[#e3af23]/35 bg-[#fff9e8] p-5 text-sm leading-6 text-[#675314]"><strong>Checkout preview:</strong> the complete on-site experience is built. Payment remains disabled until Tupelo Honey’s Square application credentials are added.</div>}

            <section className="paper-card p-6 sm:p-8">
              <StepLabel number="1" title="Choose an amount" />
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {presetAmounts.map((value) => <button key={value} type="button" onClick={() => selectPreset(value)} className={`h-14 rounded-xl border text-lg font-bold transition ${amount === value && !customAmount ? "border-[#893d3e] bg-[#893d3e] text-white" : "border-[#d8cfc5] bg-white hover:border-[#893d3e]"}`}>${value}</button>)}
              </div>
              <label className="mt-4 block text-xs font-bold text-[#33373d]">Custom amount ($25–$500)<span className="mt-2 flex h-14 items-center rounded-xl border border-[#d8cfc5] bg-white px-4 text-lg"><span className="text-[#676767]">$</span><input value={customAmount} onChange={(event) => applyCustomAmount(event.target.value)} type="number" min="25" max="500" step="1" inputMode="decimal" placeholder="Other amount" className="h-full w-full bg-transparent px-2 outline-none" /></span></label>
            </section>

            <section className="paper-card p-6 sm:p-8">
              <StepLabel number="2" title="Who is it for?" />
              <div className="mt-6 grid grid-cols-2 gap-3">
                <ToggleButton active={delivery === "gift"} onClick={() => setDelivery("gift")} icon={<Gift size={18} />} label="Someone else" />
                <ToggleButton active={delivery === "self"} onClick={() => setDelivery("self")} icon={<Sparkles size={18} />} label="For me" />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label="Your name" name="senderName" autoComplete="name" />
                <Field label="Your email" name="senderEmail" type="email" autoComplete="email" />
                {delivery === "gift" && <><Field label="Recipient’s name" name="recipientName" /><Field label="Recipient’s email" name="recipientEmail" type="email" /></>}
              </div>
              <label className="mt-4 block text-xs font-bold text-[#33373d]">Personal message <span className="font-normal text-[#777777]">Optional</span><textarea name="message" maxLength={300} rows={4} placeholder="A little note to make their day…" className="mt-2 w-full resize-none rounded-xl border border-[#d8cfc5] bg-white p-4 font-normal outline-none focus:border-[#893d3e]" /></label>
            </section>

            <section className="paper-card p-6 sm:p-8">
              <StepLabel number="3" title="Secure payment" />
              <div id="square-card-container" className="mt-6 min-h-14 rounded-xl border border-[#d8cfc5] bg-white p-3" aria-label="Secure Square card entry" />
              {!configured && <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#f6f5e9] p-4 text-xs text-[#676767]"><LockKeyhole size={15} /> Secure Square card entry appears here after credentials are connected.</div>}
            </section>
          </div>

          <aside className="h-fit rounded-3xl bg-[#00032c] p-7 text-white lg:sticky lg:top-[138px]">
            <p className="text-[.65rem] font-bold uppercase tracking-[.15em] text-[#e3af23]">Your gift card</p>
            <div className="mt-6 rounded-2xl border border-white/15 bg-gradient-to-br from-[#893d3e] to-[#6b282f] p-6 shadow-2xl">
              <div className="flex items-center justify-between"><Gift size={22} className="text-[#e3af23]" /><span className="text-[.6rem] font-bold uppercase tracking-[.16em] text-white/60">Digital Gift Card</span></div>
              <p className="font-display mt-14 text-5xl">${Number.isFinite(amount) ? Math.max(0, amount) : 0}</p>
              <p className="mt-2 text-xs text-white/65">Tupelo Honey Spa & Wellness Collective</p>
            </div>
            <div className="mt-7 space-y-4 text-sm">
              <SummaryRow label="Delivery" value={delivery === "gift" ? "Email to recipient" : "Email to you"} />
              <SummaryRow label="Gift card" value={`$${Number.isFinite(amount) ? Math.max(0, amount) : 0}.00`} />
              <SummaryRow label="Total" value={`$${Number.isFinite(amount) ? Math.max(0, amount) : 0}.00`} strong />
            </div>
            <button type="submit" disabled={submitting || !configured || !cardReady} className="button-primary mt-7 w-full !rounded-[3px] disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "Processing…" : `Purchase $${amount || 0} Gift Card`}</button>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-[.68rem] text-white/50"><LockKeyhole size={12} /> Payments are securely processed by Square.</p>
            {status.kind === "error" && <p role="alert" className="mt-5 rounded-xl bg-[#893d3e]/35 p-4 text-sm leading-6 text-white">{status.message}</p>}
            {status.kind === "success" && <div className="mt-5 rounded-xl bg-white/10 p-4"><p className="flex items-center gap-2 text-sm font-bold"><Check size={15} className="text-[#e3af23]" /> {status.message}</p>{status.code && <p className="mt-3 font-mono text-lg tracking-wider text-[#e3af23]">{status.code.replace(/(.{4})/g, "$1 ").trim()}</p>}</div>}
          </aside>
        </form>
      </section>

      <section className="bg-white py-16 text-center sm:py-20"><div className="container-site"><Mail className="mx-auto text-[#893d3e]" /><h2 className="font-display mt-5 text-4xl">Delivered straight to their inbox.</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#676767]">Digital gift cards can be used toward eligible services at Tupelo Honey Spa. The recipient receives their redemption code by email after purchase.</p></div></section>
    </>
  );
}

function StepLabel({ number, title }: { number: string; title: string }) {
  return <div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#ead6cf] text-xs font-bold text-[#893d3e]">{number}</span><h2 className="font-display text-2xl">{title}</h2></div>;
}

function ToggleButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return <button type="button" onClick={onClick} className={`flex min-h-14 items-center justify-center gap-2 rounded-xl border text-sm font-bold ${active ? "border-[#893d3e] bg-[#ead6cf]/50 text-[#893d3e]" : "border-[#d8cfc5] bg-white"}`}>{icon}{label}</button>;
}

function Field({ label, name, type = "text", autoComplete }: { label: string; name: string; type?: string; autoComplete?: string }) {
  return <label className="text-xs font-bold text-[#33373d]">{label}<input required name={name} type={type} autoComplete={autoComplete} className="mt-2 h-12 w-full rounded-xl border border-[#d8cfc5] bg-white px-4 font-normal outline-none focus:border-[#893d3e]" /></label>;
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className={`flex justify-between gap-4 border-b border-white/12 pb-4 ${strong ? "text-base font-bold" : ""}`}><span className="text-white/55">{label}</span><span>{value}</span></div>;
}
