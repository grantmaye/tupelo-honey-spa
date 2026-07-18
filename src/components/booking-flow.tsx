"use client";

import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, ExternalLink, LoaderCircle, LockKeyhole, UserRound } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookingCardSecurity, type BookingCardSecurityHandle } from "@/components/booking-card-security";
import type { Service } from "@/data/site";
import type { Availability, BookingResult } from "@/lib/booking/types";
import type { SquareProvider } from "@/lib/square/types";

type Props = {
  initialService?: string;
  initialProvider?: string;
  services: Service[];
  providers: SquareProvider[];
  categories: string[];
  liveSquare: boolean;
  squareApplicationId: string;
  squareLocationId: string;
  squareEnvironment: "sandbox" | "production";
};

export function BookingFlow({ initialService, initialProvider, services, providers, categories, liveSquare, squareApplicationId, squareLocationId, squareEnvironment }: Props) {
  const validService = services.find((item) => item.slug === initialService)?.slug;
  const validProvider = providers.find((item) => item.slug === initialProvider)?.slug;
  const [step, setStep] = useState(validService ? 2 : 1);
  const [serviceSlug, setServiceSlug] = useState(validService ?? "");
  const [providerSlug, setProviderSlug] = useState(validProvider ?? "any");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedProviderId, setSelectedProviderId] = useState("");
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [booking, setBooking] = useState<BookingResult>();
  const [complete, setComplete] = useState(false);
  const [cardReady, setCardReady] = useState(false);
  const cardSecurityRef = useRef<BookingCardSecurityHandle>(null);
  const service = services.find((item) => item.slug === serviceSlug);
  const provider = providers.find((item) => item.slug === providerSlug) ?? providers.find((item) => item.squareId === selectedProviderId);
  const eligibleProviders = useMemo(() => providers.filter((member) => !serviceSlug || member.serviceSlugs.includes(serviceSlug)), [providers, serviceSlug]);
  const handleCardReadyChange = useCallback((ready: boolean) => setCardReady(ready), []);

  useEffect(() => {
    if (step !== 3 || !serviceSlug) return;
    const controller = new AbortController();
    fetch(`/api/booking/availability?service=${serviceSlug}${providerSlug !== "any" ? `&provider=${providerSlug}` : ""}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data) => { if (!controller.signal.aborted) setAvailability(data.availability ?? []); })
      .catch(() => { if (!controller.signal.aborted) setAvailability([]); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [step, serviceSlug, providerSlug]);

  const grouped = useMemo(() => availability.reduce<Record<string, Availability[]>>((result, slot) => { const key = dateKey(slot.startAt); result[key] = [...(result[key] ?? []), slot]; return result; }, {}), [availability]);
  function resetSubmission() { setSubmitError(""); setIdempotencyKey(""); setBooking(undefined); }
  function selectService(slug: string) { setServiceSlug(slug); if (providerSlug !== "any" && !providers.find((member) => member.slug === providerSlug)?.serviceSlugs.includes(slug)) setProviderSlug("any"); setSelectedTime(""); setSelectedProviderId(""); resetSubmission(); setStep(2); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function selectProvider(slug: string) { setProviderSlug(slug); setSelectedTime(""); setSelectedProviderId(""); resetSubmission(); setLoading(true); setStep(3); }
  async function submitDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTime || !selectedProviderId) return setSubmitError("Choose an appointment time again before confirming.");
    const form = new FormData(event.currentTarget);
    const firstName = String(form.get("firstName") ?? "").trim();
    const lastName = String(form.get("lastName") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const policyAccepted = form.get("policyAccepted") === "true";
    const saveCardForFuture = form.get("saveCardForFuture") === "true";
    if (!policyAccepted) return setSubmitError("Accept the cancellation and no-show policy to continue.");
    if (!cardSecurityRef.current || !cardReady) return setSubmitError("Secure card entry is still loading.");
    const key = idempotencyKey || crypto.randomUUID();
    setIdempotencyKey(key);
    setSubmitting(true);
    setSubmitError("");
    try {
      const cardSourceId = await cardSecurityRef.current.tokenize({ givenName: firstName, familyName: lastName, email, phone });
      const response = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceSlug,
          providerSlug,
          providerId: selectedProviderId,
          startAt: selectedTime,
          idempotencyKey: key,
          customer: {
            firstName,
            lastName,
            email,
            phone,
          },
          note: form.get("note"),
          cardSourceId,
          policyAccepted,
          saveCardForFuture,
        }),
      });
      const result = await response.json() as { booking?: BookingResult; error?: string };
      if (!response.ok || !result.booking) throw new Error(result.error ?? "The appointment could not be confirmed.");
      setBooking(result.booking);
      setComplete(true);
      setStep(5);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "The appointment could not be confirmed.");
    } finally {
      setSubmitting(false);
    }
  }
  const progress = Math.min(step, 4);

  return <div className="container-site py-10 sm:py-16">
    <div className="mb-9 flex items-center justify-between gap-5"><h1 className="font-display text-4xl sm:text-5xl">{complete ? "You’re all set." : "Book your visit"}</h1>{!complete && <span className="hidden text-xs text-[#676767] sm:block">Step {progress} of 4</span>}</div>
    {!complete && <div className="mb-10 grid grid-cols-4 gap-2" aria-label={`Step ${progress} of 4`}>{[1,2,3,4].map((item) => <div key={item} className={`h-1.5 rounded-full ${item <= progress ? "bg-[#893d3e]" : "bg-[#e4ded4]"}`} />)}</div>}
    <div className="grid gap-7 lg:grid-cols-[1fr_330px]">
      <div className="paper-card min-h-[560px] p-5 sm:p-8">
        {step === 1 && <div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#893d3e]">Choose a service</p><h2 className="font-display mt-2 text-3xl">What would feel good?</h2><div className="mt-7 space-y-8">{categories.map((category) => <section key={category}><h3 className="mb-3 text-xs font-bold text-[#33373d]">{category}</h3><div className="grid gap-2 sm:grid-cols-2">{services.filter((item) => item.category === category).map((item) => <button key={item.slug} onClick={() => selectService(item.slug)} className="flex min-h-20 items-center justify-between rounded-2xl border border-[#e4ded4] bg-white p-4 text-left transition hover:border-[#893d3e] hover:bg-[#f6f5e9]"><span><span className="block text-sm font-bold">{item.name}</span><span className="mt-1 block text-xs text-[#676767]">{item.price}{item.duration ? ` · ${item.duration}` : ""}</span></span><ArrowRight size={15} className="shrink-0 text-[#893d3e]" /></button>)}</div></section>)}</div></div>}
        {step === 2 && <div><button onClick={() => setStep(1)} className="mb-6 flex items-center gap-2 text-xs font-bold text-[#676767]"><ArrowLeft size={14} /> Change service</button><p className="text-xs font-bold uppercase tracking-[.14em] text-[#893d3e]">Choose a specialist</p><h2 className="font-display mt-2 text-3xl">Who would you like to see?</h2><div className="mt-7 grid gap-3 sm:grid-cols-2"><button onClick={() => selectProvider("any")} className="flex min-h-28 items-center gap-4 rounded-2xl border border-[#e4ded4] bg-white p-4 text-left hover:border-[#893d3e]"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#f6f5e9] text-[#893d3e]"><CalendarDays size={20} /></span><span><span className="block text-sm font-bold">First available</span><span className="mt-1 block text-xs leading-5 text-[#676767]">Show the soonest opening with any qualified specialist.</span></span></button>{eligibleProviders.map((member) => <button key={member.slug} onClick={() => selectProvider(member.slug)} className="flex min-h-28 items-center gap-4 rounded-2xl border border-[#e4ded4] bg-white p-4 text-left hover:border-[#893d3e]"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#f6f5e9] text-[#893d3e]"><UserRound size={20} /></span><span><span className="block text-sm font-bold">{member.name}</span><span className="mt-1 block text-xs text-[#676767]">{member.role}</span></span></button>)}<a href="https://book-a-massage-today.square.site/" target="_blank" rel="noreferrer" className="flex min-h-28 items-center gap-4 rounded-2xl border border-[#e4ded4] bg-white p-4 text-left hover:border-[#893d3e]"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#f6f5e9] text-[#893d3e]"><ExternalLink size={19} /></span><span><span className="block text-sm font-bold">Holli Simme</span><span className="mt-1 block text-xs leading-5 text-[#676767]">Continue to Holli’s secure Square booking site.</span></span></a></div></div>}
        {step === 3 && <div><button onClick={() => setStep(2)} className="mb-6 flex items-center gap-2 text-xs font-bold text-[#676767]"><ArrowLeft size={14} /> Change specialist</button><p className="text-xs font-bold uppercase tracking-[.14em] text-[#893d3e]">Choose a time</p><h2 className="font-display mt-2 text-3xl">Find a time that works.</h2>{loading ? <div className="grid min-h-[360px] place-items-center"><LoaderCircle className="animate-spin text-[#893d3e]" /></div> : Object.keys(grouped).length ? <div className="mt-7 space-y-7">{Object.entries(grouped).map(([day, slots]) => <section key={day}><h3 className="mb-3 text-sm font-bold">{formatDay(day)}</h3><div className="flex flex-wrap gap-2">{slots.map((slot) => { const slotProvider = providers.find((item) => item.squareId === slot.providerId); const selected = selectedTime === slot.startAt && selectedProviderId === (slot.providerId ?? ""); return <button key={`${slot.startAt}-${slot.providerId ?? "any"}`} onClick={() => { setSelectedTime(slot.startAt); setSelectedProviderId(slot.providerId ?? ""); resetSubmission(); }} className={`rounded-full border px-4 py-2.5 text-xs font-bold ${selected ? "border-[#893d3e] bg-[#893d3e] text-white" : "border-[#d8cfc5] bg-white hover:border-[#893d3e]"}`}>{slot.label}{providerSlug === "any" && slotProvider ? ` · ${slotProvider.name.split(" ")[0]}` : ""}</button>; })}</div></section>)}</div> : <div className="mt-8 rounded-2xl bg-[#f6f5e9] p-7 text-sm leading-7 text-[#676767]">No online openings were returned for the next four weeks. Try another specialist or contact the spa for help.</div>}<button disabled={!selectedTime || !selectedProviderId} onClick={() => setStep(4)} className="button-primary mt-8 w-full disabled:cursor-not-allowed disabled:opacity-40">Continue <ArrowRight size={15} /></button></div>}
        {step === 4 && <form onSubmit={submitDetails}><button type="button" onClick={() => setStep(3)} className="mb-6 flex items-center gap-2 text-xs font-bold text-[#676767]"><ArrowLeft size={14} /> Change time</button><p className="text-xs font-bold uppercase tracking-[.14em] text-[#893d3e]">Your details</p><h2 className="font-display mt-2 text-3xl">Almost there.</h2><div className="mt-7 grid gap-4 sm:grid-cols-2"><Field label="First name" name="firstName" autoComplete="given-name" /><Field label="Last name" name="lastName" autoComplete="family-name" /><Field label="Email address" name="email" type="email" autoComplete="email" /><Field label="Mobile number" name="phone" type="tel" autoComplete="tel" /></div><label className="mt-4 block text-xs font-bold text-[#33373d]">Anything we should know? <span className="font-normal text-[#777777]">Optional</span><textarea name="note" maxLength={500} rows={4} className="mt-2 w-full resize-none rounded-xl border border-[#d8cfc5] bg-white p-4 font-normal outline-none focus:border-[#893d3e]" /></label><BookingCardSecurity ref={cardSecurityRef} applicationId={squareApplicationId} locationId={squareLocationId} environment={squareEnvironment} onReadyChange={handleCardReadyChange} />{submitError && <div role="alert" className="mt-5 rounded-2xl bg-[#f8e8e5] p-4 text-sm leading-6 text-[#713335]">{submitError}</div>}<button disabled={submitting || !cardReady} className="button-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60" type="submit">{submitting ? <><LoaderCircle size={15} className="animate-spin" /> Securing & confirming…</> : <>Secure card & confirm <ArrowRight size={15} /></>}</button><p className="mt-4 flex items-center justify-center gap-1.5 text-[.68rem] text-[#777777]"><LockKeyhole size={12} /> Your appointment is created securely in Square. No payment is collected today.</p></form>}
        {step === 5 && booking && <div className="grid min-h-[500px] place-items-center text-center"><div><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#f6f5e9] text-[#893d3e]"><CheckCircle2 size={30} /></span><p className="mt-6 text-xs font-bold uppercase tracking-[.15em] text-[#893d3e]">Appointment confirmed</p><h2 className="font-display mt-3 text-4xl">We’ll see you soon.</h2><p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#676767]">Your {service?.name} appointment with {provider?.name} is booked for {formatAppointment(booking.startsAt)}.</p><p className="mt-4 text-xs text-[#777777]">Confirmation: <span className="font-mono font-bold text-[#33373d]">{booking.id}</span></p><p className="mt-2 text-xs text-[#777777]">Secured with {booking.securedCard.brand} ending in {booking.securedCard.last4}{booking.securedCard.savedForFuture ? " · saved for future visits" : " · appointment only"}</p><p className="mx-auto mt-5 max-w-md text-xs leading-6 text-[#777777]">Need to make a change? Call the spa at <a className="font-bold text-[#893d3e]" href="tel:+17166523080">(716) 652-3080</a>. The 24-hour cancellation policy applies.</p><button onClick={() => { setStep(1); setComplete(false); setServiceSlug(""); setSelectedTime(""); setSelectedProviderId(""); resetSubmission(); }} className="button-secondary mt-7">Book another visit</button></div></div>}
      </div>
      <aside className="h-fit rounded-3xl bg-[#00032c] p-6 text-white lg:sticky lg:top-[110px]"><p className="text-[.65rem] font-bold uppercase tracking-[.14em] text-[#e3af23]">Your visit</p>{service ? <><h2 className="font-display mt-4 text-3xl">{service.name}</h2><p className="mt-2 text-sm text-white/60">{service.category}</p><dl className="mt-6 space-y-4 border-t border-white/15 pt-5 text-xs"><div className="flex justify-between gap-4"><dt className="text-white/50">Price</dt><dd className="text-right font-bold">{service.price}</dd></div>{service.duration && <div className="flex justify-between gap-4"><dt className="text-white/50">Duration</dt><dd className="text-right font-bold">{service.duration}</dd></div>}<div className="flex justify-between gap-4"><dt className="text-white/50">Specialist</dt><dd className="text-right font-bold">{provider?.name ?? (providerSlug === "any" ? "First available" : "Not selected")}</dd></div>{selectedTime && <div className="flex justify-between gap-4"><dt className="text-white/50">Time</dt><dd className="text-right font-bold">{formatAppointment(selectedTime)}</dd></div>}</dl></> : <p className="mt-4 text-sm leading-6 text-white/55">Choose a service to see your visit details here.</p>}<div className="mt-7 rounded-2xl bg-white/8 p-4"><p className="flex gap-2 text-xs font-bold"><Check size={14} className="text-[#e3af23]" /> No payment today</p><p className="mt-2 text-[.68rem] leading-5 text-white/45">A card secures every appointment. A 50% fee applies to cancellations within 24 hours and no-shows.</p><p className="mt-3 text-[.68rem] leading-5 text-white/45">{liveSquare ? "Services, pricing, specialists, openings, and confirmations are handled securely through Square." : "Square is temporarily unavailable. Online appointments cannot be confirmed until the connection is restored."}</p></div></aside>
    </div>
  </div>;
}

function Field({ label, name, type = "text", autoComplete }: { label: string; name: string; type?: string; autoComplete?: string }) { return <label className="text-xs font-bold text-[#33373d]">{label}<input required name={name} type={type} autoComplete={autoComplete} className="mt-2 h-12 w-full rounded-xl border border-[#d8cfc5] bg-white px-4 font-normal outline-none focus:border-[#893d3e]" /></label>; }

function dateKey(value: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function formatDay(value: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
}

function formatAppointment(value: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York", timeZoneName: "short" }).format(new Date(value));
}
