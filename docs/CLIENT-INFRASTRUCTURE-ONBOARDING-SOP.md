# Client Infrastructure Onboarding and Ownership SOP

## Purpose

This SOP standardizes M1 Software client launches involving an existing domain, DNS, email, website, CMS, and third-party business systems. The client owns the business assets; M1 receives delegated administrative access and remains the technical manager under the service agreement.

## Non-negotiable ownership model

- The client is the legal owner of the domain, DNS zone, production hosting, business email, CMS, payment/booking accounts, analytics, and source repository.
- Accounts are created with a client-controlled business email whenever the provider permits it.
- M1 is invited as an administrator, developer, or technical partner. Do not share the client's password or make M1's personal account the only owner.
- Both parties enable MFA. Recovery codes are stored in the client's approved password vault, with an M1-managed vault entry only when the support agreement authorizes it.
- The client supplies the payment method for renewals. M1 monitors expiration and configuration but does not become the accidental owner by paying indefinitely from an employee card.
- Every system must have at least two recoverable administrators: the client owner and an M1 operations identity.

## Standard target stack

| Layer | Owner | M1 access | Standard role |
| --- | --- | --- | --- |
| Registrar | Client | Delegated manager where supported | Registration, renewal, registrant data |
| Cloudflare | Client | Administrator/DNS | Authoritative DNS, security, DNSSEC |
| Vercel | Client or client organization | Project/team member | Production frontend and APIs |
| WordPress/Cloudways | Client | Application/admin access | Headless CMS and media origin |
| Business email | Client | Mail/domain administrator | Human mailbox and replies |
| Square | Client | Developer/team access | Catalog, appointments, payments |
| GitHub | Client or M1 organization per contract | Maintainer | Source, reviews, deployment history |
| Analytics/Search | Client | Administrator | Measurement and search ownership |

If the commercial agreement makes M1 the managed-service owner of a platform, document that exception, the export path, and the transfer procedure in the client record.

## Intake: information required before work begins

Send one secure intake request. Never ask the client to email passwords or API tokens.

1. Legal business name, owner, billing contact, and technical approver.
2. Domain names, registrar, expiration dates, auto-renewal state, and registrant email.
3. Current DNS provider and a full zone export.
4. Current website host, CMS, repository, CDN, analytics, and tag manager.
5. Every business email address, alias, forwarding rule, mailing list, and sending service.
6. Payment, booking, CRM, marketing, forms, and automation platforms.
7. Existing SPF, DKIM, DMARC, verification, MX, SRV, CAA, and DNSSEC records.
8. Written authorization naming M1 as the technical implementation partner.
9. A maintenance window, rollback approver, and client-side acceptance tester.

## Access workflow for an existing client-owned stack

The client should not be expected to perform technical configuration. Their job is to grant access; M1 performs and documents the work.

1. Hold a 20–30 minute recorded onboarding call with the owner or authorized administrator.
2. Have the client sign in to each provider themselves. Use the provider's **Invite user**, **Delegate access**, **Share access**, or **Add team member** function.
3. Invite a named M1 operations account using the least privilege that can complete the project.
4. When a provider has no delegation feature, use one of these controlled fallbacks:
   - supervised screen share while the client remains signed in;
   - a temporary vault share that expires after onboarding;
   - a provider-supported account transfer into a new client-owned account.
5. Never send credentials in chat, email, project tickets, source code, or screenshots.
6. Verify access from M1's account before ending the call.
7. Record the provider, account owner, M1 role, MFA state, recovery owner, renewal owner, and date granted in the access register.
8. Rotate any temporary password and revoke temporary shares when onboarding is complete.

## Domain and DNS migration procedure

1. Confirm the registrar and authoritative nameservers publicly.
2. Export the complete live zone and capture DNSSEC/DS state before making changes.
3. Create or confirm a client-owned Cloudflare account and invite M1 as administrator.
4. Import the zone, then manually reconcile every record against the source export.
5. Preserve website and email destinations while nameservers change.
6. Remove or update legacy DS records only according to the old and new DNS providers' DNSSEC instructions.
7. Change nameservers at the registrar. Do not maintain a second competing DNS zone at the registrar after delegation.
8. Wait for Cloudflare to report Active and verify NS, website, email, and critical third-party records publicly.
9. Enable DNSSEC after authority is stable, then publish the Cloudflare DS record at the registrar.
10. Record the final nameservers, DNSSEC state, zone export, and rollback values.

## Website and headless WordPress procedure

1. Back up the existing website, database, media, and server configuration.
2. Keep WordPress on a dedicated origin such as `cms.example.com` with valid TLS.
3. Confirm `/wp-admin`, the REST API, media URLs, and publishing before moving the public domain.
4. Configure production environment variables in Vercel; secrets must be server-only and marked Sensitive.
5. Deploy and test on the Vercel deployment URL before adding public domains.
6. Add apex and `www` to Vercel, use the exact DNS targets Vercel supplies, and select one canonical hostname.
7. Validate HTTPS, redirects, metadata, analytics, forms, CMS revalidation, and rollback.

## Business email procedure

1. Inventory every mailbox and sender before changing DNS. Never replace MX records until the existing mail destination is known.
2. Create mailboxes and aliases in the client-owned email service.
3. Publish provider-supplied MX records and `autodiscover`/client-discovery records as DNS-only.
4. Publish exactly one SPF record at the apex. Merge all approved sending services into that record; do not create multiple SPF TXT records.
5. Request and publish DKIM selectors for every service that sends as the client domain.
6. Start DMARC in monitoring mode: `p=none`, relaxed alignment, and a monitored aggregate-report address.
7. Test inbound delivery from an unrelated external account, mailbox retention, forwarding, outbound SMTP/webmail, replies, and spam-folder placement.
8. Inspect a received message's authentication results for SPF, DKIM, and DMARC pass/alignment.
9. After 2–4 weeks of clean reports, move to `p=quarantine`; later move to `p=reject` when every legitimate sender is aligned.
10. Keep human mailbox email separate from application email. Use a transactional service such as Resend for website forms and notifications, with its own authenticated subdomain where practical.

## Tupelo Honey reference configuration

- Registrar: Namecheap; eventual registrant/account ownership belongs to Julie/Tupelo Honey.
- Authoritative DNS: client-owned Cloudflare zone; M1 retains delegated administrator access.
- Public site: Vercel at `tupelohoneyspa.com`; `www` redirects to the apex.
- CMS: Cloudways WordPress at `cms.tupelohoneyspa.com`.
- Human mailbox: Rackspace/Cloudways `hello@tupelohoneyspa.com`, retained in the mailbox and forwarded to `tupelohoneyspa@gmail.com`.
- MX: `mx1.emailsrvr.com` priority 10 and `mx2.emailsrvr.com` priority 20.
- SPF: `v=spf1 include:emailsrvr.com ~all`.
- DKIM selector: `20260717-pudqvgtx`.
- DMARC initial policy: `v=DMARC1; p=none; rua=mailto:hello@tupelohoneyspa.com; adkim=r; aspf=r; pct=100`.
- Booking/catalog/payment system: client-owned Square production account; M1 uses delegated developer access and Vercel server secrets.

## Verification gate

Do not call onboarding complete until all of these pass:

- Registrar owner, renewal, MFA, and recovery contact documented.
- Cloudflare active; zone exported; DNSSEC state documented.
- Apex, `www`, CMS, TLS, canonical redirects, and rollback tested.
- Email inbound, forwarding, retained copy, outbound, SPF, DKIM, and DMARC verified.
- Vercel production deployment and environment ownership verified.
- WordPress editor login, REST API, media, and cache revalidation tested.
- Square health, catalog, availability, controlled booking/cancellation, and payment boundaries tested.
- Client has completed an acceptance test and knows whom to contact.
- Access register and system diagram are stored in the client record.

## Handoff while M1 remains the manager

1. Transfer or create each asset in Julie's/client-owned account—not merely an email address controlled by M1.
2. Invite M1's role-based operations account with only the privileges required by the support plan.
3. Verify Julie can sign in, use MFA, access recovery codes, see billing, and identify renewal dates.
4. Provide a one-page ownership register listing each system, owner, billing party, M1 role, recovery path, and support contact.
5. Provide an emergency runbook: website rollback, DNS recovery, email outage, compromised credentials, and Square escalation.
6. Schedule quarterly access and renewal reviews. Remove departed staff and rotate shared or exposed credentials.
7. On termination, export code/content/configuration, transfer any contractually client-owned M1 assets, remove M1 users, and obtain written acceptance.

Julie should own Namecheap, Cloudflare, Cloudways/Rackspace, Square, and the production Vercel organization. M1 should remain an invited administrator. GitHub ownership follows the software agreement, but Julie must receive a documented export/continuity right even when the repository remains in M1's organization.

## Setup-fee scope

The setup fee covers discovery, access recovery, zone and sender inventory, backups, migrations, DNS/email authentication, controlled testing, documentation, and ownership handoff. Quote exceptions separately when there is no recoverable owner, the domain is locked or disputed, mailboxes require migration, multiple sending platforms need alignment, or a legacy provider cannot delegate access.

## Client access register template

| System | Client owner email | M1 role | MFA | Billing owner | Recovery owner | Renewal/date | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Registrar |  |  |  |  |  |  |  |
| Cloudflare |  |  |  |  |  |  |  |
| Hosting/CMS |  |  |  |  |  |  |  |
| Vercel |  |  |  |  |  |  |  |
| Email |  |  |  |  |  |  |  |
| Square |  |  |  |  |  |  |  |
| GitHub |  |  |  |  |  |  |  |
| Analytics/Search |  |  |  |  |  |  |  |

## Change record

- Client/project: ____________________
- Date: ____________________
- Change owner: ____________________
- Source zone export: ____________________
- Backup location: ____________________
- Approved maintenance window: ____________________
- Production deployment/commit: ____________________
- Email authentication verified: ____________________
- Client acceptance: ____________________
- Ownership register delivered: ____________________
- Follow-up review date: ____________________
