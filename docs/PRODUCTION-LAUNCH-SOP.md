# Production Launch SOP

## Purpose

This SOP moves `tupelohoneyspa.com` from the legacy Cloudways-hosted WordPress frontend to the Next.js application on Vercel while retaining WordPress as the private editorial CMS and Square as the system of record for services, staff, availability, appointments, payments, and digital gift cards.

The launch is a controlled change. A backup, a verified WordPress origin, successful production transactions, and a tested rollback path are mandatory.

## Known starting state

State captured July 16, 2026:

- Apex `A`: `157.245.0.152`, TTL 1,800 seconds.
- `www`: CNAME to `tupelohoneyspa.com`, TTL 1,800 seconds.
- `cms.tupelohoneyspa.com`: not yet created.
- Authoritative DNS initially uses DigiCert DNS nameservers. The approved target is a client-owned Cloudflare zone, with Namecheap remaining the registrar.
- No apex MX records were returned during preflight. The website contact destination is currently Gmail, not domain-hosted inbox delivery.
- WordPress and its REST API are currently served from the apex hostname.
- Vercel production project: `old-team-m/tupelo-honey-spa` (`prj_DK4gYhLvxOBoVN7RrwxfwCzPxlik`).
- Known rollback Vercel deployment: `dpl_s2wfFcJx3jrPJJsrcpSG8FTtcyFC`.
- A duplicate Vercel project contains an earlier copy of the Square variables. It is not the public production project and must not be used for launch.

## Responsibilities

- **Change commander — Grant:** approves GO/NO-GO, operates DNS/Cloudways/secret dashboards, records times, and initiates rollback.
- **Technical owner — M1 Software:** prepares and deploys code, validates APIs and Vercel logs, runs smoke tests, and records evidence.
- **Client verifier:** confirms branding, live service/pricing data, received email, test appointment visibility, and gift-card behavior.

One person must announce every DNS or production-transaction action before it is performed. Do not make parallel unrecorded changes.

## Phase 1 — Freeze and protect

Target: T-90 to T-60 minutes.

1. Announce the maintenance window and freeze WordPress content, Square service/staff changes, and Vercel configuration changes.
2. In Cloudways, run an on-demand application/server backup. Record its completion timestamp and retention location.
3. Export the WordPress database and media/application backup if Cloudways exposes separate options.
4. Export the complete DNS zone or capture every record and value. Never reconstruct the zone from memory.
5. Record the current WordPress homepage response, REST response, SSL state, and legacy origin IP.
6. Record the current production Vercel deployment ID and verify that rollback/promote controls are available.
7. Open the Square appointments calendar and transactions dashboard for controlled-test verification.

Abort this phase if the Cloudways backup does not complete or the DNS zone cannot be recovered.

## Phase 1A — Move authoritative DNS to Cloudflare

Complete this before changing any website destination records.

1. Prefer a Cloudflare account owned by the client’s business email. Invite M1 with delegated administrative access instead of making M1 the permanent zone owner.
2. Add `tupelohoneyspa.com` to Cloudflare and select the appropriate plan.
3. Let Cloudflare scan the zone, then manually compare every A, AAAA, CNAME, MX, TXT, SRV, CAA, and verification record against the exported source zone.
4. Preserve the legacy website destination during this phase: apex `A` remains `157.245.0.152` and `www` remains a CNAME to the apex.
5. If DNSSEC is enabled at the current provider/registrar, follow Cloudflare’s onboarding instructions to remove the old DS configuration before the nameserver change.
6. At Namecheap, change only the nameserver setting to the two nameservers assigned by Cloudflare. Do not create production host records in Namecheap Advanced DNS after delegation.
7. Wait until Cloudflare reports the zone as **Active**. Verify the authoritative nameservers publicly and confirm the legacy website still works from two networks.
8. Keep website and `cms` records **DNS only** (gray cloud) throughout launch validation. This uses Cloudflare for authoritative DNS without stacking Cloudflare’s reverse proxy in front of Vercel.

Do not continue if Cloudflare is not Active, any source record is missing, or the legacy site/email behavior changed after delegation. Nameserver propagation can outlast tonight’s change window; if it does, stop with the legacy destination intact and resume after authority is stable.

## Phase 2 — Establish the headless WordPress origin

Target: T-60 to T-40 minutes.

1. In Cloudflare DNS, create `cms.tupelohoneyspa.com` as a DNS-only `A` record to `157.245.0.152`.
2. In Cloudways, add `cms.tupelohoneyspa.com` to the existing WordPress application as an additional/canonical domain as appropriate.
3. Provision and validate TLS for `cms.tupelohoneyspa.com`.
4. If WordPress `home`/`siteurl` is changed to `cms`, take the database backup first and verify `/wp-admin` login immediately afterward.
5. Validate all of the following over HTTPS:
   - `https://cms.tupelohoneyspa.com/wp-admin/`
   - `https://cms.tupelohoneyspa.com/wp-json/wp/v2/pages?per_page=1`
   - one logo URL
   - one hero/gallery URL
   - one team-profile photo URL
6. Confirm the response is coming from Cloudways, not Vercel.

Do not continue if the `cms` REST API or media requires the public apex to remain pointed at Cloudways.

## Phase 3 — Configure and deploy Vercel

Target: T-40 to T-25 minutes.

1. Open `https://vercel.com/old-team-m/tupelo-honey-spa/settings/environment-variables`.
2. Enter the variables in the checklist on the correct project and Production environment. Mark only true secrets Sensitive.
3. Set both WordPress URLs to the tested `cms` hostname.
4. Redeploy the approved commit. Do not promote an older deployment merely because it built successfully.
5. Confirm build, type checking, static generation, and deployment status are all successful.
6. Verify the unique deployment URL before touching domains.
7. Check `/api/square/health`; require HTTP 200 and `connected: true`.
8. Confirm WordPress content and every image category load through the `cms` hostname.

## Phase 4 — Production integration tests

Target: T-25 to T-10 minutes.

### Appointment test

1. Use the approved controlled test customer.
2. Select Julie and Leg Wax, using an available afternoon slot.
3. Submit once. Do not double-click or open duplicate checkout tabs.
4. Record the website confirmation ID.
5. Confirm the appointment appears once in Square with the correct customer, provider, service, location, and time.
6. Cancel the appointment in Square and confirm its status changes. Record the canceled booking ID.

### Gift-card test

1. Use the smallest allowed controlled amount and a test recipient inbox.
2. Confirm exactly one payment, one order, one digital gift card, and one activation activity exist in Square.
3. Confirm the email arrives and the redemption code matches Square.
4. Confirm a self-purchase does not show an irrelevant gift-note field.
5. Refund/void the test transaction if the client does not want it retained, then confirm the final Square state.

### Contact test

1. Submit a unique subject/message token through the website.
2. Confirm one message arrives at `tupelohoneyspa@gmail.com`.
3. Reply and confirm the response is addressed to the visitor’s email.

Any duplicate transaction, orphaned payment, wrong provider/service, or missing delivery is a **NO-GO**.

## Phase 5 — Add domains and cut over DNS

Target: T-10 to T+30 minutes.

1. Add the apex and `www` domains to `old-team-m/tupelo-honey-spa` in Vercel.
2. Copy the exact DNS targets Vercel displays at launch time.
3. Ensure Vercel shows the intended production deployment for both hostnames.
4. Record the start time.
5. In Cloudflare DNS, change the apex `A` record from `157.245.0.152` to Vercel’s required value and leave Proxy status **DNS only**.
6. Change `www` only as Vercel instructs and leave it DNS only. Preserve Cloudflare nameservers, verification TXT records, and every unrelated record.
7. Watch DNS and Vercel domain status until both hostnames validate and HTTPS is issued.
8. Test on a second network and cellular data to sample different resolvers.
9. Verify one canonical host strategy: either apex redirects to `www`, or `www` redirects to apex. Avoid two independently indexable copies.

Mixed traffic is expected for about one TTL. Do not diagnose an isolated old response as failure until its resolver cache is identified.

## Phase 6 — Post-launch validation and monitoring

Target: T+0 to T+60 minutes, then next morning.

1. Run every item in the post-cutover smoke test.
2. Monitor Vercel runtime logs continuously for the first 15 minutes and again at 30 and 60 minutes.
3. Check Square for duplicate bookings, failed payments, refunds, and gift-card activation errors.
4. Check contact and gift-card email delivery logs.
5. Confirm WordPress publishing and cache revalidation work from the new `cms` origin.
6. Confirm sitemap, robots rules, page titles, canonical metadata, social sharing image, and favicon on the public domain.
7. Record launch completion time, deployment ID, DNS values, test booking ID/status, test payment/refund IDs, and verifier names.
8. Repeat key page, booking availability, and error-log checks the next morning.

Keep the legacy Cloudways application and backup available for at least seven days. Do not delete the duplicate Vercel project or rotate credentials during the active launch window; clean those up in a separate controlled change.

## Post-launch ownership transfer

The domain registration should ultimately belong to the client even if M1 continues managing the website.

1. Have the client create a Namecheap account under their business-controlled email, enable MFA, complete profile/registrant information, and add a renewal payment method.
2. After the launch has been stable for at least seven days, use Namecheap **Sharing & Transfer → Change Ownership** to push the domain to the client’s Namecheap username/account.
3. Confirm the client accepts the ownership invitation and verify expiration date, auto-renewal, registrant contacts, domain privacy, and recovery settings.
4. Verify the Cloudflare nameservers remain unchanged. A Namecheap account push should not require DNS or hosting changes.
5. Keep the Cloudflare zone in the client-owned Cloudflare account and manage it through invited M1 access. If the zone was created in an M1-owned account, schedule a separate documented Cloudflare account migration rather than improvising it during launch.

## Rollback procedure

### DNS rollback

Use when the Vercel app, WordPress origin, or a critical customer flow cannot be restored quickly.

1. Announce rollback and stop further production tests.
2. Restore the apex `A` record to `157.245.0.152`.
3. Restore `www` to its pre-launch CNAME-to-apex configuration.
4. Preserve the `cms` record so debugging and editorial access continue.
5. Verify the legacy WordPress homepage, images, navigation, and its external booking paths.
6. Monitor for one full TTL and record the time, reason, and symptoms.

### Application rollback

Use when DNS and domains are healthy but the latest code is defective.

1. Promote the last known-good deployment in the same Vercel project.
2. Confirm environment variables remain attached to the promoted deployment.
3. Re-run health, page, booking, checkout, and contact checks.
4. If the problem persists beyond 10 minutes, perform the DNS rollback.

### Security or transaction rollback

For exposed secrets, customer-data leakage, duplicate bookings, or duplicate/incorrect charges:

1. Disable the affected route or restore the legacy site immediately.
2. Stop further tests.
3. Preserve Vercel and Square logs and transaction identifiers.
4. Rotate the exposed credential in Square/Vercel and redeploy.
5. Reconcile every affected booking/payment with the client before resuming launch.

## Launch record

- Backup completed: ____________________ ET
- Approved commit: ____________________
- Production deployment: ____________________
- `cms` verified: ____________________ ET
- Square health verified: ____________________ ET
- Controlled appointment ID / canceled: ____________________
- Gift-card payment / refund ID: ____________________
- Contact delivery verified by: ____________________
- DNS cutover: ____________________ ET
- Monitoring complete: ____________________ ET
- Final outcome: GO / ROLLBACK
- Notes: ________________________________________________________________
