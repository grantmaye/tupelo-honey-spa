"use client";

import { CheckCircle2, LoaderCircle, Send } from "lucide-react";
import { FormEvent, useState } from "react";

const directEmail = "tupelohoneyspa@gmail.com";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setSending(true);
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.get("firstName"),
          lastName: form.get("lastName"),
          email: form.get("email"),
          message: form.get("message"),
          website: form.get("website"),
        }),
      });
      const result = await response.json() as { success?: boolean; error?: string };
      if (!response.ok || !result.success) throw new Error(result.error ?? "Your message could not be sent.");
      formElement.reset();
      setSent(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Your message could not be sent.");
    } finally {
      setSending(false);
    }
  }

  if (sent) return (
    <div className="paper-card grid min-h-[470px] place-items-center p-10 text-center">
      <div>
        <CheckCircle2 size={38} className="mx-auto text-[#893d3e]" />
        <h2 className="font-display mt-5 text-4xl">Message sent.</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-[#676767]">Thank you for reaching out. The Tupelo Honey team will get back to you as soon as they can.</p>
        <button type="button" onClick={() => setSent(false)} className="button-secondary mt-6">Send another message</button>
      </div>
    </div>
  );

  return (
    <form onSubmit={submit} className="paper-card p-7 sm:p-9">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name" name="firstName" autoComplete="given-name" />
        <Field label="Last name" name="lastName" autoComplete="family-name" />
      </div>
      <Field label="Email address" name="email" type="email" autoComplete="email" className="mt-5" />
      <label className="mt-5 block text-xs font-bold text-[#33373d]">What can we help with?
        <textarea required name="message" maxLength={4000} rows={6} className="mt-2 w-full resize-none rounded-xl border border-[#d8cfc5] bg-white p-4 text-sm font-normal leading-6 outline-none focus:border-[#893d3e]" />
      </label>
      <label className="absolute -left-[10000px]" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      {error && <div role="alert" className="mt-5 rounded-2xl bg-[#f8e8e5] p-4 text-sm leading-6 text-[#713335]">{error} You can also <a className="font-bold underline" href={`mailto:${directEmail}`}>email the spa directly</a>.</div>}
      <button disabled={sending} className="button-primary mt-5 w-full disabled:cursor-wait disabled:opacity-60" type="submit">
        {sending ? <><LoaderCircle size={15} className="animate-spin" /> Sending…</> : <>Send message <Send size={15} /></>}
      </button>
      <p className="mt-4 text-center text-[.68rem] leading-5 text-[#777777]">Please do not include sensitive medical or payment information.</p>
    </form>
  );
}

function Field({ label, name, type = "text", autoComplete, className = "" }: { label: string; name: string; type?: string; autoComplete?: string; className?: string }) {
  return <label className={`block text-xs font-bold text-[#33373d] ${className}`}>{label}<input required name={name} type={type} autoComplete={autoComplete} maxLength={type === "email" ? 254 : 80} className="mt-2 h-12 w-full rounded-xl border border-[#d8cfc5] bg-white px-4 text-sm font-normal outline-none focus:border-[#893d3e]" /></label>;
}
