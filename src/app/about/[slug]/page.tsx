import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, ExternalLink, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { team } from "@/data/site";

type ProfilePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return team.map((member) => ({ slug: member.slug }));
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const member = team.find((item) => item.slug === slug);
  if (!member) return {};
  return {
    title: member.name,
    description: `Meet ${member.name}, ${member.role.toLowerCase()} at Tupelo Honey Spa in Elma, NY.`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params;
  const member = team.find((item) => item.slug === slug);
  if (!member) notFound();

  return (
    <>
      <section className="overflow-hidden bg-[#ead6cf] py-12 sm:py-20">
        <div className="container-site grid gap-10 lg:grid-cols-[.82fr_1.18fr] lg:items-center">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[520px] overflow-hidden rounded-[12rem_12rem_1.5rem_1.5rem] bg-white/45">
            <Image src={member.image} alt={member.name} fill priority unoptimized className="object-cover object-top saturate-[.88]" />
          </div>
          <div className="max-w-2xl">
            <Link href="/team" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-[#893d3e]"><ArrowLeft size={14} /> Our Collective</Link>
            <p className="mt-10 text-xs font-bold uppercase tracking-[.16em] text-[#893d3e]">{member.role}</p>
            <h1 className="font-display mt-3 text-5xl leading-[.94] text-[#33373d] sm:text-7xl">{member.name}</h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-[#4f4f4f]">{member.bio}</p>
            <div className="mt-7 flex flex-wrap gap-2">
              {member.specialties.map((specialty) => <span key={specialty} className="rounded-full border border-[#893d3e]/20 bg-white/55 px-4 py-2 text-xs font-bold text-[#893d3e]">{specialty}</span>)}
            </div>
            {member.externalBooking ? (
              <a href={member.externalBooking} target="_blank" rel="noreferrer" className="button-primary mt-9 !rounded-[3px]">Book with {member.name.split(" ")[0]} <ExternalLink size={16} /></a>
            ) : (
              <Link href={`/book?provider=${member.slug}`} className="button-primary mt-9 !rounded-[3px]">Book with {member.name.split(" ")[0]} <ArrowRight size={16} /></Link>
            )}
          </div>
        </div>
      </section>

      <section className="bg-[#f6f5e9] py-20 sm:py-24">
        <div className="container-site grid gap-10 lg:grid-cols-[1fr_.72fr]">
          <div>
            <span className="eyebrow">Care that feels personal</span>
            <h2 className="font-display mt-5 max-w-2xl text-4xl leading-tight sm:text-6xl">A thoughtful approach, shaped around you.</h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#676767]">Every appointment at Tupelo Honey is designed to feel comfortable, clear, and unhurried. Ask questions, share what you need, and expect honest guidance from someone who genuinely cares about your experience.</p>
          </div>
          <aside className="rounded-3xl bg-[#00032c] p-8 text-white sm:p-10">
            <Sparkles className="text-[#e3af23]" size={24} />
            <p className="mt-7 text-xs font-bold uppercase tracking-[.15em] text-[#e3af23]">Services offered</p>
            <ul className="mt-5 space-y-4">
              {member.specialties.map((specialty) => <li key={specialty} className="border-b border-white/12 pb-4 text-lg font-semibold">{specialty}</li>)}
            </ul>
            <Link href="/services" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-white">Explore all services <ArrowRight size={15} /></Link>
          </aside>
        </div>
      </section>
    </>
  );
}
