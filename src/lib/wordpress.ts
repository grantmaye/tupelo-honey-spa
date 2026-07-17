import { activeTeam, type TeamMember } from "@/data/site";
import { rewriteWordPressUrl, wordpressSiteUrl, wordpressUrl } from "@/lib/wordpress-url";

type WordPressPage = {
  slug?: string;
  modified?: string;
  title?: { rendered?: string };
  content?: { rendered?: string };
};

export type WordPressHomeContent = {
  heroImage: string;
  announcementTitle: string;
  announcementCopy: string;
  giftTitle: string;
  giftCopy: string;
  purposeTitle: string;
  purposeCopy: string;
  offeringsTitle: string;
};

export type WordPressSpecialEventsContent = {
  title: string;
  paragraphs: string[];
  images: string[];
};

export type WordPressServicesIntro = {
  title: string;
  paragraphs: string[];
};

const profileSlugs: Record<string, string> = {
  julie: "julie-campanella",
  holli: "massages-by-holli",
  janell: "janell-dixon",
  jillian: "jillian-blaszkowiak",
  danni: "reiki-by-danni",
  abby: "abby-brown",
  alex: "alexandria",
  heather: "heather-roycroft",
};

const wordpressBase = (process.env.WORDPRESS_API_URL ?? `${wordpressSiteUrl}/wp-json/wp/v2`).replace(/\/$/, "");

const homeFallback: WordPressHomeContent = {
  heroImage: wordpressUrl("/wp-content/uploads/2023/09/tupelo-home-hero-1-1536x533.jpg"),
  announcementTitle: "Weekday appointments are now open.",
  announcementCopy: "Waxing, lash, and brow services are available to book now.",
  giftTitle: "The Perfect Gift!",
  giftCopy: "Give the gift of relaxation and self-care. Whether it’s for a special occasion or just because, a Tupelo Honey gift card is an easy way to make someone’s day a little sweeter.",
  purposeTitle: "Spa & Wellness Collective",
  purposeCopy: "At Tupelo Honey, we pride ourselves on creating a comfortable oasis where clients can take a break from the world. We’re dedicated to nurturing inner well-being, enhancing natural beauty, and helping every guest feel like the best version of themselves.",
  offeringsTitle: "What We Offer",
};

const eventsFallback: WordPressSpecialEventsContent = {
  title: "Special Events",
  paragraphs: [
    "Our parties and events are as unique as our guests. Dance, play dress up, try makeovers, learn a wellness practice, or make something to take home.",
    "Our staff has an abundance of talents to share. Send us a note and let’s create something together.",
  ],
  images: [
    wordpressUrl("/wp-content/uploads/2022/08/pse-1.jpg"),
    wordpressUrl("/wp-content/uploads/2022/08/pse-2.jpg"),
    wordpressUrl("/wp-content/uploads/2022/08/pse-3.jpg"),
  ],
};

const servicesFallback: WordPressServicesIntro = {
  title: "The Tupelo Honey experience.",
  paragraphs: ["Explore the services you already know, now organized in a cleaner and easier way. Search by treatment or browse a category."],
};

export async function getWordPressHomeContent(): Promise<WordPressHomeContent> {
  const page = await getWordPressPage("home-2");
  const html = page?.content?.rendered;
  if (!html) return homeFallback;

  const announcement = extractSection(html, /janell/i);
  const gift = extractSection(html, /perfect gift/i);
  const purpose = extractSection(html, /spa\s*&\s*wellness collective/i);
  const offerings = extractSection(html, /what we offer/i);
  return {
    heroImage: extractImages(html)[0] ?? homeFallback.heroImage,
    announcementTitle: announcement?.title ?? homeFallback.announcementTitle,
    announcementCopy: announcement?.paragraphs[0] ?? homeFallback.announcementCopy,
    giftTitle: gift?.title ?? homeFallback.giftTitle,
    giftCopy: gift?.paragraphs[0] ?? homeFallback.giftCopy,
    purposeTitle: purpose?.title ?? homeFallback.purposeTitle,
    purposeCopy: purpose?.paragraphs[0] ?? homeFallback.purposeCopy,
    offeringsTitle: offerings?.title ?? homeFallback.offeringsTitle,
  };
}

export async function getWordPressSpecialEventsContent(): Promise<WordPressSpecialEventsContent> {
  const page = await getWordPressPage("parties-special-events");
  const html = page?.content?.rendered;
  if (!html) return eventsFallback;
  const section = extractSection(html, /special events/i);
  const images = extractImages(html);
  return {
    title: section?.title ?? eventsFallback.title,
    paragraphs: section?.paragraphs.length ? section.paragraphs : eventsFallback.paragraphs,
    images: images.length >= 3 ? images.slice(0, 3) : eventsFallback.images,
  };
}

export async function getWordPressServicesIntro(): Promise<WordPressServicesIntro> {
  const page = await getWordPressPage("services");
  const html = page?.content?.rendered;
  if (!html) return servicesFallback;
  const section = extractSection(html, /enjoy the tupelo honey experience/i);
  return {
    title: section?.title ?? servicesFallback.title,
    paragraphs: section?.paragraphs.length ? section.paragraphs : servicesFallback.paragraphs,
  };
}

export async function getTeamWithWordPress(): Promise<TeamMember[]> {
  return Promise.all(activeTeam.map(getTeamMemberWithWordPress));
}

export async function getTeamMemberWithWordPress(member: TeamMember): Promise<TeamMember> {
  const wordpressSlug = profileSlugs[member.slug];
  if (!wordpressSlug) return member;

  try {
    const page = await getWordPressPage(wordpressSlug, `wordpress-profile-${member.slug}`);
    const html = page?.content?.rendered;
    if (!html) return member;

    const image = extract(html, /jet-team-member__figure[\s\S]*?<img[^>]+src=["']([^"']+)["']/i);
    const role = cleanText(extract(html, /jet-team-member__position[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i));
    const fullBio = extractBiography(html);

    return {
      ...member,
      image: rewriteWordPressUrl(image || member.image),
      role: role || member.role,
      fullBio: fullBio.length ? fullBio : member.fullBio,
    };
  } catch {
    return member;
  }
}

async function getWordPressPage(slug: string, tag = `wordpress-page-${slug}`) {
  try {
    const query = new URLSearchParams({ slug, _fields: "slug,modified,title,content" });
    const response = await fetch(`${wordpressBase}/pages?${query}`, {
      next: { revalidate: 300, tags: ["wordpress", tag] },
    });
    if (!response.ok) return undefined;
    return (await response.json() as WordPressPage[])[0];
  } catch {
    return undefined;
  }
}

function extractSection(html: string, titlePattern: RegExp) {
  const headings = [...html.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)].map((match) => ({
    index: match.index ?? 0,
    end: (match.index ?? 0) + match[0].length,
    title: cleanText(match[1]),
  }));
  const headingIndex = headings.findIndex((heading) => titlePattern.test(heading.title));
  if (headingIndex < 0) return undefined;
  const heading = headings[headingIndex];
  const end = headings[headingIndex + 1]?.index ?? html.length;
  const sectionHtml = html.slice(heading.end, end);
  return {
    title: heading.title,
    paragraphs: [...sectionHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((match) => cleanText(match[1])).filter(Boolean),
  };
}

function extractImages(html: string) {
  return [...new Set([...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map((match) => rewriteWordPressUrl(match[1])).filter(Boolean))];
}

function extractBiography(html: string) {
  const aboutIndex = html.search(/<h[1-6][^>]*>\s*About\s+/i);
  if (aboutIndex < 0) return [];
  const afterAbout = html.slice(aboutIndex);
  const editor = extract(afterAbout, /elementor-widget-text-editor[\s\S]*?elementor-widget-container[^>]*>([\s\S]*?)<\/div>/i);
  return [...editor.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => cleanText(match[1]))
    .filter(Boolean);
}

function extract(value: string, pattern: RegExp) {
  return value.match(pattern)?.[1]?.trim() ?? "";
}

function cleanText(value: string) {
  return decodeEntities(value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&quot;/g, "\"")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
