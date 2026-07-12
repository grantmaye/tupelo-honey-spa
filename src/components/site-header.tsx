"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "./brand-mark";

const links = [{ href: "/services", label: "Services" }, { href: "/team", label: "Our collective" }, { href: "/about", label: "About" }, { href: "/contact", label: "Contact" }];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-[#e8ddd0]/80 bg-[#fbf6ee]/92 backdrop-blur-xl">
      <div className="container-site flex h-[82px] items-center justify-between">
        <BrandMark />
        <nav aria-label="Primary navigation" className="hidden items-center gap-8 lg:flex">
          {links.map((link) => <Link key={link.href} href={link.href} className={`text-[.82rem] font-semibold transition-colors hover:text-[#a5482f] ${pathname === link.href ? "text-[#a5482f]" : "text-[#4e443d]"}`}>{link.label}</Link>)}
          <Link href="/book" className="button-primary !min-h-[44px]">Book an appointment</Link>
        </nav>
        <button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-[#d9cbbd] lg:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"}>{open ? <X size={19} /> : <Menu size={19} />}</button>
      </div>
      {open && (
        <nav id="mobile-menu" aria-label="Mobile navigation" className="border-t border-[#e8ddd0] bg-[#fbf6ee] px-5 pb-7 pt-4 lg:hidden">
          <div className="mx-auto flex max-w-xl flex-col">
            {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="border-b border-[#e8ddd0] py-4 font-display text-2xl">{link.label}</Link>)}
            <Link href="/book" onClick={() => setOpen(false)} className="button-primary mt-6">Book an appointment</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
