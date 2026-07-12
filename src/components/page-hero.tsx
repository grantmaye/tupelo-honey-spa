export function PageHero({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <section className="grain bg-[#efe5d8] py-20 sm:py-28"><div className="container-site"><span className="eyebrow">{eyebrow}</span><div className="mt-6 grid gap-7 lg:grid-cols-[1.15fr_.55fr] lg:items-end"><h1 className="font-display max-w-4xl text-6xl leading-[.9] sm:text-8xl">{title}</h1><p className="max-w-md text-sm leading-7 text-[#6f6258] sm:text-base">{copy}</p></div></div></section>;
}
