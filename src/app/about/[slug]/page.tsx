import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, ExternalLink, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { team } from "@/data/site";
import { getSquareBookingData } from "@/lib/square/catalog";
import { getTeamMemberWithWordPress } from "@/lib/wordpress";

type ProfilePageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

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
  const [{ slug }, square] = await Promise.all([params, getSquareBookingData()]);
  const fallbackMember = team.find((item) => item.slug === slug);
  if (!fallbackMember) notFound();
  const member = await getTeamMemberWithWordPress(fallbackMember);
  const squareProvider = square.providers.find((provider) => provider.slug === member.slug);
  const offeredServices = squareProvider
    ? square.services.filter((service) => squareProvider.serviceSlugs.includes(service.slug))
    : [];

  return (
    <>
      <section className="overflow-hidden bg-[#ead6cf] py-12 sm:py-20">
        <div className="container-site grid gap-10 lg:grid-cols-[300px_1fr] lg:items-center">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[240px] overflow-hidden rounded-[10rem_10rem_1.5rem_1.5rem] bg-white/45">
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
            <div className="mt-6 max-w-2xl space-y-5 text-base leading-8 text-[#676767]">{member.fullBio?.length ? member.fullBio.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : <p>Every appointment at Tupelo Honey is designed to feel comfortable, clear, and unhurried. Ask questions, share what you need, and expect honest guidance from someone who genuinely cares about your experience.</p>}</div>
          </div>
          <aside className="rounded-3xl bg-[#00032c] p-8 text-white sm:p-10">
            <Sparkles className="text-[#e3af23]" size={24} />
            <p className="mt-7 text-xs font-bold uppercase tracking-[.15em] text-[#e3af23]">Services offered</p>
            {offeredServices.length ? <ul className="mt-5 max-h-[520px] space-y-3 overflow-y-auto pr-2">
              {offeredServices.map((service) => <li key={service.slug} className="border-b border-white/12 pb-3"><Link href={`/book?service=${service.slug}&provider=${member.slug}`} className="group flex items-start justify-between gap-4"><span className="text-sm font-semibold leading-6 group-hover:text-[#e3af23]">{service.name}</span><span className="shrink-0 text-xs text-white/55">{service.price}</span></Link></li>)}
            </ul> : <ul className="mt-5 space-y-4">
              {member.specialties.map((specialty) => <li key={specialty} className="border-b border-white/12 pb-4 text-lg font-semibold">{specialty}</li>)}
            </ul>}
            <Link href={squareProvider ? `/book?provider=${member.slug}` : "/services"} className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-white">{squareProvider ? `Book with ${member.name.split(" ")[0]}` : "Explore all services"} <ArrowRight size={15} /></Link>
          </aside>
        </div>
      </section>
    </>
  );
}
