import { ArrowRight, Gift, Sparkles, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getWordPressHomeContent } from "@/lib/wordpress";

const offerings = [
  { name: "Laser & Waxing", copy: "Say hello to smooth, hair-free skin.", category: "Waxing" },
  { name: "Brow Shaping & Microblading", copy: "Precision and artistry for beautiful brows.", category: "Brows & Lashes" },
  { name: "Facials", copy: "Customized treatments for healthy, radiant skin.", category: "Facials" },
  { name: "Lash Enhancements", copy: "Fuller, darker, beautifully lifted lashes.", category: "Brows & Lashes" },
  { name: "Reiki", copy: "Balance your energy and find harmony.", category: "Reiki" },
  { name: "Makeup Services", copy: "Enhance your natural beauty for any occasion.", category: "Makeup" },
  { name: "Massage Therapy", copy: "Relax, rejuvenate, and unwind.", category: "Massage" },
];

export default async function Home() {
  const content = await getWordPressHomeContent();
  return (
    <>
      <Link href="/services?category=Laser" className="flex min-h-16 items-center justify-center gap-5 bg-[#893d3e] px-5 text-center text-base font-medium text-white sm:text-xl">
        <Star size={20} strokeWidth={1.8} />
        <span>Now Offering Laser Hair Removal</span>
        <Star size={20} strokeWidth={1.8} />
      </Link>

      <section className="relative overflow-hidden bg-[#00032c]">
        <div className="relative mx-auto aspect-[1363/472] min-h-[250px] max-h-[590px] w-full max-w-[1536px]">
          <Image
            src={content.heroImage}
            alt="Tupelo Honey Spa and Wellness Collective"
            fill
            priority
            unoptimized
            className="object-cover object-center"
          />
        </div>
      </section>

      <section className="border-y border-[#893d3e]/10 bg-[#ead6cf] py-6 sm:py-7">
        <div className="container-site flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div>
            <span className="text-[.65rem] font-bold uppercase tracking-[.16em] text-[#893d3e]">New at Tupelo Honey</span>
            <h2 className="font-display mt-1 text-2xl text-[#33373d] sm:text-3xl">Meet our new YAG laser.</h2>
            <p className="mt-1 line-clamp-2 text-sm text-[#676767]">Ready for smoother skin? Book your laser appointment today.</p>
          </div>
          <Link href="/book?service=laser-hair-removal-consultation" className="button-secondary shrink-0 !min-h-[44px] !rounded-[3px]">Book Laser <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section className="bg-[#f6f5e9] py-20 sm:py-24">
        <div className="container-site grid gap-12 lg:grid-cols-[.78fr_1.22fr] lg:items-center">
          <div className="mx-auto grid aspect-square w-full max-w-[360px] place-items-center rounded-full border border-[#e3af23]/40 bg-white shadow-[0_24px_70px_#00032c0c]">
            <div className="grid h-28 w-28 place-items-center rounded-full bg-[#e3af23] text-white"><Gift size={46} strokeWidth={1.4} /></div>
          </div>
          <div>
            <span className="eyebrow">Give a little Tupelo Honey</span>
            <h2 className="font-display mt-5 text-5xl leading-none text-[#33373d] sm:text-6xl">{content.giftTitle}</h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#676767]">{content.giftCopy}</p>
            <Link href="/gift-cards" className="button-primary mt-8 !rounded-[3px]">Purchase a Gift Card <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="bg-[#00032c] py-20 text-center text-white sm:py-28">
        <div className="container-site max-w-4xl">
          <span className="text-xs font-bold uppercase tracking-[.18em] text-[#e3af23]">Our purpose</span>
          <h2 className="font-display mt-5 text-5xl sm:text-7xl">{content.purposeTitle}</h2>
          <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-white/75 sm:text-lg">{content.purposeCopy}</p>
          <Link href="/about" className="button-light mt-9 !rounded-[3px]">Learn About Tupelo Honey <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section className="bg-[#f6f5e9] py-20 sm:py-24">
        <div className="container-site">
          <div className="text-center"><span className="eyebrow justify-center before:hidden">Services for every body</span><h2 className="font-display mt-4 text-5xl text-[#33373d] sm:text-6xl">{content.offeringsTitle}</h2></div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {offerings.map((offering, index) => (
              <Link key={offering.name} href={`/services?category=${encodeURIComponent(offering.category)}`} className={`group flex min-h-[235px] flex-col justify-between rounded-2xl border p-7 transition hover:-translate-y-1 hover:shadow-[0_18px_50px_#00032c12] ${index === 6 ? "border-[#893d3e] bg-[#893d3e] text-white lg:col-start-2" : "border-[#e4ded4] bg-white text-[#33373d]"}`}>
                <Sparkles size={22} className={index === 6 ? "text-[#e3af23]" : "text-[#e3af23]"} />
                <div><h3 className="font-display text-2xl">{offering.name}</h3><p className={`mt-3 text-sm leading-6 ${index === 6 ? "text-white/75" : "text-[#676767]"}`}>{offering.copy}</p><span className={`mt-5 inline-flex items-center gap-2 text-xs font-bold ${index === 6 ? "text-[#e3af23]" : "text-[#893d3e]"}`}>View Services <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></span></div>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center"><Link href="/services" className="button-primary !rounded-[3px]">View All Services <ArrowRight size={16} /></Link></div>
        </div>
      </section>

      <section className="bg-white py-20 text-center sm:py-24">
        <div className="container-site"><h2 className="font-display text-4xl text-[#33373d] sm:text-6xl">Ready for a little time to yourself?</h2><p className="mx-auto mt-5 max-w-xl leading-7 text-[#676767]">Choose your service, specialist, and time—all in one easy flow.</p><Link href="/book" className="button-primary mt-8 !rounded-[3px]">Book Now <ArrowRight size={16} /></Link></div>
      </section>
    </>
  );
}
