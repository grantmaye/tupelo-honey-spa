"use client";

import { CheckCircle2, Send } from "lucide-react";
import { FormEvent, useState } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSent(true); }
  if (sent) return <div className="paper-card grid min-h-[470px] place-items-center p-10 text-center"><div><CheckCircle2 size={38} className="mx-auto text-[#893d3e]" /><h2 className="font-display mt-5 text-4xl">Message ready.</h2><p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-[#676767]">The live contact delivery will be connected before launch. For now, email or call the spa directly.</p><a href="mailto:tupelohoneyspa@gmail.com" className="button-primary mt-6">Email the spa</a></div></div>;
  return <form onSubmit={submit} className="paper-card p-7 sm:p-9"><div className="grid gap-5 sm:grid-cols-2"><label className="text-xs font-bold text-[#33373d]">First name<input required name="firstName" className="mt-2 h-12 w-full rounded-xl border border-[#d8cfc5] bg-white px-4 text-sm font-normal outline-none focus:border-[#893d3e]" /></label><label className="text-xs font-bold text-[#33373d]">Last name<input required name="lastName" className="mt-2 h-12 w-full rounded-xl border border-[#d8cfc5] bg-white px-4 text-sm font-normal outline-none focus:border-[#893d3e]" /></label></div><label className="mt-5 block text-xs font-bold text-[#33373d]">Email address<input required type="email" name="email" className="mt-2 h-12 w-full rounded-xl border border-[#d8cfc5] bg-white px-4 text-sm font-normal outline-none focus:border-[#893d3e]" /></label><label className="mt-5 block text-xs font-bold text-[#33373d]">What can we help with?<textarea required name="message" rows={6} className="mt-2 w-full resize-none rounded-xl border border-[#d8cfc5] bg-white p-4 text-sm font-normal leading-6 outline-none focus:border-[#893d3e]" /></label><button className="button-primary mt-5 w-full" type="submit">Send message <Send size={15} /></button><p className="mt-4 text-center text-[.68rem] leading-5 text-[#777777]">Demo form. Message delivery will be connected before launch.</p></form>;
}
