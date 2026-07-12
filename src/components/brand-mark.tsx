import Link from "next/link";

export function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" aria-label="Tupelo Honey Spa home" className="group inline-flex items-center gap-3">
      <span className={`grid h-10 w-10 place-items-center rounded-full border ${light ? "border-white/35 text-white" : "border-[#b96447]/35 text-[#9b3f29]"}`}>
        <svg aria-hidden="true" viewBox="0 0 40 40" className="h-7 w-7 fill-none stroke-current" strokeWidth="1.3">
          <path d="M20 32.5c0-10 5.2-15.8 11-19.5-1 8.5-3.6 15.6-11 19.5Z" />
          <path d="M20 32.5C20 23 15.4 16.4 8.5 12c.9 9.7 4.6 17 11.5 20.5Z" />
          <path d="M20 32.5V8" />
          <path d="M15 12.5c0-3 2-5.5 5-6.5 3 1 5 3.5 5 6.5" />
        </svg>
      </span>
      <span className="leading-none">
        <span className={`font-display block text-[1.42rem] ${light ? "text-white" : "text-[#392f29]"}`}>Tupelo Honey</span>
        <span className={`mt-1 block text-[.58rem] font-bold uppercase tracking-[.26em] ${light ? "text-white/65" : "text-[#8c796d]"}`}>Spa & Wellness Collective</span>
      </span>
    </Link>
  );
}
