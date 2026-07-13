"use client";

import { ExternalLink, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "./brand-mark";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "https://squareup.com/gift/VCQDNPYY0EWDH/order", label: "Gift Cards", external: true },
  { href: "/contact", label: "Contact" },
  { href: "/special-events", label: "Special Events" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/96 backdrop-blur-xl">
      <div className="container-site flex h-[84px] items-center justify-between lg:h-[118px]">
        <BrandMark />
        <nav aria-label="Primary navigation" className="hidden items-center gap-7 xl:flex">
          {links.map((link) => link.external ? (
            <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="text-[.92rem] font-medium text-black transition-colors hover:text-[#893d3e]">{link.label}</a>
          ) : (
            <Link key={link.href} href={link.href} className={`border-b-2 py-2 text-[.92rem] font-medium transition-colors hover:text-[#893d3e] ${pathname === link.href ? "border-[#33373d] text-black" : "border-transparent text-black"}`}>{link.label}</Link>
          ))}
          <Link href="/book" className="button-primary !min-h-[44px] !rounded-[3px] !px-6">Book Now</Link>
        </nav>
        <button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-[#e4ded4] xl:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"}>{open ? <X size={19} /> : <Menu size={19} />}</button>
      </div>
      {open && (
        <nav id="mobile-menu" aria-label="Mobile navigation" className="border-t border-[#e4ded4] bg-white px-5 pb-7 pt-3 xl:hidden">
          <div className="mx-auto flex max-w-xl flex-col">
            {links.map((link) => link.external ? <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="flex items-center justify-between border-b border-[#e4ded4] py-4 text-lg font-semibold">{link.label}<ExternalLink size={15} /></a> : <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="border-b border-[#e4ded4] py-4 text-lg font-semibold">{link.label}</Link>)}
            <Link href="/book" onClick={() => setOpen(false)} className="button-primary mt-6 !rounded-[3px]">Book Now</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
