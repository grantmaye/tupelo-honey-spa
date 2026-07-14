import { team, type TeamMember } from "@/data/site";

type WordPressPage = {
  slug?: string;
  modified?: string;
  title?: { rendered?: string };
  content?: { rendered?: string };
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

const wordpressBase = process.env.WORDPRESS_API_URL ?? "https://tupelohoneyspa.com/wp-json/wp/v2";

export async function getTeamWithWordPress(): Promise<TeamMember[]> {
  return Promise.all(team.map(getTeamMemberWithWordPress));
}

export async function getTeamMemberWithWordPress(member: TeamMember): Promise<TeamMember> {
  const wordpressSlug = profileSlugs[member.slug];
  if (!wordpressSlug) return member;

  try {
    const query = new URLSearchParams({ slug: wordpressSlug, _fields: "slug,modified,title,content" });
    const response = await fetch(`${wordpressBase}/pages?${query}`, {
      next: { revalidate: 300, tags: ["wordpress", `wordpress-profile-${member.slug}`] },
    });
    if (!response.ok) return member;
    const page = (await response.json() as WordPressPage[])[0];
    const html = page?.content?.rendered;
    if (!html) return member;

    const image = extract(html, /jet-team-member__figure[\s\S]*?<img[^>]+src=["']([^"']+)["']/i);
    const role = cleanText(extract(html, /jet-team-member__position[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i));
    const fullBio = extractBiography(html);

    return {
      ...member,
      image: image || member.image,
      role: role || member.role,
      fullBio: fullBio.length ? fullBio : member.fullBio,
    };
  } catch {
    return member;
  }
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
