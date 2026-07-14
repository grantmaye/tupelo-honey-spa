import { categories as brandCategories, services as fallbackServices, team } from "@/data/site";
import { getSquareLocationId, isSquareConfigured, squareRequest } from "./client";
import type { SquareBookingData, SquareProvider, SquareService } from "./types";

type Money = { amount?: number; currency?: string };
type CatalogCategoryRef = { id?: string };
type CatalogVariation = {
  id?: string;
  version?: number;
  is_deleted?: boolean;
  present_at_all_locations?: boolean;
  present_at_location_ids?: string[];
  absent_at_location_ids?: string[];
  item_variation_data?: {
    name?: string;
    price_money?: Money;
    pricing_type?: string;
    service_duration?: number;
    available_for_booking?: boolean;
    team_member_ids?: string[];
  };
};
type CatalogItem = {
  id?: string;
  version?: number;
  is_deleted?: boolean;
  present_at_all_locations?: boolean;
  present_at_location_ids?: string[];
  absent_at_location_ids?: string[];
  item_data?: {
    name?: string;
    description?: string;
    description_html?: string;
    product_type?: string;
    categories?: CatalogCategoryRef[];
    variations?: CatalogVariation[];
  };
};
type CatalogCategory = { id?: string; category_data?: { name?: string } };
type CatalogSearchResponse = {
  items?: CatalogItem[];
  cursor?: string;
};
type CatalogObjectsResponse = {
  objects?: CatalogCategory[];
  cursor?: string;
};
type TeamProfile = { team_member_id?: string; display_name?: string; is_bookable?: boolean };
type TeamProfilesResponse = { team_member_booking_profiles?: TeamProfile[]; cursor?: string };

const fallbackDescription = "Personalized care from the Tupelo Honey team, tailored to your needs.";

export async function getSquareBookingData(): Promise<SquareBookingData> {
  if (!isSquareConfigured()) return fallbackData();

  try {
    const locationId = getSquareLocationId();
    const [items, categoryObjects, profiles] = await Promise.all([
      fetchAppointmentItems(locationId),
      fetchCategories(),
      fetchTeamProfiles(locationId),
    ]);
    const categoryNames = new Map(categoryObjects.flatMap((category) =>
      category.id && category.category_data?.name ? [[category.id, category.category_data.name] as const] : [],
    ));
    const services = mapServices(items, categoryNames, locationId);
    const providers = mapProviders(profiles, services);

    if (!services.length) return fallbackData();
    return {
      live: true,
      services,
      providers,
      categories: [...brandCategories, "Other"].filter((category) => services.some((service) => service.category === category)),
    };
  } catch {
    return fallbackData();
  }
}

export async function getSquareServiceBySlug(slug: string) {
  const data = await getSquareBookingData();
  return data.services.find((service) => service.slug === slug);
}

async function fetchAppointmentItems(locationId: string) {
  const items: CatalogItem[] = [];
  let cursor: string | undefined;
  do {
    const response = await squareRequest<CatalogSearchResponse>("/v2/catalog/search-catalog-items", {
      method: "POST",
      body: JSON.stringify({
        product_types: ["APPOINTMENTS_SERVICE"],
        enabled_location_ids: [locationId],
        limit: 100,
        cursor,
      }),
    });
    items.push(...(response.items ?? []));
    cursor = response.cursor;
  } while (cursor);
  return items;
}

async function fetchCategories() {
  const categories: CatalogCategory[] = [];
  let cursor: string | undefined;
  do {
    const query = new URLSearchParams({ types: "CATEGORY" });
    if (cursor) query.set("cursor", cursor);
    const response = await squareRequest<CatalogObjectsResponse>(`/v2/catalog/list?${query}`);
    categories.push(...(response.objects ?? []));
    cursor = response.cursor;
  } while (cursor);
  return categories;
}

async function fetchTeamProfiles(locationId: string) {
  const profiles: TeamProfile[] = [];
  let cursor: string | undefined;
  do {
    const query = new URLSearchParams({ bookable_only: "true", location_id: locationId, limit: "100" });
    if (cursor) query.set("cursor", cursor);
    const response = await squareRequest<TeamProfilesResponse>(`/v2/bookings/team-member-booking-profiles?${query}`);
    profiles.push(...(response.team_member_booking_profiles ?? []));
    cursor = response.cursor;
  } while (cursor);
  return profiles;
}

function mapServices(items: CatalogItem[], categoryNames: Map<string, string>, locationId: string) {
  const slugs = new Set<string>();
  const services: SquareService[] = [];

  for (const item of items) {
    if (!item.id || item.is_deleted || item.item_data?.product_type !== "APPOINTMENTS_SERVICE" || !isAtLocation(item, locationId)) continue;
    const itemName = item.item_data.name?.trim();
    if (!itemName) continue;
    const squareCategories = (item.item_data.categories ?? []).flatMap((category) => category.id ? [categoryNames.get(category.id) ?? ""] : []);

    for (const variation of item.item_data.variations ?? []) {
      const data = variation.item_variation_data;
      if (!variation.id || variation.is_deleted || !data?.available_for_booking || !isAtLocation(variation, locationId)) continue;
      const variationName = data.name?.trim() ?? "";
      const name = displayServiceName(itemName, variationName);
      const baseSlug = slugify(name) || `service-${variation.id.toLowerCase()}`;
      let slug = baseSlug;
      if (slugs.has(slug)) slug = `${baseSlug}-${variation.id.slice(-5).toLowerCase()}`;
      slugs.add(slug);

      services.push({
        slug,
        name,
        category: categorize(name, squareCategories),
        price: formatPrice(data.price_money, data.pricing_type),
        duration: formatDuration(data.service_duration),
        description: stripHtml(item.item_data.description_html ?? item.item_data.description ?? "") || fallbackDescription,
        squareItemId: item.id,
        squareVariationId: variation.id,
        squareVersion: variation.version ?? item.version ?? 0,
        providerIds: data.team_member_ids ?? [],
      });
    }
  }

  return services.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
}

function mapProviders(profiles: TeamProfile[], services: SquareService[]): SquareProvider[] {
  return profiles.flatMap((profile) => {
    if (!profile.team_member_id || !profile.display_name || !profile.is_bookable) return [];
    const member = matchTeamMember(profile.display_name);
    if (member?.externalBooking) return [];
    const serviceSlugs = services
      .filter((service) => !service.providerIds.length || service.providerIds.includes(profile.team_member_id!))
      .map((service) => service.slug);
    if (!serviceSlugs.length) return [];
    return [{
      squareId: profile.team_member_id,
      slug: member?.slug ?? `square-${profile.team_member_id.toLowerCase()}`,
      name: member?.name ?? profile.display_name,
      role: member?.role ?? "Tupelo Honey Specialist",
      externalBooking: member?.externalBooking,
      serviceSlugs,
    }];
  }).sort((a, b) => a.name.localeCompare(b.name));
}

function matchTeamMember(displayName: string) {
  const normalized = normalize(displayName);
  return team.find((member) => {
    const memberName = normalize(member.name);
    return memberName === normalized || memberName.includes(normalized) || normalized.includes(memberName) || memberName.split(" ")[0] === normalized.split(" ")[0];
  });
}

function fallbackData(): SquareBookingData {
  const providers: SquareProvider[] = team.filter((member) => !member.externalBooking).map((member) => ({
    squareId: "",
    slug: member.slug,
    name: member.name,
    role: member.role,
    serviceSlugs: fallbackServices.map((service) => service.slug),
  }));
  const services = fallbackServices.map((service) => ({
    ...service,
    squareItemId: "",
    squareVariationId: "",
    squareVersion: 0,
    providerIds: [],
  }));
  return { live: false, services, providers, categories: brandCategories };
}

function isAtLocation(object: { present_at_all_locations?: boolean; present_at_location_ids?: string[]; absent_at_location_ids?: string[] }, locationId: string) {
  if (object.absent_at_location_ids?.includes(locationId)) return false;
  return object.present_at_all_locations !== false || Boolean(object.present_at_location_ids?.includes(locationId));
}

function displayServiceName(itemName: string, variationName: string) {
  if (!variationName || /^(regular|default|standard)$/i.test(variationName) || normalize(variationName) === normalize(itemName)) return itemName;
  return `${itemName} — ${variationName}`;
}

function formatPrice(money?: Money, pricingType?: string) {
  if (pricingType === "VARIABLE_PRICING" || money?.amount === undefined) return "Price varies";
  const dollars = money.amount / 100;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: money.currency ?? "USD", maximumFractionDigits: dollars % 1 ? 2 : 0 }).format(dollars);
}

function formatDuration(milliseconds?: number) {
  if (!milliseconds) return undefined;
  const minutes = Math.round(milliseconds / 60_000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} hr ${remainder} min` : `${hours} hr`;
}

function categorize(name: string, squareCategories: string[]) {
  const value = normalize(`${name} ${squareCategories.join(" ")}`);
  if (/brow|lash|microblad/.test(value)) return "Brows & Lashes";
  if (/facial|dermaplan|peel|skin|microderm|acne/.test(value)) return "Facials";
  if (/laser/.test(value)) return "Laser";
  if (/makeup|bridal/.test(value)) return "Makeup";
  if (/massage|bodywork|reflex|cupping|lymph/.test(value)) return "Massage";
  if (/reiki|sound|meditat|energy/.test(value)) return "Reiki";
  if (/wax|brazil|bikini|hair removal/.test(value)) return "Waxing";
  return "Other";
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

function slugify(value: string) {
  return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function normalize(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}
