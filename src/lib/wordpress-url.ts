const legacyWordPressSiteUrl = "https://tupelohoneyspa.com";

export const wordpressSiteUrl = (process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL ?? legacyWordPressSiteUrl).replace(/\/$/, "");

export function wordpressUrl(path: string) {
  return `${wordpressSiteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function rewriteWordPressUrl(value: string) {
  if (!value) return value;

  try {
    const url = new URL(value);
    if (url.origin === legacyWordPressSiteUrl) return `${wordpressSiteUrl}${url.pathname}${url.search}${url.hash}`;
  } catch {
    return value;
  }

  return value;
}
