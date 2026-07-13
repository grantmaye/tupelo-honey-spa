import Image from "next/image";
import Link from "next/link";

export function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" aria-label="Tupelo Honey Spa home" data-on-dark={light || undefined} className="inline-flex shrink-0 items-center">
      <Image
        src="https://tupelohoneyspa.com/wp-content/uploads/2019/03/ths-logo-honey-300x56.png"
        alt="Tupelo Honey"
        width={300}
        height={56}
        unoptimized
        className="h-auto w-[220px] sm:w-[250px]"
        priority
      />
    </Link>
  );
}
