"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { team } from "@/data/site";
import { BrandMark } from "./brand-mark";

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/gift-cards", label: "Gift Cards" },
  { href: "/contact", label: "Contact" },
  { href: "/special-events", label: "Special Events" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const pathname = usePathname();

  const navClass = (href: string) =>
    `border-b-2 py-2 text-[.92rem] font-medium text-black transition-colors hover:text-[#893d3e] ${
      pathname === href ? "border-[#33373d]" : "border-transparent"
    }`;

  function closeMenu() {
    setOpen(false);
    setAboutOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/96 backdrop-blur-xl">
      <div className="container-site flex h-[84px] items-center justify-between lg:h-[118px]">
        <BrandMark />

        <nav aria-label="Primary navigation" className="hidden items-center gap-7 xl:flex">
          <Link href="/" className={navClass("/")}>Home</Link>

          <div className="group relative flex items-center" data-active={pathname.startsWith("/about") || pathname === "/team"}>
            <Link href="/about" className={`flex items-center gap-1.5 ${navClass("/about")} group-data-[active=true]:border-[#33373d]`}>
              About Us <ChevronDown size={14} aria-hidden="true" />
            </Link>
            <div className="invisible absolute left-1/2 top-full w-64 -translate-x-1/2 translate-y-2 pt-4 opacity-0 transition duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
              <div className="rounded-2xl border border-[#e4ded4] bg-white p-2 shadow-[0_20px_55px_#00032c1a]">
                <Link href="/about" className="block rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-[#f6f5e9]">Our Story</Link>
                <Link href="/team" className="block rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-[#f6f5e9]">Meet the Collective</Link>
                <div className="my-2 border-t border-[#e4ded4]" />
                {team.map((member) => (
                  <Link key={member.slug} href={`/about/${member.slug}`} className="block rounded-xl px-4 py-2 text-sm text-[#676767] hover:bg-[#ead6cf]/55 hover:text-[#893d3e]">
                    {member.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {links.slice(1).map((link) => (
            <Link key={link.href} href={link.href} className={navClass(link.href)}>{link.label}</Link>
          ))}
          <Link href="/book" className="button-primary !min-h-[44px] !rounded-[3px] !px-6">Book Now</Link>
        </nav>

        <button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-[#e4ded4] xl:hidden" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "Close menu" : "Open menu"}>
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Mobile navigation" className="max-h-[calc(100vh-84px)] overflow-y-auto border-t border-[#e4ded4] bg-white px-5 pb-7 pt-3 xl:hidden">
          <div className="mx-auto flex max-w-xl flex-col">
            <Link href="/" onClick={closeMenu} className="border-b border-[#e4ded4] py-4 text-lg font-semibold">Home</Link>
            <button type="button" onClick={() => setAboutOpen((value) => !value)} className="flex items-center justify-between border-b border-[#e4ded4] py-4 text-left text-lg font-semibold" aria-expanded={aboutOpen}>
              About Us <ChevronDown size={17} className={`transition-transform ${aboutOpen ? "rotate-180" : ""}`} />
            </button>
            {aboutOpen && (
              <div className="border-b border-[#e4ded4] bg-[#f6f5e9] px-3 py-2">
                <Link href="/about" onClick={closeMenu} className="block rounded-lg px-3 py-3 font-semibold">Our Story</Link>
                <Link href="/team" onClick={closeMenu} className="block rounded-lg px-3 py-3 font-semibold">Meet the Collective</Link>
                {team.map((member) => <Link key={member.slug} href={`/about/${member.slug}`} onClick={closeMenu} className="block rounded-lg px-3 py-2.5 text-sm text-[#676767]">{member.name}</Link>)}
              </div>
            )}
            {links.slice(1).map((link) => <Link key={link.href} href={link.href} onClick={closeMenu} className="border-b border-[#e4ded4] py-4 text-lg font-semibold">{link.label}</Link>)}
            <Link href="/book" onClick={closeMenu} className="button-primary mt-6 !rounded-[3px]">Book Now</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
