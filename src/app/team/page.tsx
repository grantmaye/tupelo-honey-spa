import type { Metadata } from "next";
import { ArrowRight, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/page-hero";
import { team } from "@/data/site";

export const metadata: Metadata = { title: "Our Collective", description: "Meet the independent beauty and wellness specialists at Tupelo Honey Spa." };

export default function TeamPage() {
  return <><PageHero eyebrow="Our collective" title="Good people. Great at what they do." copy="An independent collective of experienced practitioners, each bringing their own specialty and all sharing the same commitment to kind, expert care." /><section className="section-pad"><div className="container-site grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{team.map((member, index) => <article key={member.slug} className={index === 0 ? "sm:col-span-2 lg:col-span-1" : ""}><div className="relative aspect-[4/5] overflow-hidden rounded-[11rem_11rem_1.5rem_1.5rem] bg-[#ead6cf]"><Image src={member.image} alt={member.name} fill unoptimized className="object-cover object-top saturate-[.8] transition duration-500 hover:scale-[1.025]" /></div><p className="mt-6 text-[.65rem] font-bold uppercase tracking-[.14em] text-[#893d3e]">{member.role}</p><h2 className="font-display mt-2 text-3xl">{member.name}</h2><p className="mt-3 text-sm leading-6 text-[#676767]">{member.bio}</p><div className="mt-4 flex flex-wrap gap-2">{member.specialties.map((specialty) => <span key={specialty} className="rounded-full border border-[#e4ded4] px-3 py-1.5 text-[.68rem] font-semibold text-[#676767]">{specialty}</span>)}</div>{member.externalBooking ? <a href={member.externalBooking} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#893d3e]">Book with {member.name.split(" ")[0]} <ExternalLink size={14} /></a> : <Link href={`/book?provider=${member.slug}`} className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#893d3e]">View appointments <ArrowRight size={14} /></Link>}</article>)}</div></section></>;
}
