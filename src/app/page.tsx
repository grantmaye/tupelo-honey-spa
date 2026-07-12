import { ArrowRight, CalendarDays, Heart, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { services, team } from "@/data/site";

const featured = services.filter((service) => service.featured).slice(0, 6);

export default function Home() {
  return (
    <>
      <section className="grain overflow-hidden bg-[#efe5d8]">
        <div className="container-site grid min-h-[720px] items-center gap-14 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
          <div className="relative z-10 max-w-2xl">
            <span className="eyebrow">Spa & wellness in Elma, NY</span>
            <h1 className="font-display mt-7 text-[clamp(3.7rem,7.2vw,7rem)] leading-[.86] text-[#352b25]">Feel good in<br /><em className="font-normal text-[#a5482f]">your own skin.</em></h1>
            <p className="mt-8 max-w-xl text-base leading-8 text-[#6d6056] sm:text-lg">Expert beauty and wellness care in a space that feels warm, personal, and completely judgment-free.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/book" className="button-primary">Find your appointment <ArrowRight size={16} /></Link><Link href="/services" className="button-secondary">Explore services</Link></div>
            <div className="mt-11 flex flex-wrap gap-x-8 gap-y-3 text-xs font-semibold text-[#75685e]"><span className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#9f4931]" /> Inclusive, expert care</span><span className="flex items-center gap-2"><CalendarDays size={16} className="text-[#9f4931]" /> Easy online booking</span></div>
          </div>
          <div className="relative mx-auto h-[510px] w-full max-w-[520px] lg:h-[600px]">
            <div className="absolute left-[2%] top-[3%] h-[78%] w-[76%] overflow-hidden rounded-[45%_45%_8rem_8rem] bg-[#c8aa90] shadow-[0_35px_80px_#4c30251c]">
              <Image src={team[0].image} alt="Julie from Tupelo Honey Spa" fill priority unoptimized className="object-cover object-top saturate-[.82]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#5c2d1f]/30 via-transparent to-transparent" />
            </div>
            <div className="absolute bottom-[1%] right-[1%] h-[44%] w-[48%] overflow-hidden rounded-[7rem_7rem_1.5rem_1.5rem] border-[8px] border-[#efe5d8] bg-[#ae8d73]">
              <Image src={team[5].image} alt="Abby from Tupelo Honey Spa" fill unoptimized className="object-cover object-top saturate-[.78]" />
            </div>
            <div className="absolute right-[0] top-[8%] grid h-28 w-28 place-items-center rounded-full bg-[#a5482f] text-center text-[.65rem] font-bold uppercase leading-5 tracking-[.14em] text-white shadow-xl sm:h-32 sm:w-32"><span>Care for<br />every body<br /><Heart size={14} className="mx-auto mt-1 fill-white" /></span></div>
            <svg aria-hidden="true" className="absolute bottom-[7%] left-[-4%] h-24 w-24 text-[#c18939]" viewBox="0 0 100 100"><path d="M50 92C49 58 65 34 88 14M50 92C50 55 32 33 10 20M53 72c13-1 23-6 31-15M47 68c-14-2-24-8-32-18M57 53c10-2 17-7 23-14M42 49c-10-3-17-8-22-15" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
          </div>
        </div>
      </section>

      <section className="border-y border-[#e8ddd0] bg-[#fffdf9] py-6">
        <div className="container-site flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-[.67rem] font-bold uppercase tracking-[.17em] text-[#76695e] sm:justify-between"><span>Waxing</span><span className="text-[#d29a49]">✦</span><span>Facials</span><span className="text-[#d29a49]">✦</span><span>Massage</span><span className="text-[#d29a49]">✦</span><span>Laser</span><span className="text-[#d29a49]">✦</span><span>Reiki</span><span className="text-[#d29a49]">✦</span><span>Brows & lashes</span></div>
      </section>

      <section className="section-pad">
        <div className="container-site">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"><div><span className="eyebrow">Made for real life</span><h2 className="font-display mt-5 max-w-2xl text-5xl leading-[.96] sm:text-6xl">Care that meets you<br />where you are.</h2></div><p className="max-w-sm text-sm leading-7 text-[#756a61]">Choose what you need today. Every service is delivered by an independent specialist who cares deeply about their craft.</p></div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((service, index) => <Link key={service.slug} href={`/book?service=${service.slug}`} className={`group paper-card relative overflow-hidden p-7 transition hover:-translate-y-1 hover:shadow-[0_22px_55px_#4d35240f] ${index === 0 ? "bg-[#a5482f] text-white" : ""}`}><div className={`mb-12 grid h-11 w-11 place-items-center rounded-full ${index === 0 ? "bg-white/15" : "bg-[#efe2d4] text-[#9f4931]"}`}><Sparkles size={18} /></div><p className={`text-[.65rem] font-bold uppercase tracking-[.14em] ${index === 0 ? "text-white/60" : "text-[#a5482f]"}`}>{service.category}</p><h3 className="font-display mt-2 text-3xl">{service.name}</h3><div className={`mt-5 flex items-center justify-between border-t pt-4 text-xs ${index === 0 ? "border-white/20 text-white/75" : "border-[#e8ddd0] text-[#756a61]"}`}><span>{service.price}{service.duration ? ` · ${service.duration}` : ""}</span><ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></div></Link>)}
          </div>
          <div className="mt-10 text-center"><Link href="/services" className="button-secondary">See all services <ArrowRight size={15} /></Link></div>
        </div>
      </section>

      <section className="overflow-hidden bg-[#737a64] text-white">
        <div className="container-site grid min-h-[620px] gap-12 py-20 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div className="relative h-[480px] max-w-[470px] overflow-hidden rounded-[14rem_14rem_2rem_2rem]"><Image src={team[2].image} alt="Janell from Tupelo Honey Spa" fill unoptimized className="object-cover object-top saturate-[.8]" /></div>
          <div><span className="eyebrow !text-[#f2c879]">The Tupelo difference</span><blockquote className="font-display mt-7 max-w-2xl text-5xl leading-[1.02] sm:text-6xl">“You don’t need fixing. You deserve care.”</blockquote><p className="mt-8 max-w-xl leading-8 text-white/70">This is a place to exhale. Our collective is built around skilled practitioners, honest recommendations, and the belief that beauty and wellness should feel welcoming—not intimidating.</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/about" className="button-light">Our approach <ArrowRight size={15} /></Link><Link href="/team" className="button-secondary !border-white/30 !text-white hover:!bg-white/10">Meet the collective</Link></div></div>
        </div>
      </section>

      <section className="section-pad bg-[#fffdf9]">
        <div className="container-site text-center"><span className="eyebrow">Ready when you are</span><h2 className="font-display mx-auto mt-5 max-w-3xl text-5xl leading-[.95] sm:text-7xl">Your next hour could feel very different.</h2><p className="mx-auto mt-6 max-w-xl leading-7 text-[#756a61]">Browse availability, choose your specialist, and make a little room for yourself.</p><Link href="/book" className="button-primary mt-8">Book your visit <ArrowRight size={16} /></Link></div>
      </section>
    </>
  );
}
