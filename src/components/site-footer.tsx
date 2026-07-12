import { ArrowUpRight, MapPin } from "lucide-react";
import Link from "next/link";
import { BrandMark } from "./brand-mark";

export function SiteFooter() {
  return (
    <footer className="bg-[#302923] text-[#f9f3e9]">
      <div className="container-site grid gap-12 py-16 md:grid-cols-[1.35fr_.7fr_.7fr]">
        <div><BrandMark light /><p className="mt-6 max-w-sm text-sm leading-7 text-white/65">A comfortable oasis for expert beauty and wellness care—without judgment, pressure, or pretense.</p><a href="https://maps.google.com/?q=2330+Bowen+Road+Elma+NY+14059" target="_blank" rel="noreferrer" className="mt-6 flex items-start gap-3 text-sm text-white/75 hover:text-white"><MapPin size={18} className="mt-0.5 shrink-0" />2330 Bowen Road<br />Elma, NY 14059</a></div>
        <div><p className="mb-4 text-xs font-bold uppercase tracking-[.16em] text-[#d9a351]">Explore</p><div className="flex flex-col gap-3 text-sm text-white/70"><Link href="/services">Services</Link><Link href="/team">Our collective</Link><Link href="/about">About the spa</Link><Link href="/contact">Contact</Link><a href="https://squareup.com/gift/VCQDNPYY0EWDH/order" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">Gift cards <ArrowUpRight size={13} /></a></div></div>
        <div><p className="mb-4 text-xs font-bold uppercase tracking-[.16em] text-[#d9a351]">Visit</p><p className="text-sm leading-7 text-white/70">Monday–Friday · 9–9<br />Saturday · 9–7<br /><span className="text-xs text-white/45">Hours vary by appointment.</span></p><div className="mt-6 flex gap-3"><a href="https://www.instagram.com/tupelohoneyspa/" aria-label="Instagram" target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-[.65rem] font-bold uppercase tracking-wider hover:bg-white/10">IG</a><a href="https://www.facebook.com/tupelohoneyspa" aria-label="Facebook" target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full border border-white/15 font-display text-lg hover:bg-white/10">f</a></div></div>
      </div>
      <div className="border-t border-white/10"><div className="container-site flex flex-col gap-2 py-5 text-[.72rem] text-white/40 sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} Tupelo Honey LLC</span><span>Designed with care in Elma, New York.</span></div></div>
    </footer>
  );
}
