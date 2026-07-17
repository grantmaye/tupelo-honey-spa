# Tupelo Honey Spa — Go-Live Checklist

**Change window:** July 16, 2026, evening (America/New_York)  
**Change commander:** Grant Maye  
**Technical owner:** M1 Software  
**Legacy WordPress origin:** `157.245.0.152`  
**Production Vercel project:** `old-team-m/tupelo-honey-spa`

Do not change the public DNS until every **GO/NO-GO gate** is checked. Client approval authorizes the launch; it does not waive a failed technical gate.

## GO/NO-GO gates

- [ ] Cloudways on-demand backup completed and timestamp recorded.
- [ ] Current DNS zone exported or fully screenshotted.
- [ ] Cloudflare zone is created in a client-owned account (preferred), with M1 invited as administrator.
- [ ] Every existing DNS record has been copied into Cloudflare before changing nameservers.
- [ ] Namecheap uses the two assigned Cloudflare nameservers and Cloudflare reports the zone as Active.
- [ ] The legacy site still resolves correctly after the nameserver change and before the website cutover.
- [ ] `cms.tupelohoneyspa.com` resolves to `157.245.0.152`.
- [ ] Cloudways serves a valid TLS certificate for `cms.tupelohoneyspa.com`.
- [ ] WordPress admin, REST API, and three uploaded images work on the `cms` hostname.
- [ ] Correct Vercel project contains all required Production environment variables.
- [ ] `/api/square/health` returns HTTP 200 with `"connected": true`.
- [ ] A controlled Square appointment is created, visible in Square, and canceled.
- [ ] A controlled gift-card payment, activation, email delivery, and redemption-code display are verified; refund/void is completed if it is a test purchase.
- [ ] Contact form delivers to `tupelohoneyspa@gmail.com` and Reply works.
- [ ] Latest build passes and the approved Vercel deployment is READY.
- [ ] Desktop and mobile smoke tests pass with no critical console or runtime errors.
- [ ] Rollback owner has this document open and can access both DNS and Cloudways.

If any box above is unchecked, **NO-GO**. Keep the WordPress site live and continue remediation without changing the apex record.

## Correct Vercel environment variables

Set these in **Production** on `old-team-m/tupelo-honey-spa`, not the duplicate project:

- [ ] `SQUARE_ACCESS_TOKEN` — Sensitive, server only
- [ ] `SQUARE_ENVIRONMENT=production`
- [ ] `SQUARE_API_VERSION=2026-05-20`
- [ ] `SQUARE_LOCATION_ID`
- [ ] `NEXT_PUBLIC_SQUARE_APPLICATION_ID`
- [ ] `NEXT_PUBLIC_SQUARE_LOCATION_ID`
- [ ] `WORDPRESS_API_URL=https://cms.tupelohoneyspa.com/wp-json/wp/v2`
- [ ] `NEXT_PUBLIC_WORDPRESS_SITE_URL=https://cms.tupelohoneyspa.com`
- [ ] `WORDPRESS_REVALIDATE_SECRET` — Sensitive
- [ ] `RESEND_API_KEY` — Sensitive
- [ ] `GIFT_CARD_FROM_EMAIL` — verified sender
- [ ] `CONTACT_FROM_EMAIL` — verified sender
- [ ] `CONTACT_TO_EMAIL=tupelohoneyspa@gmail.com`

After any environment-variable change, redeploy before testing.

## Public DNS cutover

Only after all gates pass:

- [ ] Add `tupelohoneyspa.com` and `www.tupelohoneyspa.com` to the correct Vercel project.
- [ ] Copy the exact DNS values shown by Vercel; do not rely on remembered defaults.
- [ ] Create and edit website records in Cloudflare, not Namecheap Advanced DNS.
- [ ] Keep the apex and `www` Vercel records **DNS only** (gray cloud) during validation and launch.
- [ ] Keep `cms` DNS only during Cloudways TLS and WordPress-origin validation.
- [ ] Record cutover start time: __________ ET.
- [ ] Change only the apex `A` record from `157.245.0.152` to Vercel’s displayed value.
- [ ] Change `www` only if Vercel instructs it; preserve every unrelated record.
- [ ] Do not change nameservers.
- [ ] Verify apex and `www` from cellular data and a second network.
- [ ] Verify HTTPS and the intended canonical redirect.
- [ ] Keep the team in the change window for at least 60 minutes.

## Post-cutover smoke test

- [ ] `/`, `/services`, `/book`, `/gift-cards`, `/about`, `/team`, `/special-events`, and `/contact` return HTTP 200.
- [ ] Logo, hero, event gallery, and each active team photo load from `cms.tupelohoneyspa.com`.
- [ ] About menu closes correctly after pointer exit and works by keyboard/touch.
- [ ] Navigation starts each new route at the top.
- [ ] Square prices, durations, bookable providers, and availability are live.
- [ ] Alexandria Brown is absent and cannot be selected for booking.
- [ ] Holli’s button opens her independent Square site.
- [ ] Contact form sends exactly one email.
- [ ] Gift-card self-purchase shows no recipient message field.
- [ ] Vercel runtime logs show no recurring 4xx/5xx integration failures.

## Immediate rollback triggers

Rollback immediately for duplicate charges/bookings, credential exposure, security incidents, or customer-data leakage. Roll back if the public site, WordPress media/API, booking, or checkout remains critically broken for more than 10 minutes.

- [ ] Restore apex `A` to `157.245.0.152`.
- [ ] Restore `www` to its pre-change value (currently CNAME to the apex).
- [ ] Leave `cms` intact.
- [ ] Confirm the legacy WordPress homepage and booking links work.
- [ ] Record rollback time and reason.
- [ ] Notify the client that the legacy site is restored while remediation continues.

The current public DNS TTL is 1,800 seconds, so some visitors may remain on either version for up to roughly 30 minutes after a change or rollback.

## Domain ownership follow-up

- [ ] Client creates and secures their own Namecheap account with MFA.
- [ ] Use Namecheap **Change Ownership** to push the domain to the client account after launch stabilization.
- [ ] Confirm registrant contact, renewal payment, auto-renewal, and recovery details belong to the client.
- [ ] Keep the Cloudflare zone client-owned and retain M1 through delegated member access.

The later Namecheap account push should preserve the Cloudflare nameservers, so it is a separate administrative change and does not require another website cutover.
