import type { Metadata } from "next";
import { ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { getWordPressSpecialEventsContent } from "@/lib/wordpress";

export const metadata: Metadata = { title: "Special Events", description: "Host a birthday, bachelorette party, wellness workshop, team event, or group spa experience at Tupelo Honey Spa." };

const eventTypes = ["Birthday parties for kids and adults", "Bachelorette parties", "Kiki’s dress-up and makeover parties", "Staff and team building", "Wellness workshops and events", "Group pricing on spa services"];
export default async function SpecialEventsPage() {
  const content = await getWordPressSpecialEventsContent();
  return <><PageHero eyebrow="Parties & Special Events" title={content.title} copy={content.paragraphs[0]} /><section className="bg-white py-20 sm:py-24"><div className="container-site grid gap-14 lg:grid-cols-[.9fr_1.1fr] lg:items-center"><div><span className="eyebrow">We love to host</span><h2 className="font-display mt-5 text-4xl text-[#33373d] sm:text-5xl">Play, learn, celebrate, and take care of yourselves.</h2><p className="mt-6 text-base leading-8 text-[#676767]">{content.paragraphs[0]}</p><div className="mt-7 grid gap-3 sm:grid-cols-2">{eventTypes.map((type) => <div key={type} className="flex items-start gap-3 text-sm leading-6 text-[#4f4f4f]"><span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#e3af23] text-white"><Check size={12} /></span>{type}</div>)}</div><Link href="/contact" className="button-primary mt-9 !rounded-[3px]">Plan Your Event <ArrowRight size={16} /></Link></div><div className="grid grid-cols-2 gap-3"><div className="relative col-span-2 aspect-[16/9] overflow-hidden rounded-2xl"><Image src={content.images[0]} alt="A special event at Tupelo Honey Spa" fill unoptimized className="object-cover" /></div>{content.images.slice(1).map((src, index) => <div key={src} className="relative aspect-square overflow-hidden rounded-2xl"><Image src={src} alt={`Tupelo Honey special event ${index + 2}`} fill unoptimized className="object-cover" /></div>)}</div></div></section><section className="bg-[#00032c] py-20 text-center text-white"><div className="container-site"><h2 className="font-display text-4xl sm:text-6xl">Have something else in mind?</h2><p className="mx-auto mt-5 max-w-xl leading-7 text-white/70">{content.paragraphs[1] ?? "Our staff has an abundance of talents to share. Send us a note and let’s create something together."}</p><a href="mailto:tupelohoneyspa@gmail.com?subject=Special%20Event%20Inquiry" className="button-primary mt-8 !rounded-[3px]">Email Tupelo Honey</a></div></section></>;
}
