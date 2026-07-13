export function PageHero({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <section className="grain bg-[#ead6cf] py-16 text-center sm:py-20"><div className="container-site"><span className="eyebrow justify-center before:hidden">{eyebrow}</span><h1 className="font-display mx-auto mt-5 max-w-4xl text-5xl leading-[.95] text-[#33373d] sm:text-6xl">{title}</h1><p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#676767] sm:text-base">{copy}</p></div></section>;
}
